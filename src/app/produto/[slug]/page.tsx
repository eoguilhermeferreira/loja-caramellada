import { notFound } from "next/navigation";
import { ProductGallery } from "@/components/ProductGallery";
import { ProductDetails } from "@/components/ProductDetails";
import { ProductSection } from "@/components/ProductSection";
import { getProductBySlug, getRelatedProducts } from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return { title: `${product?.name ?? "Produto"} | Caramelada Kids` };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const sortedImages = [...product.product_images].sort(
    (a, b) => a.display_order - b.display_order
  );
  const relatedProducts = await getRelatedProducts(
    product.category_id,
    product.id
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2">
        <ProductGallery images={sortedImages} productName={product.name} />
        <ProductDetails product={product} />
      </div>

      {relatedProducts.length > 0 && (
        <ProductSection
          title="Produtos Relacionados"
          products={relatedProducts}
          seeAllHref={
            product.categories ? `/categoria/${product.categories.slug}` : "/produtos"
          }
          emptyMessage=""
        />
      )}
    </main>
  );
}
