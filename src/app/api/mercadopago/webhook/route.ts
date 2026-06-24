import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentClient } from "@/lib/mercadopago";

function mapPaymentStatus(status: string): "pendente" | "pago" | "falhou" | "reembolsado" {
  switch (status) {
    case "approved":
      return "pago";
    case "refunded":
    case "charged_back":
      return "reembolsado";
    case "rejected":
    case "cancelled":
      return "falhou";
    default:
      return "pendente";
  }
}

function mapPaymentMethod(
  paymentTypeId: string
): "pix" | "cartao_credito" | "cartao_debito" | "boleto" | null {
  if (paymentTypeId === "bank_transfer" || paymentTypeId === "pix") return "pix";
  if (paymentTypeId === "credit_card") return "cartao_credito";
  if (paymentTypeId === "debit_card") return "cartao_debito";
  if (paymentTypeId === "ticket") return "boleto";
  return null;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const paymentId = body?.data?.id ?? new URL(request.url).searchParams.get("id");

  if (!paymentId) {
    return NextResponse.json({ received: true });
  }

  try {
    const paymentClient = await getPaymentClient();
    const payment = await paymentClient.get({ id: paymentId });

    const orderId = payment.external_reference;
    if (!orderId) {
      return NextResponse.json({ received: true });
    }

    const supabase = await createAdminClient();
    const paymentStatus = mapPaymentStatus(payment.status ?? "");

    const { data: order } = await supabase
      .from("orders")
      .select("id, payment_status")
      .eq("id", orderId)
      .single();

    if (!order) {
      return NextResponse.json({ received: true });
    }

    await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus,
        mercadopago_payment_id: String(payment.id),
        payment_method: mapPaymentMethod(payment.payment_type_id ?? ""),
      })
      .eq("id", orderId);

    if (paymentStatus === "pago" && order.payment_status !== "pago") {
      const { data: items } = await supabase
        .from("order_items")
        .select("product_id, quantity, size")
        .eq("order_id", orderId);

      for (const item of items ?? []) {
        if (!item.product_id) continue;

        if (item.size) {
          const { data: sizeRow } = await supabase
            .from("product_sizes")
            .select("id, stock")
            .eq("product_id", item.product_id)
            .eq("size", item.size)
            .single();

          if (sizeRow) {
            await supabase
              .from("product_sizes")
              .update({ stock: Math.max(0, sizeRow.stock - item.quantity) })
              .eq("id", sizeRow.id);
          }
        }

        const { data: productRow } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.product_id)
          .single();

        if (productRow) {
          await supabase
            .from("products")
            .update({ stock: Math.max(0, productRow.stock - item.quantity) })
            .eq("id", item.product_id);
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[mercadopago-webhook] Falha ao processar notificação:", err);
    return NextResponse.json({ received: true });
  }
}
