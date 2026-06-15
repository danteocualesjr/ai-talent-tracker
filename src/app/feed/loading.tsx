export default function FeedLoading() {
  return (
    <div className="container max-w-3xl space-y-8 px-4 py-12 md:py-16">
      <div className="space-y-3 text-center">
        <div className="mx-auto h-3 w-16 animate-pulse rounded bg-muted" />
        <div className="mx-auto h-9 w-56 animate-pulse rounded-lg bg-muted" />
        <div className="mx-auto h-4 w-80 max-w-full animate-pulse rounded bg-muted/70" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="surface-card h-20 animate-pulse bg-muted/40" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="surface-card h-20 animate-pulse bg-muted/30" />
        ))}
      </div>
    </div>
  );
}
