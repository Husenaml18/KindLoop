import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { generateFilename } from "@/lib/slug";

export const UPLOADS_ROOT = path.join(process.cwd(), "uploads");

/**
 * What may be uploaded, and what it gets written out as.
 *
 * Audio and video are here because several experiences ask for a voice note or a
 * short clip — an editor that offers an upload the server then refuses is worse
 * than not offering it at all. HEIC is accepted as-is: iPhones shoot it by
 * default and most browsers can't re-encode it, so rejecting it would lock out a
 * whole platform's camera roll.
 */
const EXTENSION_BY_MIME: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/avif": "avif",
  "image/heic": "heic",
  "image/heif": "heif",

  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "audio/x-m4a": "m4a",
  "audio/aac": "aac",
  "audio/wav": "wav",
  "audio/x-wav": "wav",
  "audio/webm": "weba",
  "audio/ogg": "ogg",

  "video/mp4": "mp4",
  "video/webm": "webm",
  "video/quicktime": "mov",
};

/** Per-kind ceilings. A voice note is small; a clip of a birthday is not. */
const MAX_BYTES = {
  image: 12 * 1024 * 1024,
  audio: 20 * 1024 * 1024,
  video: 80 * 1024 * 1024,
} as const;

export const MAX_UPLOAD_BYTES = Math.max(...Object.values(MAX_BYTES));

export function isAllowedUploadType(mime: string): boolean {
  return mime in EXTENSION_BY_MIME;
}

function kindOf(mime: string): keyof typeof MAX_BYTES {
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";
  return "image";
}

/** Thrown for anything a person could fix by picking a different file. */
export class UploadError extends Error {}

export async function saveUploadedFile(file: File, giftId: string) {
  const extension = EXTENSION_BY_MIME[file.type];
  if (!extension) {
    throw new UploadError(
      file.type ? `Can't use ${file.type} files here.` : "That file type isn't supported."
    );
  }

  const kind = kindOf(file.type);
  const limit = MAX_BYTES[kind];
  if (file.size > limit) {
    throw new UploadError(
      `That ${kind} is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is ${Math.round(limit / 1024 / 1024)} MB.`
    );
  }

  const filename = `${generateFilename()}.${extension}`;
  const giftDir = path.join(UPLOADS_ROOT, giftId);
  await mkdir(giftDir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(giftDir, filename), buffer);

  return { url: `/api/media/${giftId}/${filename}` };
}
