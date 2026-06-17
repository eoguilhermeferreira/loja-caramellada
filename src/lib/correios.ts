import { XMLParser } from "fast-xml-parser";

const CORREIOS_ENDPOINT =
  "http://ws.correios.com.br/calculador/CalcPrecoPrazo.aspx";

const SERVICE_CODES = {
  PAC: "04510",
  SEDEX: "04014",
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

const parser = new XMLParser();

function parseBrazilianNumber(value: string) {
  return Number(value.replace(/\./g, "").replace(",", "."));
}

async function fetchService(
  service: keyof typeof SERVICE_CODES,
  cepDestino: string
): Promise<ShippingOption | ShippingError> {
  const cepOrigem = process.env.CORREIOS_CEP_ORIGEM ?? "";
  const params = new URLSearchParams({
    nCdEmpresa: "",
    sDsSenha: "",
    nCdServico: SERVICE_CODES[service],
    sCepOrigem: cepOrigem.replace(/\D/g, ""),
    sCepDestino: cepDestino.replace(/\D/g, ""),
    nVlPeso: "0.5",
    nCdFormato: "1",
    nVlComprimento: "20",
    nVlAltura: "10",
    nVlLargura: "15",
    nVlDiametro: "0",
    sCdMaoPropria: "n",
    nVlValorDeclarado: "0",
    sCdAvisoRecebimento: "n",
  });

  try {
    const response = await fetch(`${CORREIOS_ENDPOINT}?${params.toString()}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      return { service, message: "Não foi possível consultar o frete." };
    }

    const xml = await response.text();
    const parsed = parser.parse(xml);
    const resultado = parsed?.Servicos?.cServico;

    if (!resultado) {
      return { service, message: "Resposta inválida dos Correios." };
    }

    const erro = String(resultado.Erro ?? "0");
    if (erro !== "0") {
      return {
        service,
        message: String(resultado.MsgErro || "CEP inválido ou fora da área de entrega."),
      };
    }

    return {
      service,
      price: parseBrazilianNumber(String(resultado.Valor)),
      deadlineDays: Number(resultado.PrazoEntrega),
    };
  } catch {
    return { service, message: "Serviço dos Correios indisponível no momento." };
  }
}

export async function calculateShipping(cepDestino: string) {
  const [pac, sedex] = await Promise.all([
    fetchService("PAC", cepDestino),
    fetchService("SEDEX", cepDestino),
  ]);
  return { pac, sedex };
}
