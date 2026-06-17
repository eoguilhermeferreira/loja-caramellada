import Link from "next/link";

export default function CheckoutPendentePage() {
  return (
    <main className="mx-auto max-w-2xl animate-fade-in px-4 py-20 text-center sm:px-6">
      <h1 className="text-2xl font-semibold text-brand-text">
        Pagamento em análise
      </h1>
      <p className="mt-2 text-sm text-brand-text/70">
        Recebemos seu pedido e estamos aguardando a confirmação do
        pagamento. Você receberá um e-mail assim que ele for aprovado.
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
