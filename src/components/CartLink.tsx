"use client";

import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export function CartLink() {
  const { totalQuantity } = useCart();

  return (
    <Link
      href="/carrinho"
      className="relative rounded-full border border-brand-primary px-4 py-2 text-sm font-medium text-brand-primary transition-colors hover:bg-brand-primary hover:text-brand-white"
    >
      Carrinho
      {totalQuantity > 0 && (
        <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-accent px-1 text-xs font-semibold text-white">
          {totalQuantity}
        </span>
      )}
    </Link>
  );
}
