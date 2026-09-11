import Link from "next/link";
import { STORE_INFO } from "@/config/store";

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function IconInstagram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

function IconEmail({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m2 7 10 7 10-7" />
    </svg>
  );
}

function IconLocation({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-brand-secondary/60 bg-brand-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-spiral.png" alt={STORE_INFO.name} style={{ height: 64, width: "auto" }} />
          <h3 className="mt-2 text-lg font-semibold">
            <span className="text-brand-primary">Caramellada </span>
            <span style={{ color: "#4FB3CC" }}>K</span>
            <span style={{ color: "#9CCB3B" }}>I</span>
            <span style={{ color: "#F0883E" }}>D</span>
            <span style={{ color: "#AFDCC6" }}>S</span>
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-brand-text/70">
            Moda infantil com qualidade e carinho. Roupas confortáveis e
            estilosas para acompanhar cada fase da infância.
          </p>

          <div className="mt-4 flex gap-3">
            <a
              href={`https://wa.me/${STORE_INFO.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-secondary/30 text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
            >
              <IconWhatsApp className="h-4 w-4" />
            </a>
            <a
              href={STORE_INFO.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-secondary/30 text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
            >
              <IconInstagram className="h-4 w-4" />
            </a>
            <a
              href={`mailto:${STORE_INFO.email}`}
              aria-label="E-mail"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-secondary/30 text-brand-primary transition-colors hover:bg-brand-primary hover:text-white"
            >
              <IconEmail className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-brand-text/60">
            Contato
          </h4>
          <ul className="mt-3 space-y-3 text-sm text-brand-text/80">
            <li>
              <a
                href={`https://wa.me/${STORE_INFO.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-medium text-brand-primary hover:underline"
              >
                <IconWhatsApp className="h-4 w-4 shrink-0" />
                {STORE_INFO.whatsapp}
              </a>
            </li>
            <li>
              <a
                href={STORE_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-medium text-brand-primary hover:underline"
              >
                <IconInstagram className="h-4 w-4 shrink-0" />
                {STORE_INFO.instagram}
              </a>
            </li>
            <li>
              <a
                href={`mailto:${STORE_INFO.email}`}
                className="flex items-center gap-2 font-medium text-brand-primary hover:underline"
              >
                <IconEmail className="h-4 w-4 shrink-0" />
                {STORE_INFO.email}
              </a>
            </li>
            <li>
              <a
                href={STORE_INFO.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-2 font-medium text-brand-primary hover:underline"
              >
                <IconLocation className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{STORE_INFO.address}</span>
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-brand-text/60">
            Institucional
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-brand-text/80">
            <li>
              <Link href="/politica-de-privacidade" className="hover:text-brand-primary hover:underline">
                Política de Privacidade
              </Link>
            </li>
            <li>
              <Link href="/termos-de-uso" className="hover:text-brand-primary hover:underline">
                Termos de Uso
              </Link>
            </li>
            <li>
              <Link href="/trocas-e-devolucoes" className="hover:text-brand-primary hover:underline">
                Trocas e Devoluções
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-brand-secondary/40 px-4 py-6 sm:px-6">
        <p className="text-center text-xs font-semibold uppercase tracking-wide text-brand-text/60">
          Formas de pagamento
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {[
            { src: "/payment-icons/pix.svg", alt: "Pix" },
            { src: "/payment-icons/visa.svg", alt: "Visa" },
            { src: "/payment-icons/mastercard.svg", alt: "Mastercard" },
            { src: "/payment-icons/elo.svg", alt: "Elo" },
            { src: "/payment-icons/hipercard.svg", alt: "Hipercard" },
            { src: "/payment-icons/amex.svg", alt: "American Express" },
            { src: "/payment-icons/boleto.svg", alt: "Boleto" },
          ].map((icon) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={icon.alt}
              src={icon.src}
              alt={icon.alt}
              height={32}
              style={{ height: 32, width: "auto", borderRadius: 4 }}
            />
          ))}
        </div>
      </div>

      <div className="border-t border-brand-secondary/40 px-4 py-5 text-center text-xs text-brand-text/60 sm:px-6">
        <p>© {new Date().getFullYear()} {STORE_INFO.name}.</p>
        <p className="mt-1">É vedada qualquer reprodução total ou parcial, nos termos da Lei nº 9.610/98. Todos os direitos reservados.</p>
        <p className="mt-1">{STORE_INFO.address}</p>
        <p className="mt-1">CNPJ: 38.219.114/0001-08</p>
      </div>

      <div className="border-t border-brand-secondary/40 px-4 py-5 text-center sm:px-6">
        <p className="mb-3 text-xs text-brand-text/40">Desenvolvido por</p>
        <a
          href="https://instagram.com/agencynodex"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Agência NODEX"
          className="inline-block opacity-70 transition-opacity hover:opacity-100"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/nodex-logo.png" alt="Agência NODEX" style={{ height: 64, width: "auto" }} />
        </a>
      </div>
    </footer>
  );
}
