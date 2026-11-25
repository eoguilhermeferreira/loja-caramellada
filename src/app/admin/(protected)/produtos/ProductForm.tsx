"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { saveProduct } from "@/app/admin/actions";
import { uploadImage } from "@/lib/uploadImage";

type Category = { id: string; name: string };

type Variation = {
  key: string;
  color: string;
  size: string;
  price: string | null;
  stock: number;
  barcodes: string;
};

type Photo = { url: string; color: string };

type ExistingProduct = {
  id: string;
  name: string;
  code: string;
  description: string;
  category_id: string | null;
  price: number;
  promo_price: number | null;
  stock: number;
  weight_grams: number;
  is_active: boolean;
  is_best_seller: boolean;
  product_images: { url: string; color: string | null; display_order: number }[];
  product_sizes: { id: string; size: string; stock: number; color: string | null; price: number | null }[];
  product_barcodes: { barcode: string; size_id: string | null }[];
};

const inputClass =
  "min-w-0 w-full rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary";

let keySeq = 0;
const newKey = () => `v${++keySeq}`;

function initialVariations(product?: ExistingProduct): Variation[] {
  if (!product) return [];
  return product.product_sizes.map((s) => ({
    key: s.id,
    color: s.color ?? "",
    size: s.size ?? "",
    price: s.price != null ? String(s.price) : null,
    stock: s.stock,
    barcodes: product.product_barcodes
      .filter((b) => b.size_id === s.id)
      .map((b) => b.barcode)
      .join(", "),
  }));
}

function PhotoGroup({
  label,
  photos,
  onAdd,
  onRemove,
  onMove,
}: {
  label: string;
  photos: string[];
  onAdd: (files: FileList) => Promise<void>;
  onRemove: (url: string) => void;
  onMove: (url: string, dir: -1 | 1) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handle(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    try {
      await onAdd(files);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="rounded-lg border border-brand-secondary/60 p-4">
      <p className="text-sm font-medium text-brand-text">{label}</p>
      <div className="mt-3 flex flex-wrap gap-3">
        {photos.map((url, i) => (
          <div key={url} className="relative h-24 w-24 overflow-hidden rounded-lg bg-brand-secondary/20">
            <Image src={url} alt="" fill className="object-cover" />
            {i === 0 && (
              <span className="absolute left-1 top-1 rounded bg-brand-primary px-1 text-[10px] text-white">Capa</span>
            )}
            <button type="button" onClick={() => onRemove(url)} aria-label="Remover foto"
              className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white">×</button>
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/40 text-xs text-white">
              <button type="button" disabled={i === 0} onClick={() => onMove(url, -1)} className="px-2 disabled:opacity-30" aria-label="Mover para esquerda">←</button>
              <button type="button" disabled={i === photos.length - 1} onClick={() => onMove(url, 1)} className="px-2 disabled:opacity-30" aria-label="Mover para direita">→</button>
            </div>
          </div>
        ))}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handle(e.dataTransfer.files); }}
          onClick={() => inputRef.current?.click()}
          className={`flex h-24 min-w-24 flex-1 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed px-3 text-center text-xs text-brand-text/60 transition-colors ${
            dragOver ? "border-brand-primary bg-brand-secondary/10" : "border-brand-secondary"
          }`}
        >
          {uploading ? "Enviando..." : "+ Arraste fotos aqui ou clique"}
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden"
            onChange={(e) => { handle(e.target.files); e.target.value = ""; }} />
        </div>
      </div>
    </div>
  );
}

