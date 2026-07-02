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

export async function saveProduct(formData: FormData) {
  const supabase = await requireAdmin();

  const id = formData.get("id") as string | null;
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = (formData.get("category_id") as string) || null;
  const price = Number(formData.get("price"));
  const promoPriceRaw = formData.get("promo_price");
  const promoPrice = promoPriceRaw ? Number(promoPriceRaw) : null;
  const stock = Number(formData.get("stock") ?? 0);
  const weightGrams = Number(formData.get("weight_grams") ?? 300);
  const isActive = formData.get("is_active") === "on";

  const colorsJson = String(formData.get("colors") ?? "[]");
  const colors: { name: string; sizes: { size: string; stock: number }[] }[] = JSON.parse(colorsJson);
  const sizes = colors.flatMap((c) =>
    c.sizes.map((s) => ({ size: s.size, stock: s.stock, color: c.name || null }))
  );

  const imagesJson = String(formData.get("images") ?? "[]");
  const images: string[] = JSON.parse(imagesJson);

  const slug = await uniqueSlug(supabase, slugify(name), id);

  const productData = {
    name,
    slug,
    description,
    category_id: categoryId,
    price,
    promo_price: promoPrice,
    color: colors.length === 1 && colors[0].name ? colors[0].name : colors.length > 1 ? colors.map((c) => c.name).join(", ") : null,
    stock,
    weight_grams: weightGrams,
    is_active: isActive,
    ...(code ? { code } : {}),
  };

  let productId = id;

  if (id) {
    const { error } = await supabase
      .from("products")
      .update(productData)
      .eq("id", id);
    if (error) throw new Error(error.message);

    await supabase.from("product_sizes").delete().eq("product_id", id);
    await supabase.from("product_images").delete().eq("product_id", id);
  } else {
    const { data, error } = await supabase
      .from("products")
      .insert(productData)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    productId = data.id;
  }

  if (sizes.length > 0 && productId) {
    await supabase.from("product_sizes").insert(
      sizes.map((s) => ({ product_id: productId!, size: s.size, stock: s.stock, color: s.color }))
    );
  }

  if (images.length > 0 && productId) {
    await supabase.from("product_images").insert(
      images.map((url, index) => ({
        product_id: productId!,
        url,
        display_order: index,
      }))
    );
  }

  revalidatePath("/admin/produtos");
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
