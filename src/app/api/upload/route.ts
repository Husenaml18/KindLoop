import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { MAX_UPLOAD_BYTES, UploadError, saveUploadedFile } from "@/lib/uploads";

/**
 * Uploads go through a route handler rather than a Server Action.
 *
 * Server Actions cap their request body at 1 MB, which any photo off a modern
 * phone exceeds — and it fails as an unhandled rejection rather than something a
 * person can act on. A route handler has no such cap, so the real limits are the
 * ones in `uploads.ts`, and every failure comes back as a readable message.
 *
 * Ownership is re-checked here and not merely in the proxy: this endpoint is
 * reachable by direct POST regardless of what the UI is showing.
 */
export async function POST(request: Request) {
  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "Please sign in again." }, { status: 401 });
  }

  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_UPLOAD_BYTES * 1.05) {
    return Response.json(
      { error: `That file is too large — the limit is ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)} MB.` },
      { status: 413 }
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "That upload didn't arrive in one piece. Try again." }, { status: 400 });
  }

  const giftId = form.get("giftId");
  const file = form.get("file");

  if (typeof giftId !== "string" || !giftId) {
    return Response.json({ error: "Missing gift." }, { status: 400 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "No file was attached." }, { status: 400 });
  }

  const gift = await prisma.gift.findUnique({ where: { id: giftId }, select: { ownerId: true } });
  if (!gift || gift.ownerId !== user.id) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }

  try {
    const { url } = await saveUploadedFile(file, giftId);
    return Response.json({ url });
  } catch (error) {
    if (error instanceof UploadError) {
      return Response.json({ error: error.message }, { status: 415 });
    }
    console.error("upload failed", error);
    return Response.json({ error: "Couldn't save that file. Try again." }, { status: 500 });
  }
}
