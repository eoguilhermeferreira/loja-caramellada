import { MercadoPagoConfig, Payment } from "mercadopago";
import { connection } from "next/server";

function getClient() {
  return new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
  });
}

export async function getPaymentClient() {
  await connection();
  return new Payment(getClient());
}
