import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/app/admin/(protected)/produtos/ProductForm";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: categories }, { data: product }] = await Promise.all([
    supabase.from("categories").select("id, name").order("display_order"),
    supabase
      .from("products")
      .select("*, product_images(url), product_sizes(size, stock, color)")
      .eq("id", id)
      .maybeSingle(),
  ]);

  if (!product) notFound();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-text">Editar Produto</h1>
      <div className="mt-6">
        <ProductForm categories={categories ?? []} product={product} />
      </div>
    </div>
  );
}
