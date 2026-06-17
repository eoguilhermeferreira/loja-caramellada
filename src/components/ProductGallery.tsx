"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductGallery({
  images,
  productName,
}: {
  images: { id: string; url: string }[];
  productName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState<{
    backgroundImage: string;
    backgroundPosition: string;
  } | null>(null);

  const active = images[activeIndex];

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!active) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({
      backgroundImage: `url(${active.url})`,
      backgroundPosition: `${x}% ${y}%`,
    });
  }

  if (images.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-xl bg-brand-secondary/30 text-brand-text/40">
        Sem imagem
      </div>
    );
  }

  return (
    <div>
      <div
        className="group relative aspect-square w-full overflow-hidden rounded-xl bg-brand-secondary/30"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setZoomStyle(null)}
      >
        <Image
          src={active.url}
          alt={productName}
          fill
          priority
          className="object-cover"
        />
        {zoomStyle && (
          <div
            className="absolute inset-0 hidden bg-no-repeat group-hover:block"
            style={{ ...zoomStyle, backgroundSize: "200%" }}
          />
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((image, i) => (
            <button
              key={image.id}
              onClick={() => setActiveIndex(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                i === activeIndex
                  ? "border-brand-primary"
                  : "border-transparent"
              }`}
            >
              <Image
                src={image.url}
                alt={`${productName} - imagem ${i + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
