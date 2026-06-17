export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="h-8 w-48 animate-pulse rounded-lg bg-brand-secondary/30" />
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col gap-2">
            <div className="aspect-square animate-pulse rounded-xl bg-brand-secondary/30" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-brand-secondary/30" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-brand-secondary/30" />
          </div>
        ))}
      </div>
    </main>
  );
}
