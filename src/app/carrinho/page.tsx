"use client";

import Link from "next/link";
import Image from "next/image";
import { useCart, cartItemKey } from "@/components/CartProvider";
import { ShippingCalculator } from "@/components/ShippingCalculator";
import { BackButton } from "@/components/BackButton";
import { formatPrice } from "@/lib/format";

export default function CartPage() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl animate-fade-in px-4 py-16 text-center sm:px-6">
        <BackButton />
        <h1 className="text-2xl font-semibold text-brand-text">
          Seu carrinho está vazio
        </h1>
        <p className="mt-2 text-sm text-brand-text/70">
          Que tal explorar nossa coleção de roupas para bebês e crianças?
        </p>
        <Link
          href="/produtos"
          className="mt-6 inline-block rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-accent"
        >
          Ver Produtos
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl animate-fade-in px-4 py-10 sm:px-6">
      <BackButton />
      <h1 className="text-2xl font-semibold text-brand-text">Carrinho</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <ul className="flex flex-col gap-4 lg:col-span-2">
          {items.map((item) => {
            const key = cartItemKey(item.productId, item.size, item.color);
            return (
              <li
                key={key}
                className="flex gap-4 rounded-xl bg-brand-white p-4 shadow-sm"
              >
                <Link
                  href={`/produto/${item.slug}`}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-brand-secondary/30"
                >
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : null}
                </Link>

                <div className="flex flex-1 flex-col gap-1">
                  <Link
                    href={`/produto/${item.slug}`}
                    className="text-sm font-medium text-brand-text hover:text-brand-primary"
                  >
                    {item.name}
                  </Link>
                  <p className="text-xs text-brand-text/60">
                    {[item.size && `Tamanho: ${item.size}`, item.color && `Cor: ${item.color}`]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>

                  <div className="mt-auto flex items-center justify-between gap-3">
                    <div className="flex items-center rounded-lg border border-brand-secondary">
                      <button
                        onClick={() => updateQuantity(key, item.quantity - 1)}
                        className="px-2.5 py-1 text-brand-text hover:text-brand-primary"
                        aria-label="Diminuir quantidade"
                      >
                        −
                      </button>
                      <span className="w-8 text-center text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(key, item.quantity + 1)}
                        disabled={item.quantity >= item.stock}
                        className="px-2.5 py-1 text-brand-text hover:text-brand-primary disabled:opacity-30"
                        aria-label="Aumentar quantidade"
                      >
                        +
                      </button>
                    </div>

                    <span className="text-sm font-semibold text-brand-text">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => removeItem(key)}
                  aria-label="Remover item"
                  className="self-start text-sm text-brand-text/50 hover:text-brand-primary"
                >
                  Remover
                </button>
              </li>
            );
          })}
        </ul>

        <aside className="h-fit rounded-xl bg-brand-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-text">
            Resumo da Compra
          </h2>
          <div className="mt-4 flex items-center justify-between text-sm text-brand-text/70">
            <span>Subtotal</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-brand-secondary/60 pt-4 text-base font-semibold text-brand-text">
            <span>Total</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <p className="mt-1 text-xs text-brand-text/50">
            Frete calculado no checkout
          </p>

          <div className="mt-4">
            <ShippingCalculator
              items={items.map((i) => ({ productId: i.productId, quantity: i.quantity }))}
            />
          </div>

          <Link
            href="/checkout"
            className="mt-5 block rounded-full bg-brand-primary px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-accent"
          >
            Finalizar Compra
          </Link>
        </aside>
      </div>
    </main>
  );
}
