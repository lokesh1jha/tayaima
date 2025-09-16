"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Button from "@/components/ui/Button";

type Props = {
  images: string[];
  onChange: (images: string[]) => void;
};

// Simple image component since URLs are now pre-signed from APIs
function ImagePreview({ src, alt, onRemove }: { src: string; alt: string; onRemove: () => void }) {
  // Use regular img tag for S3 URLs (signed URLs) to avoid Next.js image optimization issues
  const isS3Url = src.includes('.s3.') || src.includes('amazonaws.com');
  
  return (
    <div className="relative aspect-square">
      {isS3Url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover rounded"
        />
      ) : (
        <Image src={src} alt={alt} fill className="object-cover rounded" />
      )}
      <div className="absolute top-2 right-2">
        <Button variant="ghost" onClick={onRemove} className="text-red-600 h-8 w-8 p-0 bg-white/80 hover:bg-white">
          ×
        </Button>
      </div>
    </div>
  );
}

export default function ImageManager({ images, onChange }: Props) {
  const [uploading, setUploading] = useState(false);

  const removeAt = async (idx: number) => {
    const imageUrl = images[idx];
    
    // Delete from storage if it's a managed URL (S3 or local)
    if (imageUrl && (imageUrl.includes('.s3.') || imageUrl.includes('amazonaws.com') || imageUrl.startsWith('/uploads/'))) {
      try {
        console.log('Attempting to delete image:', imageUrl);
        const response = await fetch('/api/admin/uploads/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: imageUrl }),
        });
        
        const result = await response.json();
        
        if (!response.ok) {
          console.error('Failed to delete image from storage:', result.error || 'Unknown error');
          alert(`Failed to delete image from storage: ${result.error || 'Unknown error'}`);
          return; // Don't remove from UI if storage deletion failed
        } else {
          console.log('Successfully deleted image from storage:', result.message);
        }
      } catch (error) {
        console.error('Error deleting image from storage:', error);
        alert('Error deleting image from storage. Please try again.');
        return; // Don't remove from UI if there was an error
      }
    }
    
    // Remove from local state only after successful storage deletion
    const next = images.filter((_, i) => i !== idx);
    onChange(next);
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
            <ImagePreview 
              src={src} 
              alt="product" 
              onRemove={() => removeAt(i)}
            />
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
            className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <Button disabled={uploading} className="min-w-[100px]">
            {uploading ? "Uploading..." : "Upload"}
          </Button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Only file uploads are supported. Images will be stored securely in S3.
        </p>
      </div>
    </div>
  );
}


