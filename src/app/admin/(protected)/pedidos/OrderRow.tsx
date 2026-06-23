"use client";

import { useRouter } from "next/navigation";
import { formatPrice } from "@/lib/format";

const PAYMENT_LABELS: Record<string, string> = {
  pendente: "Pendente",
  pago: "Pago",
  falhou: "Falhou",
  reembolsado: "Reembolsado",
};

const DELIVERY_LABELS: Record<string, string> = {
  processando: "Processando",
  preparando: "Preparando",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export function OrderRow({
  order,
}: {
  order: {
    id: string;
    order_number: number;
    customer_name: string;
    total: number;
    payment_status: string;
    delivery_status: string;
    created_at: string;
  };
}) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(`/admin/pedidos/${order.id}`)}
      className="cursor-pointer border-b border-brand-secondary/30 hover:bg-brand-secondary/10"
    >
      <td className="px-4 py-3 font-medium text-brand-text">
        <span className="flex items-center gap-2">
          #{order.order_number}
          {order.delivery_status === "processando" && (
            <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary/10 px-2 py-0.5 text-xs font-semibold text-brand-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-primary" />
              Novo
            </span>
          )}
        </span>
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
  );
}
