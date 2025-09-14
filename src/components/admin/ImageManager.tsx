"use client";

import { useState } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";

type Props = {
  images: string[];
  onChange: (images: string[]) => void;
};

export default function ImageManager({ images, onChange }: Props) {
  const [uploading, setUploading] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const removeAt = (idx: number) => {
    const next = images.filter((_, i) => i !== idx);
    onChange(next);
  };

  const addUrl = () => {
    const url = urlInput.trim();
    if (!url) return;
    onChange([...images, url]);
    setUrlInput("");
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const form = new FormData();
    Array.from(files).forEach((f) => form.append("file", f));
    setUploading(true);
    try {
      const res = await fetch("/api/admin/uploads", { method: "POST", body: form });
      if (res.ok) {
        const data = await res.json();
        const urls: string[] = data.urls || [];
        onChange([...images, ...urls]);
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="grid gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((src, i) => (
          <div key={`${src}-${i}`} className="relative border border-gray-200 dark:border-gray-800 rounded overflow-hidden">
            <div className="relative aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <Image src={src} alt="product" fill className="object-cover" />
            </div>
            <div className="p-2 flex justify-end">
              <Button variant="ghost" onClick={() => removeAt(i)} className="text-red-600">Remove</Button>
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-2">
        <div className="flex gap-2">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => onFiles(e.target.files)}
            className="block w-full text-sm"
          />
          <Button disabled={uploading}>{uploading ? "Uploading..." : "Upload"}</Button>
        </div>
        <div className="flex gap-2">
          <input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Paste image URL"
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900"
          />
          <Button type="button" onClick={addUrl}>Add URL</Button>
        </div>
      </div>
    </div>
  );
}


