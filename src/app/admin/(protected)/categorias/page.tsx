import { createClient } from "@/lib/supabase/server";
import { CategoryImageUpload } from "./CategoryImageUpload";

export default async function AdminCategoriasPage() {
  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, image_url")
    .order("display_order");

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-text">Categorias</h1>
      <p className="mt-1 text-sm text-brand-text/60">
        Envie uma imagem de capa para cada categoria.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        {(categories ?? []).map((category) => (
          <div
            key={category.id}
            className="flex items-center justify-between rounded-xl bg-brand-white p-4 shadow-sm"
          >
            <p className="font-medium text-brand-text">{category.name}</p>
            <CategoryImageUpload
              categoryId={category.id}
              initialImageUrl={category.image_url}
            />
          </div>
        ))}
        {(categories ?? []).length === 0 && (
          <p className="text-sm text-brand-text/50">Nenhuma categoria cadastrada.</p>
        )}
      </div>
    </div>
  );
}
