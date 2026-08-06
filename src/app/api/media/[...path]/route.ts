import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import path from "node:path";
import { UPLOADS_ROOT } from "@/lib/uploads";

const CONTENT_TYPE_BY_EXTENSION: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".heic": "image/heic",
  ".heif": "image/heif",

  ".mp3": "audio/mpeg",
  ".m4a": "audio/mp4",
  ".aac": "audio/aac",
  ".wav": "audio/wav",
  ".weba": "audio/webm",
  ".ogg": "audio/ogg",

  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".mov": "video/quicktime",
};

/** `bytes=0-1023`, `bytes=500-`, `bytes=-500`. Anything else is ignored. */
function parseRange(header: string, size: number): { start: number; end: number } | null {
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!match) return null;
  const [, rawStart, rawEnd] = match;

  let start: number;
  let end: number;
  if (rawStart === "") {
    if (rawEnd === "") return null;
    start = Math.max(0, size - Number(rawEnd));
    end = size - 1;
  } else {
    start = Number(rawStart);
    end = rawEnd === "" ? size - 1 : Math.min(Number(rawEnd), size - 1);
  }

  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= size) return null;
  return { start, end };
}

export async function GET(
  request: Request,
  context: RouteContext<"/api/media/[...path]">
) {
  const { path: segments } = await context.params;

  const resolved = path.resolve(UPLOADS_ROOT, ...segments);
  if (
    resolved !== UPLOADS_ROOT &&
    !resolved.startsWith(UPLOADS_ROOT + path.sep)
  ) {
    return new Response("Not found", { status: 404 });
  }

  const extension = path.extname(resolved).toLowerCase();
  const contentType = CONTENT_TYPE_BY_EXTENSION[extension];
  if (!contentType) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const fileStat = await stat(resolved);
    if (!fileStat.isFile()) return new Response("Not found", { status: 404 });

    const rangeHeader = request.headers.get("range");
    const range = rangeHeader ? parseRange(rangeHeader, fileStat.size) : null;

    if (rangeHeader && !range) {
      return new Response(null, {
        status: 416,
        headers: { "Content-Range": `bytes */${fileStat.size}` },
      });
    }

    const { start, end } = range ?? { start: 0, end: Math.max(0, fileStat.size - 1) };

    /* Streamed rather than read into a buffer: a video clip can be tens of
       megabytes, and buffering all of it per request would not survive two
       people watching at once. `Accept-Ranges` is what lets a player seek
       instead of having to fetch the whole file before it will scrub. */
    const stream = Readable.toWeb(
      createReadStream(resolved, { start, end })
    ) as ReadableStream<Uint8Array>;

    return new Response(stream, {
      status: range ? 206 : 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "private, max-age=31536000, immutable",
        "Accept-Ranges": "bytes",
        "Content-Length": String(fileStat.size === 0 ? 0 : end - start + 1),
        ...(range ? { "Content-Range": `bytes ${start}-${end}/${fileStat.size}` } : {}),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
