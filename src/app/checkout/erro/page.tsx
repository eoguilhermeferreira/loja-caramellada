import Link from "next/link";

export default function CheckoutErroPage() {
  return (
    <main className="mx-auto max-w-2xl animate-fade-in px-4 py-20 text-center sm:px-6">
      <h1 className="text-2xl font-semibold text-brand-text">
        Pagamento não concluído
      </h1>
      <p className="mt-2 text-sm text-brand-text/70">
        Algo deu errado durante o pagamento. Você pode tentar novamente ou
        falar com a gente pelo WhatsApp.
      </p>
      <Link
        href="/checkout"
        className="mt-6 inline-block rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-accent"
      >
        Tentar Novamente
      </Link>
    </main>
  );
}
