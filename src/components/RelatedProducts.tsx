import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import type { Tables } from "@/types/database.types";

type Product = Tables<"products"> & {
  product_images: Tables<"product_images">[];
};

export function RelatedProducts({
  products,
  seeAllHref,
}: {
  products: Product[];
  seeAllHref: string;
}) {
  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-brand-text">
          Produtos Relacionados
        </h2>
        <Link
          href={seeAllHref}
          className="text-sm font-medium text-brand-primary hover:underline"
        >
          Ver tudo
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
