"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus, updateTrackingUrl } from "@/app/admin/actions";

const STATUSES = [
  { value: "preparando", label: "Preparando" },
  { value: "enviado", label: "Enviado" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
] as const;

export function OrderStatusSelect({
  orderId,
  currentStatus,
  currentTrackingUrl,
}: {
  orderId: string;
  currentStatus: string;
  currentTrackingUrl: string | null;
}) {
  const router = useRouter();
  const [trackingUrl, setTrackingUrl] = useState(currentTrackingUrl ?? "");
  const [savingTracking, setSavingTracking] = useState(false);

  async function handleChange(value: string) {
    if (value === "enviado" && trackingUrl.trim()) {
      await updateTrackingUrl(orderId, trackingUrl);
    }
    await updateOrderStatus(
      orderId,
      value as "preparando" | "enviado" | "entregue" | "cancelado"
    );
    router.refresh();
  }

  async function handleSaveTracking() {
    setSavingTracking(true);
    try {
      await updateTrackingUrl(orderId, trackingUrl);
      router.refresh();
    } finally {
      setSavingTracking(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <select
        defaultValue={currentStatus}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary"
      >
        {STATUSES.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </select>

      <div>
        <p className="mb-1 text-sm font-medium text-brand-text">Link de rastreio</p>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="https://rastreamento.melhorenvio.com.br/..."
            value={trackingUrl}
            onChange={(e) => setTrackingUrl(e.target.value)}
            className="w-full rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary"
          />
          <button
            onClick={handleSaveTracking}
            disabled={savingTracking}
            className="rounded-lg bg-brand-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-accent disabled:opacity-60"
          >
            Salvar
          </button>
        </div>
        <p className="mt-1 text-xs text-brand-text/50">
          Cole aqui o link de rastreio depois de gerar a etiqueta no Melhor Envio. Ele será incluído no e-mail enviado ao cliente.
        </p>
      </div>
    </div>
  );
}
