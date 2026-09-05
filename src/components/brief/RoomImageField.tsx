"use client";

import { useRef, useState } from "react";

interface RoomImageFieldProps {
  fileName?: string;
  previewUrl?: string;
  error?: string;
  onFile: (file: File | null) => void;
}

export function RoomImageField({
  fileName,
  previewUrl,
  error,
  onFile,
}: RoomImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const hasFile = Boolean(previewUrl && fileName);

  function pick() {
    inputRef.current?.click();
  }

  function apply(file: File | null) {
    onFile(file);
    if (!file && inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">Room image</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={(e) => apply(e.target.files?.[0] ?? null)}
      />

      {hasFile ? (
        <div className="flex items-center gap-3 rounded-xl border border-line bg-card p-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Uploaded room preview"
            className="h-[4.25rem] w-[5.25rem] shrink-0 rounded-lg object-cover"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium" title={fileName}>
              {fileName}
            </p>
            <p className="mt-0.5 text-xs text-ink-soft">JPG, PNG or WEBP · max 5 MB</p>
            <div className="mt-2 flex items-center gap-3">
              <button
                type="button"
                className="text-xs font-medium text-copper hover:text-copper-dark"
                onClick={pick}
              >
                Change
              </button>
              <button
                type="button"
                className="text-xs font-medium text-ink-soft hover:text-danger"
                onClick={() => apply(null)}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            apply(e.dataTransfer.files?.[0] ?? null);
          }}
          className={`flex w-full items-center gap-3 rounded-xl border border-dashed bg-card p-2.5 text-left transition ${
            dragging ? "border-copper bg-[#f6e6dc]/50" : "border-line hover:border-ink/30"
          }`}
        >
          <span className="grid h-[4.25rem] w-[5.25rem] shrink-0 place-items-center rounded-lg bg-paper-2 text-[11px] uppercase tracking-[0.14em] text-ink-soft">
            Photo
          </span>
          <span>
            <span className="block text-sm">Upload a photo of the room</span>
            <span className="text-xs text-ink-soft">
              Optional · JPG, PNG or WEBP · max 5 MB
            </span>
          </span>
        </button>
      )}
      {error ? (
        <p role="alert" className="mt-1 text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
