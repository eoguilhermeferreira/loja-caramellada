import { connection } from "next/server";
import { Resend } from "resend";

const STORE = {
  name: "Caramellada Kids",
  whatsapp: "14998527889",
  whatsappDisplay: "(14) 99852-7889",
  address: "Rua Minas Gerais, 667 - Centro, Avaré/SP",
  cep: "18708-863",
  cnpj: "38.219.114/0001-08",
};

const STATUS_CONTENT: Record<
  string,
  { subject: string; heading: string; body: (trackingUrl: string | null) => string }
> = {
  preparando: {
    subject: "Seu pedido foi aceito! 🎉",
    heading: "Seu pedido foi aceito!",
    body: () =>
      "Já estamos preparando tudo com bastante cuidado e carinho. Assim que o pacote for enviado, você recebe um novo e-mail com o código de rastreio.",
  },
  enviado: {
    subject: "Seu pedido foi enviado! 📦",
    heading: "Seu pedido foi enviado!",
    body: (trackingUrl) =>
      trackingUrl
        ? `Seu pacote já está a caminho! Você pode acompanhar a entrega pelo link abaixo:<br /><a href="${trackingUrl}" style="color:#c2185b;">${trackingUrl}</a>`
        : "Seu pacote já está a caminho! Em breve o código de rastreio estará disponível.",
  },
  entregue: {
    subject: "Seu pedido foi entregue! 💛",
    heading: "Seu pedido foi entregue!",
    body: () =>
      "Esperamos que tenha amado cada detalhe! Se precisar de qualquer coisa, é só nos chamar.",
  },
  cancelado: {
    subject: "Seu pedido foi cancelado",
    heading: "Seu pedido foi cancelado",
    body: () =>
      "Seu pedido foi cancelado. Se você não pediu esse cancelamento ou tiver dúvidas, fale com a gente pelo WhatsApp.",
  },
};

export async function sendOrderStatusEmail({
  customerEmail,
  customerName,
  orderNumber,
  status,
  trackingUrl,
}: {
  customerEmail: string;
  customerName: string;
  orderNumber: number;
  status: string;
  trackingUrl?: string | null;
}) {
  await connection();
  const apiKey = process.env.RESEND_API_KEY ?? "";
  if (!apiKey) return;

  const resend = new Resend(apiKey);
  const content = STATUS_CONTENT[status];
  if (!content) return;

  const whatsappLink = `https://wa.me/55${STORE.whatsapp}`;

  const html = `
    <div style="font-family: sans-serif; color: #4a3a3a; max-width: 480px;">
      <p>Olá, ${customerName}!</p>
      <h2 style="color: #c2185b;">${content.heading}</h2>
      <p>Pedido <strong>#${orderNumber}</strong></p>
      <p>${content.body(trackingUrl ?? null)}</p>
      <p>Qualquer dúvida, estamos por aqui! Manda uma mensagem pra gente no WhatsApp: <a href="${whatsappLink}" style="color:#c2185b;">${STORE.whatsappDisplay}</a>.</p>
      <p>Obrigada por comprar na ${STORE.name} e fazer parte da nossa história. Esperamos te ver por aqui de novo em breve! 💛</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
      <p style="font-size: 12px; color: #999;">
        ${STORE.name}<br />
        ${STORE.address} - CEP ${STORE.cep}<br />
        CNPJ: ${STORE.cnpj}
      </p>
    </div>
  `;

  try {
    const result = await resend.emails.send({
      from: `${STORE.name} <pedidos@caramelladakidsavare.com.br>`,
      to: customerEmail,
      subject: `Pedido #${orderNumber} - ${content.subject}`,
      html,
    });
    if (result.error) {
      console.error("[email] Resend retornou erro:", result.error);
    } else {
      console.log("[email] Enviado com sucesso:", result.data?.id);
    }
  } catch (err) {
    console.error("[email] Falha ao enviar e-mail:", err);
  }
}
