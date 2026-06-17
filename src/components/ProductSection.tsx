import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import type { Tables } from "@/types/database.types";

type Product = Tables<"products"> & {
  product_images: Tables<"product_images">[];
};

export function ProductSection({
  title,
  products,
  seeAllHref,
  emptyMessage,
}: {
  title: string;
  products: Product[];
  seeAllHref: string;
  emptyMessage: string;
}) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-brand-text">{title}</h2>
        {products.length > 0 && (
          <Link
            href={seeAllHref}
            className="text-sm font-medium text-brand-primary hover:underline"
          >
            Ver tudo
          </Link>
        )}
      </div>

      {products.length === 0 ? (
        <p className="mt-6 text-sm text-brand-text/60">{emptyMessage}</p>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
