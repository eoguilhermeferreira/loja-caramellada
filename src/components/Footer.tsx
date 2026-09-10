import Link from "next/link";
import { STORE_INFO } from "@/config/store";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-brand-secondary/60 bg-brand-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3">
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-spiral.png" alt={STORE_INFO.name} style={{ height: 64, width: "auto" }} />
          <h3 className="mt-2 text-lg font-semibold text-brand-primary">
            {STORE_INFO.name}
          </h3>
          <p className="mt-3 text-sm leading-relaxed text-brand-text/70">
            Moda infantil com qualidade e carinho. Roupas confortáveis e
            estilosas para acompanhar cada fase da infância.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-brand-text/60">
            Contato
          </h4>
          <ul className="mt-3 space-y-2 text-sm text-brand-text/80">
            <li>
              WhatsApp:{" "}
              <a
                href={`https://wa.me/${STORE_INFO.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-primary hover:underline"
              >
                {STORE_INFO.whatsapp}
              </a>
            </li>
            <li>
              Instagram:{" "}
              <a
                href={STORE_INFO.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-brand-primary hover:underline"
              >
                {STORE_INFO.instagram}
              </a>
            </li>
            <li>
              E-mail:{" "}
              <a
                href={`mailto:${STORE_INFO.email}`}
                className="font-medium text-brand-primary hover:underline"
              >
                {STORE_INFO.email}
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

      <div className="border-t border-brand-secondary/40 px-4 py-4 text-center text-xs text-brand-text/60 sm:px-6">
        © {new Date().getFullYear()} {STORE_INFO.name}. Todos os direitos
        reservados. |{" "}
        <a
          href="https://instagram.com/agencynodex"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium hover:text-brand-primary hover:underline"
        >
          Agência NODEX
        </a>
      </div>
    </footer>
  );
}
