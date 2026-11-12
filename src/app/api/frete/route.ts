import { NextResponse } from "next/server";
import { calculateShipping } from "@/lib/melhorenvio";
import { createClient } from "@/lib/supabase/server";
import { AVARE_SHIPPING_COST, isAvareCep } from "@/config/store";


async function buildPackage(items: { productId: string; quantity: number }[]) {
  if (!items || items.length === 0) return undefined;

  const supabase = await createClient();
  const ids = [...new Set(items.map((i) => i.productId))];
  const { data: products } = await supabase
    .from("products")
    .select("id, weight_grams")
    .in("id", ids);

  const weightsById = new Map((products ?? []).map((p) => [p.id, p.weight_grams]));
  const totalGrams = items.reduce(
    (sum, item) => sum + (weightsById.get(item.productId) ?? 300) * item.quantity,
    0
  );
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    height: 10,
    width: 15,
    length: Math.min(20 + Math.floor(totalItems / 3) * 5, 100),
    weight: Math.max(totalGrams / 1000, 0.3),
  };
}

export async function POST(request: Request) {
  const { cep, items } = await request.json();

  if (typeof cep !== "string" || cep.replace(/\D/g, "").length !== 8) {
    return NextResponse.json({ error: "CEP inválido." }, { status: 400 });
  }

  if (isAvareCep(cep)) {
    return NextResponse.json({
      freeShipping: false,
      options: [
        { service: "Entrega Local (Avaré)", price: AVARE_SHIPPING_COST, deadlineDays: 1 },
      ],
    });
  }

  const pkg = await buildPackage(Array.isArray(items) ? items : []);
  const { options, errors } = await calculateShipping(cep, pkg);

  return NextResponse.json({ freeShipping: false, options, errors });
}
