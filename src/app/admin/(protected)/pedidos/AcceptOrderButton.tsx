"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { acceptOrder } from "@/app/admin/actions";

export function AcceptOrderButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAccept() {
    setLoading(true);
    try {
      await acceptOrder(orderId);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleAccept}
      disabled={loading}
      className="w-full rounded-lg bg-brand-primary px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-accent disabled:opacity-60"
    >
      {loading ? "Aceitando..." : "Aceitar Pedido"}
    </button>
  );
}
