import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { AVARE_SHIPPING_COST, isAvareCep } from "@/config/store";

const PICKUP_METHOD = "Retirar na Loja";

type CheckoutItem = {
  productId: string;
  quantity: number;
  size: string | null;
  color: string | null;
};

type CheckoutBody = {
  items: CheckoutItem[];
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  address: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  shipping: {
    method: string;
    cost: number;
  };
};


export async function POST(request: Request) {
  const body: CheckoutBody = await request.json();

  if (!body.items?.length) {
    return NextResponse.json({ error: "Carrinho vazio." }, { status: 400 });
  }
  if (!body.customer?.name || !body.customer?.email || !body.customer?.phone) {
    return NextResponse.json(
      { error: "Dados do cliente incompletos." },
      { status: 400 }
    );
  }
  if (
    !body.address?.cep ||
    !body.address?.street ||
    !body.address?.number ||
    !body.address?.neighborhood ||
    !body.address?.city ||
    !body.address?.state
  ) {
    return NextResponse.json(
      { error: "Endereço incompleto." },
      { status: 400 }
    );
  }

  const supabase = await createAdminClient();

  const productIds = [...new Set(body.items.map((item) => item.productId))];
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select("id, name, price, promo_price, stock, is_active, product_sizes(id, size, stock, color, price)")
    .in("id", productIds);

  if (productsError || !products) {
    return NextResponse.json(
      { error: "Não foi possível validar os produtos." },
      { status: 500 }
    );
  }

  const orderItemsToInsert: {
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    size: string | null;
    color: string | null;
  }[] = [];

  let subtotal = 0;

  for (const cartItem of body.items) {
    const product = products.find((p) => p.id === cartItem.productId);
    if (!product || !product.is_active) {
      return NextResponse.json(
        { error: "Um dos produtos do carrinho não está mais disponível." },
        { status: 400 }
      );
    }

    const hasColorVariations = product.product_sizes.some((s) => s.color);
    const variation =
      product.product_sizes.length > 0
        ? product.product_sizes.find(
            (s) =>
              (s.size || null) === (cartItem.size || null) &&
              (!hasColorVariations || s.color === cartItem.color)
          )
        : undefined;
    if (product.product_sizes.length > 0 && !variation) {
      return NextResponse.json(
        { error: `A variação escolhida de ${product.name} não está mais disponível.` },
        { status: 400 }
      );
    }
    const availableStock = variation ? variation.stock : product.stock;

    if (cartItem.quantity > availableStock) {
      return NextResponse.json(
        { error: `Estoque insuficiente para ${product.name}.` },
        { status: 400 }
      );
    }

    const unitPrice =
      variation?.price != null
        ? Number(variation.price)
        : product.promo_price != null && product.promo_price < product.price
          ? product.promo_price
          : product.price;

    orderItemsToInsert.push({
      product_id: product.id,
      product_name: product.name,
      quantity: cartItem.quantity,
      unit_price: unitPrice,
      size: cartItem.size,
      color: cartItem.color,
    });

    subtotal += unitPrice * cartItem.quantity;
  }

  const isPickup = body.shipping?.method === PICKUP_METHOD;
  const shippingCost = isPickup
    ? 0
    : isAvareCep(body.address.cep)
      ? AVARE_SHIPPING_COST
      : body.shipping.cost;
  const total = subtotal + shippingCost;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      customer_name: body.customer.name,
      customer_email: body.customer.email,
      customer_phone: body.customer.phone,
      shipping_address: body.address,
      shipping_method: isPickup ? PICKUP_METHOD : body.shipping.method,
      shipping_cost: shippingCost,
      subtotal,
      total,
    })
    .select("id, order_number")
    .single();

  if (orderError || !order) {
    return NextResponse.json(
      { error: "Não foi possível criar o pedido." },
      { status: 500 }
    );
  }

  const { error: itemsError } = await supabase.from("order_items").insert(
    orderItemsToInsert.map((item) => ({ ...item, order_id: order.id }))
  );

  if (itemsError) {
    return NextResponse.json(
      { error: "Não foi possível registrar os itens do pedido." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    orderId: order.id,
    orderNumber: order.order_number,
    total,
  });
}
