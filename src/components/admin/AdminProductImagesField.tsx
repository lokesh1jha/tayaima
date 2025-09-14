"use client";

import { useEffect, useState } from "react";
import ImageManager from "@/components/admin/ImageManager";

type Props = {
  name?: string;
  initial?: string[];
};

export default function AdminProductImagesField({ name = "imagesJson", initial = [] }: Props) {
  const [images, setImages] = useState<string[]>(initial);

  // Keep a local hidden input in sync so parent <form> captures latest images
  useEffect(() => {
    // no-op, state holds images
  }, [images]);

  return (
    <div className="grid gap-2">
      <input type="hidden" name={name} value={JSON.stringify(images)} readOnly />
      <ImageManager images={images} onChange={setImages} />
    </div>
  );
}


