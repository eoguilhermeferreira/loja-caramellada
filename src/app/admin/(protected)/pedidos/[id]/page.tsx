import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import { OrderStatusSelect } from "@/app/admin/(protected)/pedidos/OrderStatusSelect";

const PAYMENT_LABELS: Record<string, string> = {
  pendente: "Pendente",
  pago: "Pago",
  falhou: "Falhou",
  reembolsado: "Reembolsado",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: order }, { data: items }] = await Promise.all([
    supabase.from("orders").select("*").eq("id", id).maybeSingle(),
    supabase.from("order_items").select("*").eq("order_id", id),
  ]);

  if (!order) notFound();

  const address = order.shipping_address as {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold text-brand-text">
        Pedido #{order.order_number}
      </h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section className="rounded-xl bg-brand-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-text">Itens</h2>
            <ul className="mt-3 flex flex-col gap-2 text-sm">
              {(items ?? []).map((item) => (
                <li key={item.id} className="flex justify-between">
                  <span>
                    {item.product_name}
                    {item.size ? ` · ${item.size}` : ""}
                    {item.color ? ` · ${item.color}` : ""} x{item.quantity}
                  </span>
                  <span>{formatPrice(item.unit_price * item.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-1 border-t border-brand-secondary/60 pt-4 text-sm text-brand-text/70">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Frete {order.shipping_method ? `(${order.shipping_method})` : ""}</span>
                <span>{formatPrice(order.shipping_cost)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold text-brand-text">
                <span>Total</span>
                <span>{formatPrice(order.total)}</span>
              </div>
            </div>
          </section>

          <section className="rounded-xl bg-brand-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-text">Endereço de Entrega</h2>
            <p className="mt-2 text-sm text-brand-text/70">
              {address.street}, {address.number}
              {address.complement ? ` - ${address.complement}` : ""}
              <br />
              {address.neighborhood} - {address.city}/{address.state}
              <br />
              CEP: {address.cep}
            </p>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <section className="rounded-xl bg-brand-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-text">Cliente</h2>
            <p className="mt-2 text-sm text-brand-text/70">
              {order.customer_name}
              <br />
              {order.customer_email}
              <br />
              {order.customer_phone}
            </p>
          </section>

          <section className="rounded-xl bg-brand-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-text">Status</h2>
            <p className="mt-2 text-sm text-brand-text/70">
              Pagamento:{" "}
              <span className="font-medium">{PAYMENT_LABELS[order.payment_status]}</span>
            </p>
            <div className="mt-3">
              <p className="mb-1 text-sm font-medium text-brand-text">Status de entrega</p>
              <OrderStatusSelect orderId={order.id} currentStatus={order.delivery_status} />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
