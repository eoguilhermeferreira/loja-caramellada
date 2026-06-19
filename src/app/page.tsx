import { BannerCarousel } from "@/components/BannerCarousel";
import { SingleBanner } from "@/components/SingleBanner";
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

  const topBanners = banners.slice(0, 2);
  const middleBanner = banners[2];
  const lowerBanner = banners[3];

  return (
    <main className="animate-fade-in">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <BannerCarousel banners={topBanners} />
      </div>

      <ProductSection
        title="Produtos em Destaque"
        products={featuredProducts}
        seeAllHref="/produtos"
        emptyMessage="Novidades chegando em breve. Volte para conferir!"
      />

      {middleBanner && (
        <div className="py-6">
          <SingleBanner banner={middleBanner} />
        </div>
      )}

      <CategoryGrid categories={categories} />

      {lowerBanner && (
        <div className="py-6">
          <SingleBanner banner={lowerBanner} />
        </div>
      )}

      <ProductSection
        title="Promoções"
        products={promoProducts}
        seeAllHref="/categoria/promocoes"
        emptyMessage="Nenhuma promoção ativa no momento."
      />
    </main>
  );
}
