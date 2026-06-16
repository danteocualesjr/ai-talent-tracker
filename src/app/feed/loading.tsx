function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-muted/50 ${className ?? ""}`}>
      <div className="absolute inset-0 animate-shimmer" aria-hidden />
    </div>
  );
}

export default function FeedLoading() {
  return (
    <div className="container max-w-3xl space-y-8 px-4 py-12 md:py-16">
      <div className="space-y-3 text-center">
        <Skeleton className="mx-auto h-3 w-16 rounded" />
        <Skeleton className="mx-auto h-9 w-56" />
        <Skeleton className="mx-auto h-4 w-80 max-w-full rounded" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="surface-card h-20 rounded-2xl" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="surface-card h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}
