"use client";

import { useRef, useState } from "react";
import type { PhotoContent } from "./photoContentSchema";

export function PhotoContentEditor({
  value,
  onChange,
  uploadPhoto,
}: {
  value: PhotoContent;
  onChange: (value: PhotoContent) => void;
  uploadPhoto: (file: File) => Promise<string>;
}) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadPhoto(file);
      /* Empty means the upload was refused; the reason is already on screen. */
      if (!url) return;
      onChange({
        ...value,
        photos: [...value.photos, { url, caption: "" }],
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function updateCaption(index: number, caption: string) {
    onChange({
      ...value,
      photos: value.photos.map((p, i) => (i === index ? { ...p, caption } : p)),
    });
  }

  function removePhoto(index: number) {
    onChange({
      ...value,
      photos: value.photos.filter((_, i) => i !== index),
    });
  }

  return (
    <div className="flex flex-col gap-6">
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          Title
        </span>
        <input
          type="text"
          value={value.title}
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          maxLength={120}
          placeholder="A title for this gift"
          className="rounded-lg border border-black/[.08] bg-white px-3 py-2 text-sm dark:border-white/[.145] dark:bg-zinc-900"
        />
      </label>

      <div className="flex flex-col gap-3">
        {value.photos.map((photo, index) => (
          <div
            key={photo.url + index}
            className="flex items-start gap-3 rounded-lg border border-black/[.08] p-3 dark:border-white/[.145]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photo.url}
              alt=""
              className="h-16 w-16 flex-none rounded object-cover"
            />
            <div className="flex flex-1 flex-col gap-2">
              <input
                type="text"
                value={photo.caption}
                onChange={(e) => updateCaption(index, e.target.value)}
                maxLength={280}
                placeholder="Caption"
                className="rounded-lg border border-black/[.08] bg-white px-3 py-2 text-sm dark:border-white/[.145] dark:bg-zinc-900"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="self-start text-xs font-medium text-red-600 hover:underline dark:text-red-400"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading || value.photos.length >= 20}
          className="text-sm"
        />
        {uploading && (
          <p className="mt-1 text-xs text-zinc-500">Uploading...</p>
        )}
      </div>
    </div>
  );
}
