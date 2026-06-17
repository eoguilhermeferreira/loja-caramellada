"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";

export default function CheckoutSucessoPage() {
  const { clear } = useCart();

  useEffect(() => {
    clear();
  }, [clear]);

  return (
    <main className="mx-auto max-w-2xl animate-fade-in px-4 py-20 text-center sm:px-6">
      <h1 className="text-2xl font-semibold text-brand-text">
        Pagamento aprovado!
      </h1>
      <p className="mt-2 text-sm text-brand-text/70">
        Obrigado pela sua compra. Em breve enviaremos os detalhes do pedido
        para o seu e-mail.
      </p>
      <Link
        href="/produtos"
        className="mt-6 inline-block rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-accent"
      >
        Continuar Comprando
      </Link>
    </main>
  );
}
