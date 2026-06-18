import Link from "next/link";
import Image from "next/image";
import { CartLink } from "@/components/CartLink";

const NAV_LINKS = [
  { label: "Bebês", href: "/categoria/bebes" },
  { label: "Meninas", href: "/categoria/meninas" },
  { label: "Meninos", href: "/categoria/meninos" },
  { label: "Novidades", href: "/categoria/novidades" },
  { label: "Promoções", href: "/categoria/promocoes" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-secondary/60 bg-brand-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="relative h-10 w-10 shrink-0 sm:h-12 sm:w-12">
            <Image
              src="/logo-spiral.png"
              alt="Caramellada Kids"
              fill
              className="object-contain"
            />
          </span>
          <span className="text-xl font-semibold tracking-tight sm:text-2xl">
            <span className="text-brand-primary">Caramellada</span>{" "}
            <span className="text-[#4FB3CC]">K</span>
            <span className="text-[#9CCB3B]">I</span>
            <span className="text-[#F0883E]">D</span>
            <span className="text-[#AFDCC6]">S</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-brand-text md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-brand-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <CartLink />
        </div>
      </div>

      <nav className="flex items-center gap-5 overflow-x-auto px-4 pb-3 text-sm font-medium text-brand-text md:hidden">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="whitespace-nowrap transition-colors hover:text-brand-primary"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
