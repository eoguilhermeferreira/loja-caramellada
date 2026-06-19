// TODO: dados de teste — remover quando o catálogo real tiver itens suficientes.
const FAKE_ITEMS = [
  { name: "Conjunto Infantil Floral", price: 89.9, badge: "Roupa" },
  { name: "Tiara de Laço Pink", price: 24.9, badge: "Acessório" },
  { name: "Macacão Bebê Algodão", price: 69.9, badge: "Roupa" },
  { name: "Mochila Estampada Infantil", price: 99.9, badge: "Acessório" },
  { name: "Vestido Festa Meninas", price: 119.9, badge: "Roupa" },
  { name: "Kit Meias Coloridas", price: 19.9, badge: "Acessório" },
];

export function FakeRelatedProducts() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-brand-text">
          Combine com estas peças e acessórios
        </h2>
        <span className="text-xs font-medium text-brand-text/40">
          (dados de teste)
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {FAKE_ITEMS.map((item) => (
          <div
            key={item.name}
            className="flex flex-col overflow-hidden rounded-xl bg-brand-white shadow-sm"
          >
            <div className="relative flex aspect-square w-full items-center justify-center bg-gradient-to-br from-brand-secondary to-brand-accent">
              <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2.5 py-1 text-xs font-semibold text-brand-primary">
                {item.badge}
              </span>
            </div>

            <div className="flex flex-1 flex-col gap-1 p-3">
              <h3 className="text-sm font-medium text-brand-text line-clamp-2">
                {item.name}
              </h3>
              <span className="mt-auto text-base font-semibold text-brand-text">
                {item.price.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
