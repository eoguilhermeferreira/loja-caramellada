"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { uploadCategoryImage, updateCategoryImage } from "@/app/admin/actions";

export function CategoryImageUpload({
  categoryId,
  initialImageUrl,
}: {
  categoryId: string;
  initialImageUrl: string | null;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const url = await uploadCategoryImage(formData);
      await updateCategoryImage(categoryId, url);
      setImageUrl(url);
    } catch {
      setError("Não foi possível enviar a imagem.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex items-center gap-4">
      {imageUrl && (
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
          <Image src={imageUrl} alt="" fill className="object-cover" />
        </div>
      )}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="rounded-lg border border-brand-secondary px-4 py-2 text-sm font-medium text-brand-text transition-colors hover:border-brand-primary disabled:opacity-60"
      >
        {uploading ? "Enviando..." : imageUrl ? "Trocar imagem" : "Enviar imagem"}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
