import { BannerCarousel } from "@/components/BannerCarousel";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ProductSection } from "@/components/ProductSection";
import {
  getActiveBanners,
  getCategories,
  getFeaturedProducts,
  getPromoProducts,
} from "@/lib/queries";

export default async function Home() {
  const [banners, categories, featuredProducts, promoProducts] =
    await Promise.all([
      getActiveBanners(),
      getCategories(),
      getFeaturedProducts(),
      getPromoProducts(),
    ]);

  return (
    <main className="animate-fade-in">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <BannerCarousel banners={banners} />
      </div>

      <CategoryGrid categories={categories} />

      <ProductSection
        title="Produtos em Destaque"
        products={featuredProducts}
        seeAllHref="/produtos"
        emptyMessage="Novidades chegando em breve. Volte para conferir!"
      />

      <ProductSection
        title="Promoções"
        products={promoProducts}
        seeAllHref="/categoria/promocoes"
        emptyMessage="Nenhuma promoção ativa no momento."
      />
    </main>
  );
}
