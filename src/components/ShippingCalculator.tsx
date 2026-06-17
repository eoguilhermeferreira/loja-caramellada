"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";

type ShippingOption = {
  service: string;
  price: number;
  deadlineDays: number;
};

type ShippingResult = {
  freeShipping: boolean;
  options: ShippingOption[];
  errors?: { service: string; message: string }[];
};

function formatCep(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function ShippingCalculator() {
  const [cep, setCep] = useState("");
  const [result, setResult] = useState<ShippingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCalculate() {
    setError(null);
    setResult(null);

    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setError("Digite um CEP válido com 8 dígitos.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cep: digits }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Não foi possível calcular o frete.");
        return;
      }
      setResult(data);
    } catch {
      setError("Não foi possível calcular o frete agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-brand-secondary/60 p-4">
      <p className="text-sm font-medium text-brand-text">Calcular frete</p>
      <div className="mt-2 flex gap-2">
        <input
          type="text"
          inputMode="numeric"
          placeholder="00000-000"
          value={cep}
          onChange={(e) => setCep(formatCep(e.target.value))}
          onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
          className="w-full rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary"
        />
        <button
          onClick={handleCalculate}
          disabled={loading}
          className="shrink-0 rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-accent disabled:opacity-60"
        >
          {loading ? "Calculando..." : "Calcular"}
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {result && (
        <div className="mt-3 flex flex-col gap-2">
          {result.freeShipping && (
            <p className="text-sm font-medium text-brand-primary">
              Frete grátis para Avaré!
            </p>
          )}

          {result.options.map((option) => (
            <div
              key={option.service}
              className="flex items-center justify-between rounded-lg bg-brand-secondary/30 px-3 py-2 text-sm"
            >
              <span className="font-medium text-brand-text">
                {option.service}
              </span>
              <span className="text-brand-text/80">
                {option.price === 0 ? "Grátis" : formatPrice(option.price)} ·{" "}
                {option.deadlineDays}{" "}
                {option.deadlineDays === 1 ? "dia útil" : "dias úteis"}
              </span>
            </div>
          ))}

          {result.errors?.map((err) => (
            <p key={err.service} className="text-xs text-brand-text/50">
              {err.service}: {err.message}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
