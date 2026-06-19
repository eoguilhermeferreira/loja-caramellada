"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/components/CartProvider";
import { ShippingCalculator } from "@/components/ShippingCalculator";
import type { Tables } from "@/types/database.types";

type Product = Tables<"products"> & {
  product_images: Tables<"product_images">[];
  product_sizes: Tables<"product_sizes">[];
};

export function ProductDetails({ product }: { product: Product }) {
  const router = useRouter();
  const { addItem } = useCart();
  const sizes = product.product_sizes;
  const hasSizes = sizes.length > 0;

  const [selectedSize, setSelectedSize] = useState<string | null>(
    hasSizes ? sizes[0]?.size ?? null : null
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedSizeStock = useMemo(() => {
    if (!hasSizes) return product.stock;
    return sizes.find((s) => s.size === selectedSize)?.stock ?? 0;
  }, [hasSizes, sizes, selectedSize, product.stock]);

  const hasPromo =
    product.promo_price != null && product.promo_price < product.price;
  const outOfStock = hasSizes ? selectedSizeStock <= 0 : product.stock <= 0;
  const mainImage = [...product.product_images].sort(
    (a, b) => a.display_order - b.display_order
  )[0];

  function addToCart() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        imageUrl: mainImage?.url ?? null,
        unitPrice: hasPromo ? product.promo_price! : product.price,
        size: selectedSize,
        color: product.color,
        stock: selectedSizeStock,
      },
      quantity
    );
  }

  function handleAddToCart() {
    addToCart();
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleBuyNow() {
    addToCart();
    router.push("/checkout");
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-2xl font-semibold text-brand-text sm:text-3xl">
          {product.name}
        </h1>
        {product.color && (
          <p className="mt-1 text-sm text-brand-text/60">
            Cor: <span className="font-medium">{product.color}</span>
          </p>
        )}
      </div>

      <div className="flex items-baseline gap-3">
        {hasPromo ? (
          <>
            <span className="text-lg text-brand-text/50 line-through">
              {formatPrice(product.price)}
            </span>
            <span className="text-3xl font-semibold text-brand-primary">
              {formatPrice(product.promo_price!)}
            </span>
          </>
        ) : (
          <span className="text-3xl font-semibold text-brand-text">
            {formatPrice(product.price)}
          </span>
        )}
      </div>

      <p className="whitespace-pre-line text-sm leading-relaxed text-brand-text/80">
        {product.description}
      </p>

      {hasSizes && (
        <div>
          <p className="mb-2 text-sm font-medium text-brand-text">Tamanho</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s.id}
                disabled={s.stock <= 0}
                onClick={() => setSelectedSize(s.size)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  selectedSize === s.size
                    ? "border-brand-primary bg-brand-primary text-white"
                    : "border-brand-secondary text-brand-text hover:border-brand-primary"
                }`}
              >
                {s.size}
              </button>
            ))}
          </div>
        </div>
      )}

      <p className="text-sm text-brand-text/70">
        {outOfStock
          ? "Produto indisponível"
          : `${selectedSizeStock} unidade${selectedSizeStock === 1 ? "" : "s"} em estoque`}
      </p>

      {!outOfStock && (
        <div className="flex items-center gap-3">
          <p className="text-sm font-medium text-brand-text">Quantidade</p>
          <div className="flex items-center rounded-lg border border-brand-secondary">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-1.5 text-brand-text hover:text-brand-primary"
              aria-label="Diminuir quantidade"
            >
              −
            </button>
            <span className="w-8 text-center text-sm">{quantity}</span>
            <button
              onClick={() =>
                setQuantity((q) => Math.min(selectedSizeStock, q + 1))
              }
              className="px-3 py-1.5 text-brand-text hover:text-brand-primary"
              aria-label="Aumentar quantidade"
            >
              +
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <button
          onClick={handleBuyNow}
          disabled={outOfStock}
          className="rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-accent disabled:cursor-not-allowed disabled:bg-brand-secondary disabled:text-brand-text/50"
        >
          {outOfStock ? "Produto indisponível" : "Comprar"}
        </button>
        <button
          onClick={handleAddToCart}
          disabled={outOfStock}
          className="rounded-full border border-brand-primary px-6 py-3 text-sm font-semibold text-brand-primary transition-colors hover:bg-brand-primary hover:text-white disabled:cursor-not-allowed disabled:border-brand-secondary disabled:text-brand-text/50"
        >
          {outOfStock ? "Produto indisponível" : added ? "Adicionado!" : "Adicionar ao Carrinho"}
        </button>
      </div>

      <ShippingCalculator />
    </div>
  );
}
