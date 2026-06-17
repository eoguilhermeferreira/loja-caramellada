import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "@/app/admin/(protected)/produtos/ProductForm";

export default async function NewProductPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name")
    .order("display_order");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-text">Novo Produto</h1>
      <div className="mt-6">
        <ProductForm categories={categories ?? []} />
      </div>
    </div>
  );
}
