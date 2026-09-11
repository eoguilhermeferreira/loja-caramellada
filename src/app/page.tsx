import Image from "next/image";
import { BannerCarousel } from "@/components/BannerCarousel";
import { CategoryGrid } from "@/components/CategoryGrid";
import { ProductSection } from "@/components/ProductSection";
import {
  getActiveBanners,
  getCategories,
  getFeaturedProducts,
  getBestSellerProducts,
} from "@/lib/queries";

export default async function Home() {
  const [banners, categories, featuredProducts, bestSellers] =
    await Promise.all([
      getActiveBanners(),
      getCategories(),
      getFeaturedProducts(8),
      getBestSellerProducts(8),
    ]);

  const topBanners = banners.slice(0, 2);
  const lowerBanners = banners.slice(2, 4);

  return (
    <main className="animate-fade-in">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <BannerCarousel banners={topBanners} />
      </div>

      <CategoryGrid categories={categories} />

      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="relative aspect-[3/2] w-full max-w-xl overflow-hidden rounded-2xl sm:mx-auto sm:max-w-2xl">
          <Image
            src="/banners/novidades-toda-semana.png"
            alt="Caramellada Kids"
            fill
            className="object-contain"
          />
        </div>
      </div>

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

      {bestSellers.length > 0 && (
        <ProductSection
          title="Mais Vendidos"
          products={bestSellers}
          seeAllHref="/produtos"
          emptyMessage="Em breve nossos mais vendidos aqui!"
        />
      )}
    </main>
  );
}
