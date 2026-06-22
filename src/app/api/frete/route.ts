import { NextResponse } from "next/server";
import { calculateShipping } from "@/lib/melhorenvio";

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
        { service: "Entrega Local", price: 0, deadlineDays: 1 },
      ],
    });
  }

  const { options, errors } = await calculateShipping(cep);

  return NextResponse.json({ freeShipping: false, options, errors });
}
