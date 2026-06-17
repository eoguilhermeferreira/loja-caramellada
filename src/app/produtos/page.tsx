import { ProductGrid } from "@/components/ProductGrid";
import { getProducts } from "@/lib/queries";

export const metadata = {
  title: "Todos os Produtos | Caramelada Kids",
};

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
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
