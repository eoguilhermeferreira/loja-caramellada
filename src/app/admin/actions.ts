"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendOrderStatusEmail } from "@/lib/email";

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect("/admin/login");
  return supabase;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  base: string,
  excludeId?: string | null
): Promise<string> {
  let candidate = base;
  let counter = 2;
  while (true) {
    const query = supabase
      .from("products")
      .select("id")
      .eq("slug", candidate);
    if (excludeId) query.neq("id", excludeId);
    const { data } = await query.maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${counter++}`;
  }
}

export async function saveProduct(formData: FormData): Promise<{ error: string } | void> {
  const supabase = await requireAdmin();

  const id = formData.get("id") as string | null;
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = (formData.get("category_id") as string) || null;
  const price = Number(formData.get("price"));
  const promoPriceRaw = formData.get("promo_price");
  const promoPrice = promoPriceRaw ? Number(promoPriceRaw) : null;
  const weightGrams = Number(formData.get("weight_grams") ?? 300);
  const isActive = formData.get("is_active") === "on";
  const isBestSeller = formData.get("is_best_seller") === "on";

  const variations: {
    color: string;
    size: string;
    stock: number;
    price: number | null;
    barcodes: string[];
  }[] = JSON.parse(String(formData.get("variations") ?? "[]"));
  const photos: { url: string; color: string }[] = JSON.parse(String(formData.get("photos") ?? "[]"));

  const seen = new Set<string>();
  for (const v of variations) {
    const k = `${v.color.toLowerCase()}|${v.size.toLowerCase()}`;
    if (seen.has(k)) return { error: `Variação repetida: ${[v.color, v.size].filter(Boolean).join(" / ") || "sem cor e sem tamanho"}.` };
    seen.add(k);
  }
  const allBarcodes = variations.flatMap((v) => v.barcodes);
  if (new Set(allBarcodes).size !== allBarcodes.length) return { error: "Há código de barras repetido entre as variações." };
  if (allBarcodes.length > 0) {
    let conflictQuery = supabase.from("product_barcodes").select("barcode, products(name)").in("barcode", allBarcodes);
    if (id) conflictQuery = conflictQuery.neq("product_id", id);
    const { data: conflicts } = await conflictQuery;
    if (conflicts?.length) {
      return { error: `Código de barras ${conflicts[0].barcode} já está no produto "${conflicts[0].products?.name ?? "outro"}".` };
    }
  }

  const stock = variations.length > 0
    ? variations.reduce((sum, v) => sum + v.stock, 0)
    : Number(formData.get("stock") ?? 0);
  const colorNames = [...new Set(variations.map((v) => v.color).filter(Boolean))];

  const slug = await uniqueSlug(supabase, slugify(name), id);

  const productData = {
    name,
    slug,
    description,
    category_id: categoryId,
    price,
    promo_price: promoPrice,
    color: colorNames.length > 0 ? colorNames.join(", ") : null,
    stock,
    weight_grams: weightGrams,
    is_active: isActive,
    is_best_seller: isBestSeller,
    ...(code ? { code } : {}),
  };

  let productId = id;

  if (id) {
    const { error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", id);
    if (error) return { error: error.code === "23505" ? "Esse código do produto já está em uso." : error.message };

    await supabase.from("product_barcodes").delete().eq("product_id", id);
    await supabase.from("product_sizes").delete().eq("product_id", id);
    await supabase.from("product_images").delete().eq("product_id", id);
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert(productData)
      .select("id")
      .single();
    if (error) return { error: error.code === "23505" ? "Esse código do produto já está em uso." : error.message };
    productId = data.id;
  }

  if (variations.length > 0 && productId) {
    const { data: inserted, error: sizesError } = await supabase
      .from("product_sizes")
      .insert(
        variations.map((v) => ({
          product_id: productId!,
          size: v.size,
          color: v.color || null,
          stock: v.stock,
          price: v.price,
        }))
      )
      .select("id, size, color");
    if (sizesError) return { error: sizesError.message };

    const barcodeRows = variations.flatMap((v) => {
      const row = inserted!.find((r) => r.size === v.size && (r.color ?? "") === v.color);
      return v.barcodes.map((barcode) => ({ product_id: productId!, size_id: row?.id ?? null, barcode }));
    });
    if (barcodeRows.length > 0) {
      const { error: bcError } = await supabase.from("product_barcodes").insert(barcodeRows);
      if (bcError) {
        return { error: bcError.code === "23505" ? "Um dos códigos de barras já está cadastrado em outro produto." : bcError.message };
      }
    }
  }

  if (photos.length > 0 && productId) {
    await supabase.from("product_images").insert(
      photos.map((p, index) => ({
        product_id: productId!,
        url: p.url,
        color: p.color || null,
        display_order: index,
      }))
    );
  }

  revalidatePath("/admin/produtos");
  revalidatePath("/admin/produtos/[id]", "page");
  redirect("/admin/produtos");
}

export async function deleteProduct(id: string) {
  const supabase = await requireAdmin();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/admin/produtos");
}

export async function saveBanner(formData: FormData) {
  const supabase = await requireAdmin();

  const id = formData.get("id") as string | null;
  const bannerData = {
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    button_label: String(formData.get("button_label") ?? "").trim(),
    button_link: String(formData.get("button_link") ?? "").trim(),
    display_order: Number(formData.get("display_order") ?? 0),
    is_active: formData.get("is_active") === "on",
    image_url: (formData.get("image_url") as string) || null,
  };

  if (id) {
    const { error } = await supabase.from("banners").update(bannerData).eq("id", id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("banners").insert(bannerData);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/admin/banners");
  redirect("/admin/banners");
}

export async function deleteBanner(id: string) {
  const supabase = await requireAdmin();
  await supabase.from("banners").delete().eq("id", id);
  revalidatePath("/admin/banners");
}

export async function updateOrderStatus(
  orderId: string,
  deliveryStatus: "preparando" | "enviado" | "entregue" | "cancelado"
) {
  const supabase = await requireAdmin();
  const { data: order } = await supabase
    .from("orders")
    .update({ delivery_status: deliveryStatus })
    .eq("id", orderId)
    .select("order_number, customer_name, customer_email, tracking_url")
    .single();

  if (order) {
    await sendOrderStatusEmail({
      customerEmail: order.customer_email,
      customerName: order.customer_name,
      orderNumber: order.order_number,
      status: deliveryStatus,
      trackingUrl: order.tracking_url,
    });
  }
  revalidatePath("/admin");
  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
}

export async function acceptOrder(orderId: string) {
  await updateOrderStatus(orderId, "preparando");
}

export async function updateTrackingUrl(orderId: string, trackingUrl: string) {
  const supabase = await requireAdmin();
  await supabase
    .from("orders")
    .update({ tracking_url: trackingUrl || null })
    .eq("id", orderId);
  revalidatePath(`/admin/pedidos/${orderId}`);
}

export async function uploadCategoryImage(formData: FormData) {
  const file = formData.get("file") as File;
  await requireAdmin();
  const supabase = await createClient();

  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("category-images")
    .upload(path, file);
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("category-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function updateCategoryImage(categoryId: string, imageUrl: string) {
  const supabase = await requireAdmin();
  await supabase
    .from("categories")
    .update({ image_url: imageUrl })
    .eq("id", categoryId);
  revalidatePath("/admin/categorias");
  revalidatePath("/");
}

export async function uploadProductImage(formData: FormData) {
  const file = formData.get("file") as File;
  await requireAdmin();
  const supabase = await createClient();

  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file);
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadBannerImage(formData: FormData) {
  const file = formData.get("file") as File;
  await requireAdmin();
  const supabase = await createClient();

  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from("banner-images")
    .upload(path, file);
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("banner-images").getPublicUrl(path);
  return data.publicUrl;
}
