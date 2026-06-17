import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex max-w-2xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <h1 className="text-3xl font-semibold text-brand-text">
        Página não encontrada
      </h1>
      <p className="mt-2 text-sm text-brand-text/70">
        O conteúdo que você procura não existe ou foi removido.
      </p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-accent"
      >
        Voltar para a Loja
      </Link>
    </main>
  );
}
