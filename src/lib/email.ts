import { connection } from "next/server";
import { Resend } from "resend";

const STATUS_LABELS: Record<string, string> = {
  processando: "Processando",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

export async function sendOrderStatusEmail({
  customerEmail,
  customerName,
  orderNumber,
  status,
}: {
  customerEmail: string;
  customerName: string;
  orderNumber: number;
  status: string;
}) {
  await connection();
  const apiKey = process.env.RESEND_API_KEY ?? "";
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  const statusLabel = STATUS_LABELS[status] ?? status;

  try {
    await resend.emails.send({
      from: "Caramellada Kids <onboarding@resend.dev>",
      to: customerEmail,
      subject: `Pedido #${orderNumber} - ${statusLabel}`,
      html: `
        <p>Olá, ${customerName}!</p>
        <p>O status do seu pedido <strong>#${orderNumber}</strong> foi atualizado para: <strong>${statusLabel}</strong>.</p>
        <p>Obrigado por comprar na Caramellada Kids!</p>
      `,
    });
  } catch {
    // falha no envio de e-mail não deve impedir a atualização do pedido
  }
}
