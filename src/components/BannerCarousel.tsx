"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Tables } from "@/types/database.types";

type Banner = Tables<"banners">;

const AUTO_ROTATE_MS = 5000;
const SWIPE_THRESHOLD_PX = 50;

export function BannerCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const dragStartX = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const goTo = useCallback(
    (i: number) => setIndex((i + banners.length) % banners.length),
    [banners.length]
  );

  useEffect(() => {
    if (banners.length <= 1 || dragStartX.current !== null) return;
    const timer = setInterval(() => goTo(index + 1), AUTO_ROTATE_MS);
    return () => clearInterval(timer);
  }, [banners.length, goTo, index]);

  if (banners.length === 0) return null;

  function handlePointerDown(e: React.PointerEvent) {
    dragStartX.current = e.clientX;
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (dragStartX.current === null) return;
    setDragOffset(e.clientX - dragStartX.current);
  }

  function endDrag() {
    if (dragStartX.current === null) return;
    const width = containerRef.current?.offsetWidth || 1;
    const delta = dragOffset;
    if (Math.abs(delta) > SWIPE_THRESHOLD_PX) {
      goTo(index + (delta < 0 ? 1 : -1));
    }
    dragStartX.current = null;
    setDragOffset(0);
    void width;
  }

  const dragPercent = containerRef.current
    ? (dragOffset / containerRef.current.offsetWidth) * 100
    : 0;

  return (
    <div
      ref={containerRef}
      className="relative touch-pan-y select-none overflow-hidden rounded-2xl bg-brand-secondary"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
    >
      <div className="relative aspect-[16/9] w-full sm:aspect-[21/9]">
        <div
          className="flex h-full"
          style={{
            width: `${banners.length * 100}%`,
            transform: `translateX(calc(${-index * 100}% + ${dragPercent}%))`,
            transition: dragStartX.current === null ? "transform 0.4s ease" : "none",
          }}
        >
          {banners.map((banner, i) => (
            <div
              key={banner.id}
              className="relative h-full shrink-0"
              style={{ width: `${100 / banners.length}%` }}
            >
              {banner.image_url ? (
                <Image
                  src={banner.image_url}
                  alt={banner.title}
                  fill
                  priority={i === 0}
                  draggable={false}
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
