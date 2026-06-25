import { connection } from "next/server";

const MELHOR_ENVIO_ENDPOINT =
  "https://www.melhorenvio.com.br/api/v2/me/shipment/calculate";

export type ShippingOption = {
  service: string;
  price: number;
  deadlineDays: number;
};

export type ShippingError = {
  service: string;
  message: string;
};

type MelhorEnvioItem = {
  id: number;
  name?: string;
  company?: { name?: string };
  price?: string;
  delivery_time?: number;
  error?: string | null;
};

const ALLOWED_SERVICES: { company: string; name: string }[] = [
  { company: "Correios", name: "PAC" },
  { company: "Correios", name: "SEDEX" },
  { company: "Jadlog", name: ".Package" },
  { company: "Jadlog", name: ".Com" },
  { company: "Loggi", name: "Loggi" },
];

function isAllowedService(item: MelhorEnvioItem) {
  const company = item.company?.name ?? "";
  const name = item.name ?? "";
  return ALLOWED_SERVICES.some(
    (allowed) => company.includes(allowed.company) && name.includes(allowed.name)
  );
}

export type PackageInfo = {
  height: number;
  width: number;
  length: number;
  weight: number;
};

const DEFAULT_PACKAGE: PackageInfo = { height: 10, width: 15, length: 20, weight: 0.5 };

export async function calculateShipping(
  cepDestino: string,
  pkg: PackageInfo = DEFAULT_PACKAGE
) {
  await connection();
  const token = process.env.MELHOR_ENVIO_TOKEN ?? "";
  const cepOrigem = (process.env.CORREIOS_CEP_ORIGEM ?? "").replace(/\D/g, "");

  const unavailable = (message: string) => ({
    options: [] as ShippingOption[],
    errors: [{ service: "Frete", message }] as ShippingError[],
  });

  if (!token) {
    return unavailable("Cálculo de frete indisponível no momento.");
  }

  try {
    const response = await fetch(MELHOR_ENVIO_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "Caramellada Kids (marciadamiao@hotmail.com)",
      },
      body: JSON.stringify({
        from: { postal_code: cepOrigem },
        to: { postal_code: cepDestino.replace(/\D/g, "") },
        package: pkg,
        options: { insurance_value: 0, receipt: false, own_hand: false },
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      return unavailable("Não foi possível consultar o frete.");
    }

    const data: MelhorEnvioItem[] = await response.json();

    const options: ShippingOption[] = [];
    const errors: ShippingError[] = [];

    for (const item of data) {
      if (!isAllowedService(item)) continue;

      const service = [item.company?.name, item.name].filter(Boolean).join(" ") || "Frete";
      if (item.error) {
        errors.push({ service, message: item.error });
        continue;
      }
      options.push({
        service,
        price: Number(item.price),
        deadlineDays: Number(item.delivery_time),
      });
    }

    return { options, errors };
  } catch {
    return unavailable("Serviço de frete indisponível no momento.");
  }
}
