import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";

const PAYMENT_LABELS: Record<string, string> = {
  pendente: "Pendente",
  pago: "Pago",
  falhou: "Falhou",
  reembolsado: "Reembolsado",
};

const DELIVERY_LABELS: Record<string, string> = {
  processando: "Processando",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export default async function AdminOrdersPage() {
  const supabase = await createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, total, payment_status, delivery_status, created_at")
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
              <tr key={order.id} className="border-b border-brand-secondary/30">
                <td className="px-4 py-3 font-medium text-brand-text">
                  <Link href={`/admin/pedidos/${order.id}`} className="hover:text-brand-primary">
                    #{order.order_number}
                  </Link>
                </td>
                <td className="px-4 py-3 text-brand-text/70">{order.customer_name}</td>
                <td className="px-4 py-3 text-brand-text/70">{formatPrice(order.total)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      order.payment_status === "pago"
                        ? "bg-green-100 text-green-700"
                        : order.payment_status === "falhou"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {PAYMENT_LABELS[order.payment_status]}
                  </span>
                </td>
                <td className="px-4 py-3 text-brand-text/70">
                  {DELIVERY_LABELS[order.delivery_status]}
                </td>
                <td className="px-4 py-3 text-brand-text/50">
                  {new Date(order.created_at).toLocaleDateString("pt-BR")}
                </td>
              </tr>
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
