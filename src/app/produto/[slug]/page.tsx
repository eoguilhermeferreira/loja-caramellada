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
  if (!product) return { title: "Produto" };

  const description =
    product.description?.slice(0, 160) ||
    `Confira ${product.name} na Caramelada Kids.`;
  const image = product.product_images?.[0]?.url;

  return {
    title: product.name,
    description,
    openGraph: {
      title: product.name,
      description,
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: image ? [image] : undefined,
    },
  };
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
    <main className="mx-auto max-w-6xl animate-fade-in px-4 py-10 sm:px-6">
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
