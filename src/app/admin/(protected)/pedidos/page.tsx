import { createClient } from "@/lib/supabase/server";
import { OrderRow } from "@/app/admin/(protected)/pedidos/OrderRow";

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, total, payment_status, delivery_status, created_at")
    .eq("payment_status", "pago")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-text">Pedidos</h1>

      <div className="mt-6 overflow-x-auto rounded-xl bg-brand-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-brand-secondary/60 text-brand-text/60">
              <th className="px-4 py-3">Pedido</th>
              <th className="px-4 py-3">Cliente</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Pagamento</th>
              <th className="px-4 py-3">Entrega</th>
              <th className="px-4 py-3">Data</th>
            </tr>
          </thead>
          <tbody>
            {(orders ?? []).map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
            {(orders ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-brand-text/50">
                  Nenhum pedido ainda.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
