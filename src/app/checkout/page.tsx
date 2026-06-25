"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart, cartItemKey } from "@/components/CartProvider";
import { BackButton } from "@/components/BackButton";
import { PaymentBrick } from "@/components/PaymentBrick";
import { formatPrice } from "@/lib/format";

const BRAZIL_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
];

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

function formatCpf(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

export default function CheckoutPage() {
  const { items, totalPrice, clear } = useCart();
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cpf, setCpf] = useState("");

  const [cep, setCep] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [shippingResult, setShippingResult] = useState<ShippingResult | null>(null);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [shippingLoading, setShippingLoading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [order, setOrder] = useState<{ id: string; total: number } | null>(null);

  useEffect(() => {
    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) return;

    let cancelled = false;
    setAddressLoading(true);
    fetch(`https://viacep.com.br/ws/${digits}/json/`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled || data.erro) return;
        setStreet(data.logradouro ?? "");
        setNeighborhood(data.bairro ?? "");
        setCity(data.localidade ?? "");
        setState(data.uf ?? "");
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setAddressLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [cep]);

  async function handleCalculateShipping() {
    setError(null);
    setShippingResult(null);
    setSelectedShipping(null);

    const digits = cep.replace(/\D/g, "");
    if (digits.length !== 8) {
      setError("Digite um CEP válido com 8 dígitos.");
      return;
    }

    setShippingLoading(true);
    try {
      const response = await fetch("/api/frete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cep: digits,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Não foi possível calcular o frete.");
        return;
      }
      setShippingResult(data);
      if (data.options?.length === 1) {
        setSelectedShipping(data.options[0]);
      }
    } catch {
      setError("Não foi possível calcular o frete agora. Tente novamente.");
    } finally {
      setShippingLoading(false);
    }
  }

  async function handleSubmit() {
    setError(null);

    if (!name || !email || !phone || cpf.replace(/\D/g, "").length !== 11) {
      setError("Preencha seus dados de contato, incluindo um CPF válido.");
      return;
    }
    if (!cep || !street || !number || !neighborhood || !city || !state) {
      setError("Preencha o endereço completo.");
      return;
    }
    if (!selectedShipping) {
      setError("Calcule e selecione uma opção de frete.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
          })),
          customer: { name, email, phone },
          address: {
            cep: cep.replace(/\D/g, ""),
            street,
            number,
            complement,
            neighborhood,
            city,
            state,
          },
          shipping: {
            method: selectedShipping.service,
            cost: selectedShipping.price,
          },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Não foi possível finalizar a compra.");
        return;
      }

      setOrder({ id: data.orderId, total: data.total });
    } catch {
      setError("Não foi possível finalizar a compra agora. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-2xl animate-fade-in px-4 py-16 text-center sm:px-6">
        <BackButton />
        <h1 className="text-2xl font-semibold text-brand-text">
          Seu carrinho está vazio
        </h1>
        <button
          onClick={() => router.push("/produtos")}
          className="mt-6 inline-block rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-accent"
        >
          Ver Produtos
        </button>
      </main>
    );
  }

  const shippingCost = selectedShipping?.price ?? 0;

  return (
    <main className="mx-auto max-w-5xl animate-fade-in px-4 py-10 sm:px-6">
      <BackButton />
      <h1 className="text-2xl font-semibold text-brand-text">Finalizar Compra</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-3">
        <fieldset disabled={!!order} className="flex flex-col gap-6 lg:col-span-2 disabled:opacity-60">
          <section className="rounded-xl bg-brand-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-text">
              Dados de Contato
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                type="text"
                placeholder="Nome completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary sm:col-span-2"
              />
              <input
                type="email"
                placeholder="E-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary"
              />
              <input
                type="tel"
                placeholder="Telefone / WhatsApp"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary"
              />
              <input
                type="text"
                inputMode="numeric"
                placeholder="CPF"
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                className="rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary"
              />
            </div>
          </section>

          <section className="rounded-xl bg-brand-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-brand-text">
              Endereço de Entrega
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="flex gap-2 sm:col-span-1">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="00000-000"
                  value={cep}
                  onChange={(e) => setCep(formatCep(e.target.value))}
                  className="w-full rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary"
                />
              </div>
              <input
                type="text"
                placeholder={addressLoading ? "Buscando endereço..." : "Rua"}
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                disabled={addressLoading}
                className="rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary disabled:opacity-60 sm:col-span-2"
              />
              <input
                type="text"
                placeholder="Número"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                className="rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary"
              />
              <input
                type="text"
                placeholder="Complemento (opcional)"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
                className="rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary"
              />
              <input
                type="text"
                placeholder="Bairro"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary"
              />
              <input
                type="text"
                placeholder="Cidade"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary"
              />
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="rounded-lg border border-brand-secondary px-3 py-2 text-sm outline-none focus:border-brand-primary"
              >
                <option value="">Estado</option>
                {BRAZIL_STATES.map((uf) => (
                  <option key={uf} value={uf}>
                    {uf}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-4">
              <button
                onClick={handleCalculateShipping}
                disabled={shippingLoading}
                className="rounded-lg bg-brand-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-accent disabled:opacity-60"
              >
                {shippingLoading ? "Calculando..." : "Calcular Frete"}
              </button>

              {shippingResult && (
                <div className="mt-3 flex flex-col gap-2">
                  {shippingResult.freeShipping && (
                    <p className="text-sm font-medium text-brand-primary">
                      Frete grátis para Avaré!
                    </p>
                  )}
                  {shippingResult.options.map((option) => (
                    <label
                      key={option.service}
                      className={`flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 text-sm transition-colors ${
                        selectedShipping?.service === option.service
                          ? "border-brand-primary bg-brand-secondary/20"
                          : "border-brand-secondary"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="radio"
                          name="shipping"
                          checked={selectedShipping?.service === option.service}
                          onChange={() => setSelectedShipping(option)}
                        />
                        <span className="font-medium text-brand-text">
                          {option.service}
                        </span>
                      </span>
                      <span className="text-brand-text/80">
                        {option.price === 0 ? "Grátis" : formatPrice(option.price)} ·{" "}
                        {option.deadlineDays}{" "}
                        {option.deadlineDays === 1 ? "dia útil" : "dias úteis"}
                      </span>
                    </label>
                  ))}
                  {shippingResult.errors?.map((err) => (
                    <p key={err.service} className="text-xs text-brand-text/50">
                      {err.service}: {err.message}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </section>
        </fieldset>

        <aside className="h-fit rounded-xl bg-brand-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-brand-text">
            Resumo do Pedido
          </h2>

          <ul className="mt-4 flex flex-col gap-2 text-sm text-brand-text/80">
            {items.map((item) => (
              <li
                key={cartItemKey(item.productId, item.size, item.color)}
                className="flex justify-between"
              >
                <span>
                  {item.name} x{item.quantity}
                </span>
                <span>{formatPrice(item.unitPrice * item.quantity)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 flex items-center justify-between border-t border-brand-secondary/60 pt-4 text-sm text-brand-text/70">
            <span>Subtotal</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-sm text-brand-text/70">
            <span>Frete</span>
            <span>
              {selectedShipping
                ? shippingCost === 0
                  ? "Grátis"
                  : formatPrice(shippingCost)
                : "A calcular"}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-brand-secondary/60 pt-4 text-base font-semibold text-brand-text">
            <span>Total</span>
            <span>{formatPrice(totalPrice + shippingCost)}</span>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          {!order && (
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="mt-5 block w-full rounded-full bg-brand-primary px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-brand-accent disabled:opacity-60"
            >
              {submitting ? "Processando..." : "Pagar"}
            </button>
          )}
        </aside>

        {order && (
          <div className="lg:col-span-3">
            <PaymentBrick
              orderId={order.id}
              amount={order.total}
              email={email}
              name={name}
              cpf={cpf.replace(/\D/g, "")}
              address={{ cep, street, number, neighborhood, city, state }}
              onApproved={() => {
                clear();
                setTimeout(() => router.push("/checkout/sucesso"), 1500);
              }}
            />
          </div>
        )}
      </div>
    </main>
  );
}
