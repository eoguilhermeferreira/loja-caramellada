"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { saveProduct, uploadProductImage } from "@/app/admin/actions";
import { SIZES } from "@/config/store";

type Category = { id: string; name: string };

type ExistingProduct = {
  id: string;
  name: string;
  description: string;
  category_id: string | null;
  price: number;
  promo_price: number | null;
  color: string | null;
  stock: number;
  is_active: boolean;
  product_images: { url: string }[];
  product_sizes: { size: string; stock: number }[];
};

export function ProductForm({
  categories,
  product,
}: {
  categories: Category[];
  product?: ExistingProduct;
}) {
  const [images, setImages] = useState<string[]>(
    product?.product_images.map((i) => i.url) ?? []
  );
  const [sizes, setSizes] = useState<{ size: string; stock: number }[]>(
    product?.product_sizes ?? []
  );
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.set("file", file);
        const url = await uploadProductImage(formData);
        setImages((current) => [...current, url]);
      }
    } catch {
      setError("Não foi possível enviar uma das imagens.");
    } finally {
      setUploading(false);
    }
  }

  function removeImage(url: string) {
    setImages((current) => current.filter((i) => i !== url));
  }

  function toggleSize(size: string) {
    setSizes((current) => {
      const exists = current.find((s) => s.size === size);
      if (exists) return current.filter((s) => s.size !== size);
      return [...current, { size, stock: 0 }];
    });
  }

  function updateSizeStock(size: string, stock: number) {
    setSizes((current) =>
      current.map((s) => (s.size === size ? { ...s, stock } : s))
    );
  }

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    formData.set("images", JSON.stringify(images));
    formData.set("sizes", JSON.stringify(sizes));
    try {
      await saveProduct(formData);
    } catch {
      setError("Não foi possível salvar o produto.");
      setSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      <section className="rounded-xl bg-brand-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-brand-text">Informações</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            type="text"
            name="name"
            placeholder="Nome do produto"
            defaultValue={product?.name}
            required
            className="rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary sm:col-span-2"
          />
          <textarea
            name="description"
            placeholder="Descrição"
            defaultValue={product?.description}
            rows={4}
            className="rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary sm:col-span-2"
          />
          <select
            name="category_id"
            defaultValue={product?.category_id ?? ""}
            className="rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary"
          >
            <option value="">Sem categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            name="color"
            placeholder="Cor"
            defaultValue={product?.color ?? ""}
            className="rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary"
          />
          <input
            type="number"
            step="0.01"
            name="price"
            placeholder="Preço"
            defaultValue={product?.price}
            required
            className="rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary"
          />
          <input
            type="number"
            step="0.01"
            name="promo_price"
            placeholder="Preço promocional (opcional)"
            defaultValue={product?.promo_price ?? ""}
            className="rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary"
          />
          <input
            type="number"
            name="stock"
            placeholder="Estoque geral (sem variação por tamanho)"
            defaultValue={product?.stock ?? 0}
            className="rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary sm:col-span-2"
          />
          <label className="flex items-center gap-2 text-sm text-brand-text sm:col-span-2">
            <input
              type="checkbox"
              name="is_active"
              defaultChecked={product?.is_active ?? true}
            />
            Produto ativo (visível na loja)
          </label>
        </div>
      </section>

      <section className="rounded-xl bg-brand-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-brand-text">Tamanhos e estoque</h2>
        <p className="mt-1 text-xs text-brand-text/50">
          Selecione os tamanhos disponíveis e informe o estoque de cada um. Se o
          produto não tem variação de tamanho, deixe todos desmarcados e use o
          estoque geral acima.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {SIZES.map((size) => {
            const selected = sizes.find((s) => s.size === size);
            return (
              <div key={size} className="flex flex-col items-center gap-1">
                <button
                  type="button"
                  onClick={() => toggleSize(size)}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                    selected
                      ? "border-brand-primary bg-brand-primary text-white"
                      : "border-brand-secondary text-brand-text hover:border-brand-primary"
                  }`}
                >
                  {size}
                </button>
                {selected && (
                  <input
                    type="number"
                    min={0}
                    value={selected.stock}
                    onChange={(e) => updateSizeStock(size, Number(e.target.value))}
                    className="w-16 rounded-md border border-brand-secondary px-2 py-1 text-center text-xs"
                  />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl bg-brand-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-brand-text">Imagens</h2>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`mt-4 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
            dragOver ? "border-brand-primary bg-brand-secondary/10" : "border-brand-secondary"
          }`}
        >
          <p className="text-sm text-brand-text/70">
            {uploading
              ? "Enviando imagem(ns)..."
              : "Arraste imagens aqui ou clique para selecionar"}
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {images.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-3">
            {images.map((url) => (
              <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg">
                <Image src={url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute right-0.5 top-0.5 rounded-full bg-black/60 px-1.5 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting || uploading}
        className="self-start rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-accent disabled:opacity-60"
      >
        {submitting ? "Salvando..." : "Salvar Produto"}
      </button>
    </form>
  );
}
