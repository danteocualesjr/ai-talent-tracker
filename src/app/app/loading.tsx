function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-muted/50 ${className ?? ""}`}>
      <div className="absolute inset-0 animate-shimmer" aria-hidden />
    </div>
  );
}

export default function AppLoading() {
  return (
    <div className="container max-w-5xl space-y-8 px-4 py-8 md:px-6 md:py-10">
      <div className="animate-fade-up space-y-3">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-72 max-w-full rounded" />
      </div>
      <div className="animate-fade-up animate-fade-up-delay-1 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="surface-card h-28 rounded-2xl" />
        ))}
      </div>
      <Skeleton className="animate-fade-up animate-fade-up-delay-2 surface-card h-64 rounded-2xl" />
      <Skeleton className="animate-fade-up animate-fade-up-delay-3 surface-card h-48 rounded-2xl" />
    </div>
  );
}
