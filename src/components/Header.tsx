import Link from "next/link";
import { STORE_INFO } from "@/config/store";
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
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-brand-primary sm:text-2xl"
        >
          {STORE_INFO.name}
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
