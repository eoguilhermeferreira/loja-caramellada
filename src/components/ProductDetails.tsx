"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { useCart } from "@/components/CartProvider";
import { ShippingCalculator } from "@/components/ShippingCalculator";
import { ProductGallery } from "@/components/ProductGallery";
import type { Tables } from "@/types/database.types";

type Product = Tables<"products"> & {
  product_images: Tables<"product_images">[];
  product_sizes: Tables<"product_sizes">[];
};

export function ProductView({ product }: { product: Product }) {
  const allVariations = product.product_sizes;
  const colors = useMemo(
    () => [...new Set(allVariations.map((s) => s.color).filter(Boolean))] as string[],
    [allVariations]
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(colors[0] ?? null);

  const images = useMemo(() => {
    const sorted = [...product.product_images].sort((a, b) => a.display_order - b.display_order);
    const forColor = selectedColor ? sorted.filter((i) => i.color === selectedColor) : [];
    if (forColor.length > 0) return forColor;
    const general = sorted.filter((i) => !i.color);
    return general.length > 0 ? general : sorted;
  }, [product.product_images, selectedColor]);

  return (
    <div className="grid gap-10 md:grid-cols-2">
      <ProductGallery images={images} productName={product.name} />
      <ProductDetails
        product={product}
        colors={colors}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        coverUrl={images[0]?.url ?? null}
      />
    </div>
  );
}

function ProductDetails({
  product,
  colors,
  selectedColor,
  onColorChange,
  coverUrl,
}: {
  product: Product;
  colors: string[];
  selectedColor: string | null;
  onColorChange: (color: string) => void;
  coverUrl: string | null;
}) {
  const router = useRouter();
  const { addItem } = useCart();
  const allVariations = product.product_sizes;
  const hasColors = colors.length > 0;
  const hasVariations = allVariations.length > 0;

  const variationsForColor = useMemo(
    () => allVariations.filter((s) => !hasColors || s.color === selectedColor),
    [allVariations, hasColors, selectedColor]
  );
  const sizesForColor = variationsForColor.filter((s) => s.size);

  const [selectedSize, setSelectedSize] = useState<string | null>(
    () => (sizesForColor.find((s) => s.stock > 0) ?? sizesForColor[0])?.size ?? null
  );
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const selectedVariation =
    sizesForColor.length > 0
      ? sizesForColor.find((s) => s.size === selectedSize)
      : variationsForColor[0];

  const selectedSizeStock = hasVariations ? selectedVariation?.stock ?? 0 : product.stock;

  function handleColorChange(color: string) {
    onColorChange(color);
    const sizes = allVariations.filter((s) => s.color === color && s.size);
    setSelectedSize((sizes.find((s) => s.stock > 0) ?? sizes[0])?.size ?? null);
    setQuantity(1);
  }

  const variationPrice = selectedVariation?.price ?? null;
  const hasPromo =
    variationPrice == null && product.promo_price != null && product.promo_price < product.price;
  const finalPrice = variationPrice ?? (hasPromo ? product.promo_price! : product.price);
  const outOfStock = selectedSizeStock <= 0;

  function addToCart() {
    addItem(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        imageUrl: coverUrl,
        unitPrice: finalPrice,
        size: selectedVariation?.size || null,
        color: selectedColor ?? product.color,
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
        {!hasColors && product.color && (
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
            {formatPrice(finalPrice)}
          </span>
        )}
      </div>

      <p className="whitespace-pre-line text-sm leading-relaxed text-brand-text/80">
        {product.description}
      </p>

      {hasColors && (
        <div>
          <p className="mb-2 text-sm font-medium text-brand-text">Cor</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
                  selectedColor === color
                    ? "border-brand-primary bg-brand-primary text-white"
                    : "border-brand-secondary text-brand-text hover:border-brand-primary"
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {sizesForColor.length > 0 && (
        <div>
          <p className="mb-2 text-sm font-medium text-brand-text">Tamanho</p>
          <div className="flex flex-wrap gap-2">
            {sizesForColor.map((s) => (
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

      <ShippingCalculator items={[{ productId: product.id, quantity }]} />
    </div>
  );
}
