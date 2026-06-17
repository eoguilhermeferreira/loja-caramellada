import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/ProductGrid";
import { getCategoryBySlug, getProducts } from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return { title: `${category?.name ?? "Categoria"} | Caramelada Kids` };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const products = await getProducts({ categorySlug: slug });

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-2xl font-semibold text-brand-text">
        {category.name}
      </h1>
      <div className="mt-6">
        <ProductGrid
          products={products}
          emptyMessage="Nenhum produto nesta categoria ainda."
        />
      </div>
    </main>
  );
}