export function ProductForm({
  categories,
  product,
  highlightVariation,
}: {
  categories: Category[];
  product?: ExistingProduct;
  highlightVariation?: string;
}) {
  const [defaultPrice, setDefaultPrice] = useState(product ? String(product.price) : "");
  const [variations, setVariations] = useState<Variation[]>(() => initialVariations(product));
  const [photos, setPhotos] = useState<Photo[]>(() =>
    [...(product?.product_images ?? [])]
      .sort((a, b) => a.display_order - b.display_order)
      .map((i) => ({ url: i.url, color: i.color ?? "" }))
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const variationColors = useMemo(
    () => [...new Set(variations.map((v) => v.color.trim()).filter(Boolean))],
    [variations]
  );
  const hasGeneralPhotos = photos.some((p) => !p.color);
  const photoColors =
    variationColors.length === 0 ? [""] : hasGeneralPhotos ? [...variationColors, ""] : variationColors;

  const orphanPhotos = photos.filter((p) => p.color && !variationColors.includes(p.color));

  useEffect(() => {
    if (highlightVariation) {
      document.getElementById(`var-${highlightVariation}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightVariation]);

  function updateVariation(key: string, patch: Partial<Variation>) {
    setVariations((vs) => vs.map((v) => (v.key === key ? { ...v, ...patch } : v)));
  }

  function addVariation() {
    setVariations((vs) => [
      ...vs,
      { key: newKey(), color: vs.at(-1)?.color ?? "", size: "", price: null, stock: 1, barcodes: "" },
    ]);
  }

  async function addPhotos(color: string, files: FileList) {
    try {
      for (const file of Array.from(files)) {
        const url = await uploadImage("product-images", file);
        setPhotos((ps) => [...ps, { url, color }]);
      }
    } catch (e) {
      setError(`Não foi possível enviar uma das fotos${e instanceof Error ? `: ${e.message}` : "."}`);
    }
  }

  function movePhoto(url: string, dir: -1 | 1) {
    setPhotos((ps) => {
      const photo = ps.find((p) => p.url === url)!;
      const group = ps.filter((p) => p.color === photo.color);
      const idx = group.indexOf(photo);
      const swap = group[idx + dir];
      if (!swap) return ps;
      return ps.map((p) => (p === photo ? swap : p === swap ? photo : p));
    });
  }

  async function handleSubmit(formData: FormData) {
    setSubmitting(true);
    setError(null);
    const base = Number(defaultPrice);
    formData.set(
      "variations",
      JSON.stringify(
        variations.map((v) => ({
          color: v.color.trim(),
          size: v.size.trim(),
          stock: v.stock,
          price: v.price != null && v.price !== "" && Number(v.price) !== base ? Number(v.price) : null,
          barcodes: v.barcodes.split(/[\s,;]+/).map((b) => b.trim()).filter(Boolean),
        }))
      )
    );
    formData.set("photos", JSON.stringify(photos));
    const result = await saveProduct(formData);
    if (result?.error) {
      setError(result.error);
      setSubmitting(false);
    }
  }

  return (
    <form action={handleSubmit} className="flex flex-col gap-6">
      {product && <input type="hidden" name="id" value={product.id} />}

      <section className="rounded-xl bg-brand-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-brand-text">Informações</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input type="text" name="name" placeholder="Nome do produto" defaultValue={product?.name} required
            className={`${inputClass} sm:col-span-2`} />
          <textarea name="description" placeholder="Descrição" defaultValue={product?.description} rows={4}
            className={`${inputClass} sm:col-span-2`} />
          <select name="category_id" defaultValue={product?.category_id ?? ""} className={inputClass}>
            <option value="">Sem categoria</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <label className="flex flex-col gap-1 text-xs text-brand-text/60">
            Código do produto (referência)
            <input type="text" name="code" placeholder="Em branco = gerado automaticamente" defaultValue={product?.code}
              className={`${inputClass} font-mono text-brand-text`} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-brand-text/60">
            Preço padrão
            <input type="number" step="0.01" min="0" name="price" value={defaultPrice}
              onChange={(e) => setDefaultPrice(e.target.value)} required className={`${inputClass} text-brand-text`} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-brand-text/60">
            Preço promocional (opcional — o padrão aparece riscado)
            <input type="number" step="0.01" min="0" name="promo_price" defaultValue={product?.promo_price ?? ""}
              className={`${inputClass} text-brand-text`} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-brand-text/60">
            Peso (gramas)
            <input type="number" name="weight_grams" defaultValue={product?.weight_grams ?? 300} required
              className={`${inputClass} text-brand-text`} />
          </label>
          {variations.length === 0 && (
            <label className="flex flex-col gap-1 text-xs text-brand-text/60">
              Estoque (produto sem variações)
              <input type="number" name="stock" min="0" defaultValue={product?.stock ?? 0}
                className={`${inputClass} text-brand-text`} />
            </label>
          )}
          <label className="flex items-center gap-2 text-sm text-brand-text sm:col-span-2">
            <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} />
            Produto ativo (visível na loja)
          </label>
          <label className="flex items-center gap-2 text-sm text-brand-text sm:col-span-2">
            <input type="checkbox" name="is_best_seller" defaultChecked={product?.is_best_seller ?? false} />
            <span>
              <span className="font-medium">Mais Vendido</span>
              <span className="ml-1 text-brand-text/50">— aparece na seção &quot;Mais Vendidos&quot; da página inicial</span>
            </span>
          </label>
        </div>
      </section>

      <section className="rounded-xl bg-brand-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-brand-text">Fotos</h2>
        <p className="mt-0.5 text-xs text-brand-text/50">
          As fotos ficam ligadas à cor: todos os tamanhos da mesma cor usam as mesmas fotos. A primeira é a capa.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          {photoColors.map((color) => (
            <PhotoGroup
              key={color || "_none"}
              label={color ? `Cor: ${color}` : variationColors.length > 0 ? "Fotos gerais (aparecem quando a cor não tem foto)" : "Fotos do produto"}
              photos={photos.filter((p) => p.color === color).map((p) => p.url)}
              onAdd={(files) => addPhotos(color, files)}
              onRemove={(url) => setPhotos((ps) => ps.filter((p) => p.url !== url))}
              onMove={movePhoto}
            />
          ))}
          {orphanPhotos.length > 0 && (
            <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800">
              {orphanPhotos.length} foto(s) estão ligadas a cores que não existem mais nas variações
              ({[...new Set(orphanPhotos.map((p) => p.color || "sem cor"))].join(", ")}).
              <button type="button" className="ml-2 underline"
                onClick={() => setPhotos((ps) => ps.map((p) => (p.color && !variationColors.includes(p.color) ? { ...p, color: "" } : p)))}>
                Mover para fotos gerais
              </button>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-xl bg-brand-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-brand-text">Variações</h2>
            <p className="mt-0.5 text-xs text-brand-text/50">
              Cor e tamanho são opcionais (em branco não aparecem na loja). Ex.: laço = só cor; sapato = só tamanho.
              Código de barras aparece só no admin.
            </p>
          </div>
          <button type="button" onClick={addVariation}
            className="shrink-0 rounded-lg border border-brand-secondary px-3 py-1.5 text-sm font-medium text-brand-text transition-colors hover:border-brand-primary">
            + Adicionar variação
          </button>
        </div>

        {variations.length > 0 && (
          <div className="mt-4 flex flex-col gap-2">
            <div className="hidden grid-cols-[1fr_0.8fr_0.8fr_0.6fr_1.4fr_auto] gap-2 px-2 text-xs text-brand-text/50 md:grid">
              <span>Cor</span><span>Tamanho</span><span>Preço</span><span>Estoque</span><span>Código(s) de barras</span><span />
            </div>
            {variations.map((v) => {
              const highlighted = highlightVariation === v.key;
              return (
                <div key={v.key} id={`var-${v.key}`}
                  className={`grid grid-cols-2 gap-2 rounded-lg p-2 md:grid-cols-[1fr_0.8fr_0.8fr_0.6fr_1.4fr_auto] ${
                    highlighted ? "bg-yellow-100 ring-2 ring-yellow-400" : "bg-brand-secondary/10"
                  }`}>
                  <input placeholder="Cor (opcional)" value={v.color} aria-label="Cor"
                    onChange={(e) => updateVariation(v.key, { color: e.target.value })} className={inputClass} />
                  <input placeholder="Tamanho (opcional)" value={v.size} aria-label="Tamanho"
                    onChange={(e) => updateVariation(v.key, { size: e.target.value })} className={inputClass} />
                  <input type="number" step="0.01" min="0" aria-label="Preço da variação"
                    value={v.price ?? defaultPrice}
                    onChange={(e) => updateVariation(v.key, { price: e.target.value === defaultPrice ? null : e.target.value })}
                    className={`${inputClass} ${v.price != null ? "font-semibold text-brand-primary" : ""}`} />
                  <input type="number" min="0" aria-label="Estoque" value={v.stock}
                    onChange={(e) => updateVariation(v.key, { stock: Number(e.target.value) })} className={inputClass} />
                  <input placeholder="Códigos (separe por vírgula)" value={v.barcodes} aria-label="Códigos de barras"
                    onChange={(e) => updateVariation(v.key, { barcodes: e.target.value })}
                    className={`${inputClass} col-span-2 font-mono md:col-span-1`} />
                  <button type="button" onClick={() => setVariations((vs) => vs.filter((x) => x.key !== v.key))}
                    className="col-span-2 text-sm text-brand-text/40 hover:text-red-500 md:col-span-1">
                    Remover
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button type="submit" disabled={submitting}
        className="self-start rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-accent disabled:opacity-60">
        {submitting ? "Salvando..." : "Salvar Produto"}
      </button>
    </form>
  );
}
