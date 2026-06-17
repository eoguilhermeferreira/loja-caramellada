import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [{ count: orderCount }, { data: paidOrders }, { data: lowStock }, { data: recentOrders }] =
    await Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }),
      supabase.from("orders").select("total").eq("payment_status", "pago"),
      supabase
        .from("products")
        .select("id, name, stock")
        .eq("is_active", true)
        .lte("stock", 5)
        .order("stock", { ascending: true })
        .limit(5),
      supabase
        .from("orders")
        .select("id, order_number, customer_name, total, payment_status, delivery_status, created_at")
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

  const revenue = (paidOrders ?? []).reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-text">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-brand-white p-5 shadow-sm">
          <p className="text-sm text-brand-text/60">Pedidos</p>
          <p className="mt-1 text-2xl font-semibold text-brand-text">
            {orderCount ?? 0}
          </p>
        </div>
        <div className="rounded-xl bg-brand-white p-5 shadow-sm">
          <p className="text-sm text-brand-text/60">Faturamento (pago)</p>
          <p className="mt-1 text-2xl font-semibold text-brand-primary">
            {formatPrice(revenue)}
          </p>
        </div>
        <div className="rounded-xl bg-brand-white p-5 shadow-sm">
          <p className="text-sm text-brand-text/60">Produtos com estoque baixo</p>
          <p className="mt-1 text-2xl font-semibold text-brand-text">
            {lowStock?.length ?? 0}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl bg-brand-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-text">
            Estoque baixo
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {(lowStock ?? []).length === 0 && (
              <p className="text-sm text-brand-text/50">Tudo certo por aqui.</p>
            )}
            {lowStock?.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between text-sm"
              >
                <Link
                  href={`/admin/produtos/${p.id}`}
                  className="text-brand-text hover:text-brand-primary"
                >
                  {p.name}
                </Link>
                <span className="font-medium text-red-600">
                  {p.stock} un.
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl bg-brand-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-text">
            Pedidos recentes
          </h2>
          <ul className="mt-3 flex flex-col gap-2">
            {(recentOrders ?? []).length === 0 && (
              <p className="text-sm text-brand-text/50">Nenhum pedido ainda.</p>
            )}
            {recentOrders?.map((order) => (
              <li key={order.id} className="flex items-center justify-between text-sm">
                <Link
                  href={`/admin/pedidos/${order.id}`}
                  className="text-brand-text hover:text-brand-primary"
                >
                  #{order.order_number} · {order.customer_name}
                </Link>
                <span className="text-brand-text/70">
                  {formatPrice(order.total)}
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
