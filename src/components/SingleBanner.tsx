import Link from "next/link";
import Image from "next/image";
import type { Tables } from "@/types/database.types";

type Banner = Tables<"banners">;

export function SingleBanner({ banner }: { banner: Banner }) {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-brand-secondary sm:aspect-[21/9]">
        {banner.image_url ? (
          <Image
            src={banner.image_url}
            alt={banner.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-brand-secondary to-brand-accent" />
        )}
        <div className="absolute inset-0 bg-black/25" />

        <div className="absolute inset-0 flex flex-col items-start justify-center gap-4 px-6 sm:px-12">
          <h2 className="max-w-md text-2xl font-semibold text-white drop-shadow sm:text-4xl">
            {banner.title}
          </h2>
          <p className="max-w-sm text-sm text-white/90 drop-shadow sm:text-base">
            {banner.description}
          </p>
          {banner.button_label && (
            <Link
              href={banner.button_link || "/produtos"}
              className="rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-brand-accent"
            >
              {banner.button_label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
