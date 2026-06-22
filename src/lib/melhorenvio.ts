import { connection } from "next/server";

const MELHOR_ENVIO_ENDPOINT =
  "https://www.melhorenvio.com.br/api/v2/me/shipment/calculate";

const SERVICE_IDS = {
  PAC: 1,
  SEDEX: 2,
} as const;

export type ShippingOption = {
  service: "PAC" | "SEDEX";
  price: number;
  deadlineDays: number;
};

export type ShippingError = {
  service: "PAC" | "SEDEX";
  message: string;
};

type MelhorEnvioItem = {
  id: number;
  price?: string;
  delivery_time?: number;
  error?: string | null;
};

export async function calculateShipping(cepDestino: string) {
  await connection();
  const token = process.env.MELHOR_ENVIO_TOKEN ?? "";
  const cepOrigem = (process.env.CORREIOS_CEP_ORIGEM ?? "").replace(/\D/g, "");

  if (!token) {
    const message = "Cálculo de frete indisponível no momento.";
    return {
      pac: { service: "PAC" as const, message },
      sedex: { service: "SEDEX" as const, message },
    };
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
        package: { height: 10, width: 15, length: 20, weight: 0.5 },
        options: { insurance_value: 0, receipt: false, own_hand: false },
        services: `${SERVICE_IDS.PAC},${SERVICE_IDS.SEDEX}`,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      const message = "Não foi possível consultar o frete.";
      return {
        pac: { service: "PAC" as const, message },
        sedex: { service: "SEDEX" as const, message },
      };
    }

    const data: MelhorEnvioItem[] = await response.json();

    function toResult(
      service: "PAC" | "SEDEX"
    ): ShippingOption | ShippingError {
      const item = data.find((entry) => entry.id === SERVICE_IDS[service]);
      if (!item) {
        return { service, message: "Serviço indisponível para este CEP." };
      }
      if (item.error) {
        return { service, message: item.error };
      }
      return {
        service,
        price: Number(item.price),
        deadlineDays: Number(item.delivery_time),
      };
    }

    return {
      pac: toResult("PAC"),
      sedex: toResult("SEDEX"),
    };
  } catch {
    const message = "Serviço de frete indisponível no momento.";
    return {
      pac: { service: "PAC" as const, message },
      sedex: { service: "SEDEX" as const, message },
    };
  }
}
