import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/format";
import type { Tables } from "@/types/database.types";

type Product = Tables<"products"> & {
  product_images: Tables<"product_images">[];
};

export function ProductCard({ product }: { product: Product }) {
  const image = [...product.product_images].sort(
    (a, b) => a.display_order - b.display_order
  )[0];
  const hasPromo = product.promo_price != null && product.promo_price < product.price;
  const outOfStock = product.stock <= 0;

  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl bg-brand-white shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-brand-secondary/30">
        {image ? (
          <Image
            src={image.url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-brand-text/40">
            Sem imagem
          </div>
        )}

        {hasPromo && (
          <span className="absolute left-2 top-2 rounded-full bg-brand-primary px-2.5 py-1 text-xs font-semibold text-white">
            Promoção
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-sm font-semibold text-white">
            Produto indisponível
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="text-sm font-medium text-brand-text line-clamp-2">
          {product.name}
        </h3>

        <div className="mt-auto flex items-baseline gap-2">
          {hasPromo ? (
            <>
              <span className="text-xs text-brand-text/50 line-through">
                {formatPrice(product.price)}
              </span>
              <span className="text-base font-semibold text-brand-primary">
                {formatPrice(product.promo_price!)}
              </span>
            </>
          ) : (
            <span className="text-base font-semibold text-brand-text">
              {formatPrice(product.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
