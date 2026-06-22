import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPaymentClient } from "@/lib/mercadopago";

function mapPaymentStatus(
  status: string
): "pendente" | "pago" | "falhou" | "reembolsado" {
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
  const orderId = body?.orderId;
  const formData = body?.formData;

  if (!orderId || !formData) {
    return NextResponse.json({ error: "Dados de pagamento inválidos." }, { status: 400 });
  }

  const supabase = await createAdminClient();

  const { data: order } = await supabase
    .from("orders")
    .select("id, order_number, total, customer_email, payment_status")
    .eq("id", orderId)
    .single();

  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 });
  }

  if (order.payment_status === "pago") {
    return NextResponse.json({ error: "Este pedido já foi pago." }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  try {
    const paymentClient = await getPaymentClient();
    const payment = await paymentClient.create({
      body: {
        ...formData,
        transaction_amount: order.total,
        description: `Pedido ${order.order_number} - Caramellada Kids`,
        external_reference: order.id,
        notification_url: `${siteUrl}/api/mercadopago/webhook`,
      },
    });

    const paymentStatus = mapPaymentStatus(payment.status ?? "");

    await supabase
      .from("orders")
      .update({
        payment_status: paymentStatus,
        mercadopago_payment_id: String(payment.id),
        payment_method: mapPaymentMethod(payment.payment_type_id ?? ""),
      })
      .eq("id", order.id);

    return NextResponse.json({
      orderNumber: order.order_number,
      status: payment.status,
      statusDetail: payment.status_detail,
      paymentTypeId: payment.payment_type_id,
      pix:
        payment.payment_type_id === "bank_transfer"
          ? {
              qrCode: payment.point_of_interaction?.transaction_data?.qr_code,
              qrCodeBase64:
                payment.point_of_interaction?.transaction_data?.qr_code_base64,
            }
          : null,
      boleto:
        payment.payment_type_id === "ticket"
          ? {
              url: payment.transaction_details?.external_resource_url,
              digitableLine: payment.transaction_details?.digitable_line,
            }
          : null,
    });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível processar o pagamento. Tente novamente." },
      { status: 500 }
    );
  }
}
