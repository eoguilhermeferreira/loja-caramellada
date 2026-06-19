"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";

type PaymentResult = {
  orderNumber: string;
  status: string;
  statusDetail?: string;
  paymentTypeId?: string;
  pix?: { qrCode?: string; qrCodeBase64?: string } | null;
  boleto?: { url?: string; digitableLine?: string } | null;
};

const STATUS_LABELS: Record<string, string> = {
  approved: "Pagamento aprovado!",
  in_process: "Pagamento em análise.",
  pending: "Pagamento pendente.",
  rejected: "Pagamento rejeitado. Tente outro método ou cartão.",
};

let initialized = false;

export function PaymentBrick({
  orderId,
  amount,
  email,
  onApproved,
}: {
  orderId: string;
  amount: number;
  email: string;
  onApproved?: () => void;
}) {
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialized) return;
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
    if (publicKey) {
      initMercadoPago(publicKey, { locale: "pt-BR" });
      initialized = true;
    }
  }, []);

  if (result) {
    return (
      <div className="rounded-xl bg-brand-white p-5 text-center shadow-sm">
        <p className="text-lg font-semibold text-brand-text">
          {STATUS_LABELS[result.status] ?? "Pagamento registrado."}
        </p>
        <p className="mt-1 text-sm text-brand-text/60">
          Pedido #{result.orderNumber}
        </p>

        {result.pix?.qrCodeBase64 && (
          <div className="mt-4 flex flex-col items-center gap-3">
            <p className="text-sm text-brand-text/80">
              Escaneie o QR Code com o app do seu banco para pagar via Pix:
            </p>
            <Image
              src={`data:image/png;base64,${result.pix.qrCodeBase64}`}
              alt="QR Code Pix"
              width={220}
              height={220}
              unoptimized
            />
            {result.pix.qrCode && (
              <div className="flex w-full flex-col gap-2">
                <p className="text-xs text-brand-text/60">
                  Ou copie o código abaixo:
                </p>
                <textarea
                  readOnly
                  value={result.pix.qrCode}
                  className="w-full rounded-lg border border-brand-secondary p-2 text-xs text-brand-text/80"
                  rows={3}
                />
                <button
                  onClick={() => navigator.clipboard.writeText(result.pix!.qrCode!)}
                  className="self-center rounded-full border border-brand-primary px-4 py-1.5 text-sm font-medium text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
                >
                  Copiar código Pix
                </button>
              </div>
            )}
          </div>
        )}

        {result.boleto?.url && (
          <div className="mt-4 flex flex-col items-center gap-3">
            <p className="text-sm text-brand-text/80">
              Seu boleto foi gerado. Pague até o vencimento para confirmar o pedido.
            </p>
            {result.boleto.digitableLine && (
              <p className="break-all rounded-lg border border-brand-secondary p-2 text-xs text-brand-text/80">
                {result.boleto.digitableLine}
              </p>
            )}
            <a
              href={result.boleto.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-accent"
            >
              Visualizar Boleto
            </a>
          </div>
        )}

        {result.paymentTypeId === "credit_card" ||
        result.paymentTypeId === "debit_card" ? (
          <p className="mt-3 text-sm text-brand-text/70">
            {result.statusDetail}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="rounded-xl bg-brand-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-brand-text">
        Forma de Pagamento
      </h2>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <div className="mt-4">
        <Payment
          initialization={{ amount, payer: { email } }}
          customization={{
            paymentMethods: {
              creditCard: "all",
              debitCard: "all",
              ticket: "all",
              bankTransfer: "all",
            },
          }}
          onSubmit={async ({ formData }) => {
            setError(null);
            try {
              const response = await fetch("/api/pagamento", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, formData }),
              });
              const data = await response.json();
              if (!response.ok) {
                setError(data.error || "Não foi possível processar o pagamento.");
                return;
              }
              setResult(data);
              if (data.status === "approved") {
                onApproved?.();
              }
            } catch {
              setError("Não foi possível processar o pagamento agora. Tente novamente.");
            }
          }}
          onError={() => {
            setError("Ocorreu um erro ao carregar a forma de pagamento.");
          }}
        />
      </div>
    </div>
  );
}
