import { notFound } from "next/navigation";
import { ProductGrid } from "@/components/ProductGrid";
import { BackButton } from "@/components/BackButton";
import { getCategoryBySlug, getProducts } from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Categoria" };

  const description = `Confira a coleção de ${category.name} na Caramellada Kids: roupas confortáveis e estilosas para bebês e crianças.`;

  return {
    title: category.name,
    description,
    openGraph: { title: category.name, description },
  };
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
    <main className="mx-auto max-w-6xl animate-fade-in px-4 py-10 sm:px-6">
      <BackButton />
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
