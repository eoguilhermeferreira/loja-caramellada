import { STORE_INFO } from "@/config/store";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <span className="rounded-full bg-brand-secondary px-4 py-1 text-sm font-medium text-brand-primary">
        Identidade visual em construção
      </span>
      <h1 className="max-w-xl text-4xl font-semibold leading-tight text-brand-primary">
        {STORE_INFO.name}
      </h1>
      <p className="max-w-md text-base text-brand-text/80">
        Moda infantil com qualidade e carinho. Estrutura inicial do projeto
        configurada com sucesso.
      </p>
      <button className="rounded-full bg-brand-accent px-6 py-3 text-sm font-semibold text-brand-white shadow-sm transition hover:bg-brand-primary">
        Ver Coleção
      </button>
    </main>
  );
}
