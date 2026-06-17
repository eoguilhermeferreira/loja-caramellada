export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 md:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-xl bg-brand-secondary/30" />
        <div className="flex flex-col gap-3">
          <div className="h-6 w-3/4 animate-pulse rounded bg-brand-secondary/30" />
          <div className="h-5 w-1/3 animate-pulse rounded bg-brand-secondary/30" />
          <div className="h-24 w-full animate-pulse rounded bg-brand-secondary/30" />
        </div>
      </div>
    </main>
  );
}
