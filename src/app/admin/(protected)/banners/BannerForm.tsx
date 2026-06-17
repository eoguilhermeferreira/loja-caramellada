"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { saveBanner, uploadBannerImage } from "@/app/admin/actions";

type ExistingBanner = {
  id: string;
  title: string;
  description: string;
  button_label: string;
  button_link: string;
  display_order: number;
  is_active: boolean;
  image_url: string | null;
};

export function BannerForm({ banner }: { banner?: ExistingBanner }) {
  const [imageUrl, setImageUrl] = useState<string | null>(banner?.image_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const url = await uploadBannerImage(formData);
      setImageUrl(url);
    } catch {
      setError("Não foi possível enviar a imagem.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    if (imageUrl) formData.set("image_url", imageUrl);
    try {
      await saveBanner(formData);
    } catch {
      setError("Não foi possível salvar o banner.");
      setSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      {banner && <input type="hidden" name="id" value={banner.id} />}

      <section className="rounded-xl bg-brand-white p-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            name="title"
            placeholder="Título"
            defaultValue={banner?.title}
            required
            className="rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary sm:col-span-2"
          />
          <textarea
            name="description"
            placeholder="Descrição"
            defaultValue={banner?.description}
            rows={3}
            className="rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary sm:col-span-2"
          />
          <input
            type="text"
            name="button_label"
            placeholder="Texto do botão"
            defaultValue={banner?.button_label}
            className="rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary"
          />
          <input
            type="text"
            name="button_link"
            placeholder="Link do botão (ex: /produtos)"
            defaultValue={banner?.button_link}
            className="rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary"
          />
          <input
            type="number"
            name="display_order"
            placeholder="Ordem de exibição"
            defaultValue={banner?.display_order ?? 0}
            className="rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary"
          />
          <label className="flex items-center gap-2 text-sm text-brand-text">
            <input type="checkbox" name="is_active" defaultChecked={banner?.is_active ?? true} />
            Banner ativo
          </label>
        </div>

        <div className="mt-4">
          <p className="text-sm font-medium text-brand-text">Imagem</p>
          {imageUrl && (
            <div className="relative mt-2 h-32 w-full max-w-md overflow-hidden rounded-lg">
              <Image src={imageUrl} alt="" fill className="object-cover" />
            </div>
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-2 rounded-lg border border-brand-secondary px-4 py-2 text-sm font-medium text-brand-text transition-colors hover:border-brand-primary disabled:opacity-60"
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
        </div>
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting || uploading}
        className="self-start rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-accent disabled:opacity-60"
      >
        {submitting ? "Salvando..." : "Salvar Banner"}
      </button>
    </form>
  );
}
