import Image from "next/image";
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

  const topBanners = banners.slice(0, 2);
  const lowerBanners = banners.slice(2, 4);

  return (
    <main className="animate-fade-in">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <BannerCarousel banners={topBanners} />
      </div>

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl sm:aspect-[21/9]">
          <Image
            src="/banners/novidades-toda-semana.jpeg"
            alt="Caramellada Kids"
            fill
            className="object-cover"
          />
        </div>
      </div>

      <CategoryGrid categories={categories} />

      <ProductSection
        title="Produtos em Destaque"
        products={featuredProducts}
        seeAllHref="/produtos"
        emptyMessage="Novidades chegando em breve. Volte para conferir!"
      />

      {lowerBanners.length > 0 && (
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <BannerCarousel banners={lowerBanners} />
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
