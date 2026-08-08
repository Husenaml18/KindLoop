import "server-only";

/**
 * Where uploaded files actually go.
 *
 * Two drivers behind one interface, chosen by whether a blob token exists:
 *
 *   - **disk** — writes under `uploads/` and serves through `/api/media`. What
 *     this has always done, and what still runs locally. No account, no network,
 *     works offline.
 *   - **blob** — Vercel Blob. What runs in production, because a serverless
 *     filesystem is read-only apart from `/tmp` and is discarded between
 *     requests: every write either fails or vanishes.
 *
 * Chosen at runtime rather than by build flag so the two environments run the
 * same code path, and so nothing needs configuring to work on a laptop. The
 * moment `BLOB_READ_WRITE_TOKEN` is present, uploads go remote — no code change,
 * no redeploy of a different variant.
 *
 * Everything above this file — `uploads.ts`, the route handler, all ten editors —
 * is unaware of which driver is live. That is the point: swapping Vercel Blob for
 * R2 or S3 later is this file and nothing else.
 */

import { mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

export const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

/** True when remote storage is configured. */
export const isRemoteStorage = Boolean(process.env.BLOB_READ_WRITE_TOKEN);

export interface StoredFile {
  /** What goes into the gift's content and eventually into an `<img>`. */
  url: string;
}

/**
 * Write one file for one gift.
 *
 * `pathname` is scoped by gift id in both drivers, so deleting a gift can delete
 * its media by prefix without a manifest to keep in step.
 */
export async function putFile(
  giftId: string,
  filename: string,
  file: File
): Promise<StoredFile> {
  if (isRemoteStorage) {
    /* Imported lazily so a local install with no blob token never loads the SDK
       and never needs the env var to exist. */
    const { put } = await import("@vercel/blob");
    const { url } = await put(`gifts/${giftId}/${filename}`, file, {
      access: "public",
      /* The filename is already a nanoid, so a second random suffix would only
         make the URL longer and the file harder to find when debugging. */
      addRandomSuffix: false,
      contentType: file.type,
    });
    return { url };
  }

  const dir = path.join(UPLOADS_ROOT, giftId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return { url: `/api/media/${giftId}/${filename}` };
}

/**
 * Remove everything belonging to a gift.
 *
 * Called when a gift or a whole account is deleted. Failing here must not block
 * that deletion — a person asking to be forgotten should be, even if a storage
 * call times out; an orphaned file is a cleanup job, not a reason to refuse.
 */
export async function deleteGiftFiles(giftId: string): Promise<void> {
  try {
    if (isRemoteStorage) {
      const { list, del } = await import("@vercel/blob");
      const { blobs } = await list({ prefix: `gifts/${giftId}/` });
      if (blobs.length > 0) await del(blobs.map((b) => b.url));
      return;
    }
    /*
     * The traversal guard, carried over from the code this replaced.
     *
     * Gift ids are cuids from the database, so in practice nothing hostile ever
     * arrives here — but this function's whole job is recursive deletion, and a
     * guard that is only load-bearing on the day something upstream changes is
     * exactly the guard worth keeping.
     */
    const dir = path.resolve(UPLOADS_ROOT, giftId);
    if (dir === UPLOADS_ROOT || !dir.startsWith(UPLOADS_ROOT + path.sep)) return;
    await rm(dir, { recursive: true, force: true });
  } catch (error) {
    console.error(`could not remove media for gift ${giftId}`, error);
  }
}
