import { ProductGrid } from "@/components/ProductGrid";
import { BackButton } from "@/components/BackButton";
import { getProducts } from "@/lib/queries";

export const metadata = {
  title: "Todos os Produtos",
  description:
    "Explore toda a coleção da Caramellada Kids: roupas confortáveis e estilosas para bebês e crianças.",
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="mx-auto max-w-6xl animate-fade-in px-4 py-10 sm:px-6">
      <BackButton />
      <h1 className="text-2xl font-semibold text-brand-text">
        Todos os Produtos
      </h1>
      <div className="mt-6">
        <ProductGrid
          products={products}
          emptyMessage="Nenhum produto cadastrado ainda."
        />
      </div>
    </main>
  );
}
