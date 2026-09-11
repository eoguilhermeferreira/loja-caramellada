import Link from "next/link";
import Image from "next/image";
import type { Tables } from "@/types/database.types";

type Category = Tables<"categories">;

export function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h2 className="text-xl font-semibold text-brand-text">Categorias</h2>
      <div className="mt-4 flex gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-5 md:overflow-visible md:pb-0">
        {categories.map((category) => (
          <Link
            key={category.id}
            href={`/categoria/${category.slug}`}
            className="group w-28 shrink-0 overflow-hidden rounded-xl bg-brand-secondary/40 transition-shadow hover:shadow-md md:w-auto"
          >
            <div className="relative aspect-square w-full overflow-hidden">
              {category.image_url ? (
                <Image
                  src={category.image_url}
                  alt={category.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-secondary to-brand-accent text-2xl font-semibold text-white">
                  {category.name.charAt(0)}
                </div>
              )}
            </div>
            <p className="px-2 py-1.5 text-center text-xs font-medium text-brand-text">
              {category.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
