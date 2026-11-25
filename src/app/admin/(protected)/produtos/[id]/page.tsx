import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/app/admin/(protected)/produtos/ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ v?: string }>;
}) {
  const { id } = await params;
  const { v } = await searchParams;
  const supabase = await createClient();

  const [{ data: categories }, { data: product }] = await Promise.all([
    supabase.from("categories").select("id, name").order("display_order"),
    supabase
      .from("products")
      .select(
        "*, product_images(url, color, display_order), product_sizes(id, size, stock, color, price), product_barcodes(barcode, size_id)"
      )
      .eq("id", id)
      .maybeSingle(),
  ]);

  if (!product) notFound();

  const highlighted = v ? product.product_sizes.find((s) => s.id === v) : undefined;

  return (
    <div>
      <Link
        href="/admin/produtos"
        className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-brand-text/60 transition-colors hover:text-brand-primary"
      >
        <span aria-hidden="true" className="text-lg leading-none">←</span> Voltar para Produtos
      </Link>
      <h1 className="text-2xl font-semibold text-brand-text">Editar Produto</h1>
      {highlighted && (
        <p className="mt-2 rounded-lg bg-yellow-100 px-3 py-2 text-sm text-yellow-900">
          Código bipado: variação{" "}
          <strong>{[highlighted.color, highlighted.size].filter(Boolean).join(" / ") || "sem cor/tamanho"}</strong>{" "}
          — estoque {highlighted.stock}. Destacada em amarelo na seção Variações.
        </p>
      )}
      <div className="mt-6">
        <ProductForm categories={categories ?? []} product={product} highlightVariation={highlighted?.id} />
      </div>
    </div>
  );
}
