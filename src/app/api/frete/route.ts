import { NextResponse } from "next/server";
import { calculateShipping } from "@/lib/correios";

function isAvareCep(cep: string) {
  const digits = cep.replace(/\D/g, "");
  return digits.length === 8 && digits.slice(0, 4) === "1870";
}

export async function POST(request: Request) {
  const { cep } = await request.json();

  if (typeof cep !== "string" || cep.replace(/\D/g, "").length !== 8) {
    return NextResponse.json({ error: "CEP inválido." }, { status: 400 });
  }

  if (isAvareCep(cep)) {
    return NextResponse.json({
      freeShipping: true,
      options: [
        { service: "Entrega Local", price: 0, deadlineDays: 2 },
      ],
    });
  }

  const { pac, sedex } = await calculateShipping(cep);
  const options = [pac, sedex].filter(
    (option): option is { service: "PAC" | "SEDEX"; price: number; deadlineDays: number } =>
      "price" in option
  );
  const errors = [pac, sedex].filter(
    (option): option is { service: "PAC" | "SEDEX"; message: string } =>
      "message" in option
  );

  return NextResponse.json({ freeShipping: false, options, errors });
}
