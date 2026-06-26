import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { DeleteProductButton } from "./DeleteProductButton";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select("id, code, name, price, promo_price, stock, is_active, categories(name)")
    .order("created_at", { ascending: false });

  if (q) {
    query = query.ilike("code", `%${q.trim()}%`);
  }

  const { data: products } = await query;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-text">Produtos</h1>
        <Link
          href="/admin/produtos/novo"
          className="rounded-full bg-brand-primary px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-accent"
        >
          Novo Produto
        </Link>
      </div>

      <form method="GET" className="mt-4 flex gap-2">
        <input
          type="text"
          name="q"
          defaultValue={q ?? ""}
          placeholder="Buscar por código do produto"
          className="w-full max-w-xs rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary"
        />
        <button
          type="submit"
          className="rounded-lg border border-brand-secondary px-4 py-2 text-sm font-medium text-brand-text transition-colors hover:border-brand-primary"
        >
          Buscar
        </button>
        {q && (
          <Link
            href="/admin/produtos"
            className="flex items-center px-2 text-sm text-brand-text/60 hover:text-brand-primary"
          >
            Limpar
          </Link>
        )}
      </form>

      <div className="mt-6 overflow-x-auto rounded-xl bg-brand-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-brand-secondary/60 text-brand-text/60">
              <th className="px-4 py-3">Código</th>
              <th className="px-4 py-3">Nome</th>
              <th className="px-4 py-3">Categoria</th>
              <th className="px-4 py-3">Preço</th>
              <th className="px-4 py-3">Estoque</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {(products ?? []).map((product) => (
              <tr key={product.id} className="border-b border-brand-secondary/30">
                <td className="px-4 py-3 font-mono text-brand-text/70">{product.code}</td>
                <td className="px-4 py-3 font-medium text-brand-text">
                  <Link href={`/admin/produtos/${product.id}`} className="hover:text-brand-primary">
                    {product.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-brand-text/70">
                  {product.categories?.name ?? "-"}
                </td>
                <td className="px-4 py-3 text-brand-text/70">
                  {product.promo_price ? (
                    <>
                      <span className="line-through">{formatPrice(product.price)}</span>{" "}
                      <span className="text-brand-primary">{formatPrice(product.promo_price)}</span>
                    </>
                  ) : (
                    formatPrice(product.price)
                  )}
                </td>
                <td className="px-4 py-3 text-brand-text/70">
                  {product.stock <= 0 ? (
                    <span className="text-red-600">Indisponível</span>
                  ) : (
                    product.stock
                  )}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      product.is_active
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {product.is_active ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <DeleteProductButton id={product.id} />
                </td>
              </tr>
            ))}
            {(products ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-brand-text/50">
                  {q ? "Nenhum produto encontrado com esse código." : "Nenhum produto cadastrado ainda."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
