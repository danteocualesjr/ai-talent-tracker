function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-muted/50 ${className ?? ""}`}>
      <div className="absolute inset-0 animate-shimmer" aria-hidden />
    </div>
  );
}

export default function WatchlistLoading() {
  return (
    <div className="container max-w-5xl space-y-8 px-4 py-8 md:px-6 md:py-10">
      <div className="space-y-3 border-b border-border/60 pb-5">
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-64 rounded" />
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="surface-card h-20 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="surface-card h-24 rounded-2xl" />
      <div className="surface-card divide-y divide-border/60 rounded-2xl">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-3 w-56 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
