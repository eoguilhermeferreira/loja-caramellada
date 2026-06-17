"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Tables } from "@/types/database.types";

type Banner = Tables<"banners">;

const AUTO_ROTATE_MS = 5000;

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);

  const goTo = useCallback(
    (i: number) => setIndex((i + banners.length) % banners.length),
    [banners.length]
  );

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => goTo(index + 1), AUTO_ROTATE_MS);
    return () => clearInterval(timer);
  }, [banners.length, goTo, index]);

  if (banners.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-brand-secondary">
      <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
        {banners.map((banner, i) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
            aria-hidden={i !== index}
          >
            {banner.image_url ? (
              <Image
                src={banner.image_url}
                alt={banner.title}
                fill
                priority={i === 0}
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
        ))}
      </div>

      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {banners.map((banner, i) => (
            <button
              key={banner.id}
              aria-label={`Ir para o banner ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-2.5 w-2.5 rounded-full transition-colors ${
                i === index ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
