export default function AppLoading() {
  return (
    <div className="container max-w-5xl space-y-8 px-4 py-8 md:px-6 md:py-10">
      <div className="space-y-3">
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-muted/70" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="surface-card h-28 animate-pulse bg-muted/40" />
        ))}
      </div>
      <div className="surface-card h-64 animate-pulse bg-muted/30" />
      <div className="surface-card h-48 animate-pulse bg-muted/30" />
    </div>
  );
}
