"use client";

/**
 * Preparing a file in the browser before it's sent.
 *
 * A photo straight off a phone is routinely 8–12 MP and several megabytes, and
 * none of that resolution survives being displayed at a few hundred pixels inside
 * a scrapbook page or a puzzle piece. Re-encoding it here makes uploads fast,
 * keeps disk use sane, and means the size limits are almost never reached by a
 * person doing something reasonable.
 *
 * It is deliberately conservative: the original is kept whenever shrinking it
 * would be pointless or lossy for no gain, and any failure falls back to sending
 * the file untouched rather than blocking the upload.
 */

/** Longest edge, in CSS pixels. Generous enough to stay sharp on a 2× display. */
const MAX_EDGE = 2400;
/** Below this, re-encoding costs quality and saves nothing worth having. */
const SKIP_BELOW_BYTES = 900 * 1024;

function canReencode(type: string): boolean {
  /* Canvas can't reliably decode HEIC/HEIF outside Safari, and re-encoding a GIF
     would throw away its animation. */
  return type === "image/jpeg" || type === "image/png" || type === "image/webp";
}

async function loadBitmap(file: File): Promise<ImageBitmap | HTMLImageElement> {
  if (typeof createImageBitmap === "function") {
    return createImageBitmap(file);
  }
  const url = URL.createObjectURL(file);
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("decode failed"));
      img.src = url;
    });
  } finally {
    /* Revoked after the image has decoded; the bitmap no longer needs the URL. */
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

/**
 * Shrink an oversized image. Returns the original file when there is nothing
 * worth doing, so callers can always just use the result.
 */
export async function prepareImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (!canReencode(file.type)) return file;
  if (file.size <= SKIP_BELOW_BYTES) return file;

  try {
    const source = await loadBitmap(file);
    const width = "width" in source ? source.width : 0;
    const height = "height" in source ? source.height : 0;
    if (!width || !height) return file;

    const scale = Math.min(1, MAX_EDGE / Math.max(width, height));
    /* Already small enough, and small enough in bytes was handled above — but a
       2 MB 1000px PNG still benefits from becoming a JPEG. */
    const targetW = Math.round(width * scale);
    const targetH = Math.round(height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = targetW;
    canvas.height = targetH;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(source as CanvasImageSource, 0, 0, targetW, targetH);
    if ("close" in source) source.close();

    /* PNGs of photographs are enormous; PNGs of drawings need their sharp edges
       and their transparency. Keep PNG only when it might actually be one. */
    const keepPng = file.type === "image/png" && targetW * targetH < 1_200_000;
    const outType = keepPng ? "image/png" : "image/jpeg";

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, outType, outType === "image/jpeg" ? 0.88 : undefined)
    );
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + (outType === "image/png" ? ".png" : ".jpg");
    return new File([blob], name, { type: outType, lastModified: file.lastModified });
  } catch {
    /* A file we can't decode is the server's problem to accept or refuse — not a
       reason to stop the person uploading it. */
    return file;
  }
}

/**
 * Send a file and get back the URL it can be referenced by.
 * Throws an `Error` whose message is safe to show to a person.
 */
export async function uploadFile(giftId: string, file: File): Promise<string> {
  const prepared = await prepareImage(file);

  const body = new FormData();
  body.set("giftId", giftId);
  body.set("file", prepared);

  const res = await fetch("/api/upload", { method: "POST", body });

  if (!res.ok) {
    let message = "Couldn't upload that file.";
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      /* Non-JSON error body — the default message stands. */
    }
    throw new Error(message);
  }

  const data = (await res.json()) as { url?: string };
  if (!data.url) throw new Error("The upload finished but came back empty. Try again.");
  return data.url;
}
