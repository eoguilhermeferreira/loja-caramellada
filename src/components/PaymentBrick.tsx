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

type Address = {
  cep: string;
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
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
  name,
  cpf,
  address,
  onApproved,
}: {
  orderId: string;
  amount: number;
  email: string;
  name: string;
  cpf: string;
  address: Address;
  onApproved?: () => void;
}) {
  const [method, setMethod] = useState<"cartao" | "pix" | "boleto">("cartao");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<PaymentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function copyPixCode(code: string) {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        throw new Error("clipboard API indisponível");
      }
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = code;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  useEffect(() => {
    if (initialized) return;
    const publicKey = process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY;
    if (publicKey) {
      initMercadoPago(publicKey, { locale: "pt-BR" });
      initialized = true;
    }
  }, []);

  async function submitPayment(formData: object) {
    setError(null);
    setGenerating(true);
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
    } finally {
      setGenerating(false);
    }
  }

  function generatePix() {
    const [firstName, ...rest] = name.trim().split(" ");
    submitPayment({
      payment_method_id: "pix",
      payer: {
        email,
        first_name: firstName,
        last_name: rest.join(" ") || firstName,
        identification: { type: "CPF", number: cpf },
      },
    });
  }

  function generateBoleto() {
    const [firstName, ...rest] = name.trim().split(" ");
    submitPayment({
      payment_method_id: "bolbradesco",
      payer: {
        email,
        first_name: firstName,
        last_name: rest.join(" ") || firstName,
        identification: { type: "CPF", number: cpf },
        address: {
          zip_code: address.cep,
          street_name: address.street,
          street_number: address.number,
          neighborhood: address.neighborhood,
          city: address.city,
          federal_unit: address.state,
        },
      },
    });
  }

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
                  onClick={() => copyPixCode(result.pix!.qrCode!)}
                  className="self-center rounded-full border border-brand-primary px-4 py-1.5 text-sm font-medium text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
                >
                  {copied ? "Copiado!" : "Copiar código Pix"}
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

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setMethod("cartao")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            method === "cartao"
              ? "bg-brand-primary text-white"
              : "bg-brand-secondary/20 text-brand-text"
          }`}
        >
          Cartão
        </button>
        <button
          onClick={() => setMethod("pix")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            method === "pix"
              ? "bg-brand-primary text-white"
              : "bg-brand-secondary/20 text-brand-text"
          }`}
        >
          Pix
        </button>
        <button
          onClick={() => setMethod("boleto")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            method === "boleto"
              ? "bg-brand-primary text-white"
              : "bg-brand-secondary/20 text-brand-text"
          }`}
        >
          Boleto
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      {method === "cartao" && (
        <div className="mt-4">
          <Payment
            initialization={{ amount, payer: { email } }}
            customization={{
              paymentMethods: {
                creditCard: "all",
                debitCard: "all",
              },
            }}
            onSubmit={async ({ formData }) => {
              await submitPayment(formData);
            }}
            onError={() => {
              setError("Ocorreu um erro ao carregar o formulário do cartão.");
            }}
          />
        </div>
      )}

      {method === "pix" && (
        <div className="mt-4 flex flex-col items-center gap-3 py-6">
          <p className="text-center text-sm text-brand-text/70">
            Clique no botão para gerar o QR Code do Pix.
          </p>
          <button
            onClick={generatePix}
            disabled={generating}
            className="rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-accent disabled:opacity-60"
          >
            {generating ? "Gerando..." : "Gerar PIX"}
          </button>
        </div>
      )}

      {method === "boleto" && (
        <div className="mt-4 flex flex-col items-center gap-3 py-6">
          <p className="text-center text-sm text-brand-text/70">
            Clique no botão para gerar o boleto.
          </p>
          <button
            onClick={generateBoleto}
            disabled={generating}
            className="rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-accent disabled:opacity-60"
          >
            {generating ? "Gerando..." : "Gerar Boleto"}
          </button>
        </div>
      )}
    </div>
  );
}
