const BENEFITS = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7 shrink-0" aria-hidden="true">
        <path d="M1 3h15v13H1z" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    title: "Frete para todo o Brasil",
    subtitle: "Ou retire grátis em Avaré-SP",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7 shrink-0" aria-hidden="true">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <path d="M2 10h20" />
        <path d="M6 15h4" />
      </svg>
    ),
    title: "Parcelamos no cartão",
    subtitle: "Cartão, Pix ou boleto via Mercado Pago",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-7 w-7 shrink-0" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
    title: "Compra protegida",
    subtitle: "Pagamento processado pelo Mercado Pago",
  },
];

export function BenefitsBar() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <div className="rounded-2xl bg-brand-secondary/20 px-6 py-5">
        <div className="grid gap-4 sm:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-primary/10 text-brand-primary">
                {b.icon}
              </div>
              <div>
                <p className="text-sm font-semibold text-brand-text">{b.title}</p>
                <p className="text-xs text-brand-text/60">{b.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
