import { createClient } from "@/lib/supabase/server";

export async function getActiveBanners() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("banners")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true });
  return data ?? [];
}

export async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .order("display_order", { ascending: true });
  return data ?? [];
}

export async function getFeaturedProducts(limit = 8) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getBestSellerProducts(limit = 8) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("is_active", true)
    .eq("is_best_seller", true)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getPromoProducts(limit = 8) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("is_active", true)
    .not("promo_price", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data ?? [];
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export async function getProducts({
  categorySlug,
}: { categorySlug?: string } = {}) {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, product_images(*), categories(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });

  if (categorySlug) {
    const category = await getCategoryBySlug(categorySlug);
    if (!category) return [];
    query = query.eq("category_id", category.id);
  }

  const { data } = await query;
  return data ?? [];
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, product_images(*), product_sizes(*), categories(*)")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return data;
}

export async function getRelatedProducts(
  categoryId: string | null,
  excludeProductId: string,
  limit = 8
) {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, product_images(*)")
    .eq("is_active", true)
    .neq("id", excludeProductId);

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data } = await query;
  if (!data || data.length === 0) {
    // fallback: any active products
    const { data: fallback } = await supabase
      .from("products")
      .select("*, product_images(*)")
      .eq("is_active", true)
      .neq("id", excludeProductId);
    return shuffle(fallback ?? []).slice(0, limit);
  }

  return shuffle(data).slice(0, limit);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
