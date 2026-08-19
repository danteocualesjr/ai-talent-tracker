function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-lg bg-muted/50 ${className ?? ""}`}>
      <div className="absolute inset-0 animate-shimmer" aria-hidden />
    </div>
  );
}

function StatSkeleton() {
  return (
    <div className="surface-card relative overflow-hidden p-5">
      <div className="flex items-start justify-between">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
      <Skeleton className="mt-3 h-8 w-16 rounded" />
      <div className="mt-2 flex items-end justify-between">
        <Skeleton className="h-3 w-24 rounded" />
        <Skeleton className="h-[22px] w-16 rounded" />
      </div>
    </div>
  );
}

export default function AppLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading page"
      className="container max-w-6xl space-y-8 px-4 py-8 md:px-6 md:py-10 lg:space-y-10"
    >
      <div className="animate-fade-up space-y-3 border-b border-border/60 pb-6">
        <Skeleton className="h-9 w-52 rounded" />
        <Skeleton className="h-4 w-96 max-w-full rounded" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>
      <div className="animate-fade-up animate-fade-up-delay-1 flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-28 rounded-full" />
        ))}
      </div>
      <div className="animate-fade-up animate-fade-up-delay-1 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatSkeleton key={i} />
        ))}
      </div>
      <div className="animate-fade-up animate-fade-up-delay-2 grid gap-3 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="surface-card h-28 rounded-lg" />
        ))}
      </div>
      <Skeleton className="animate-fade-up animate-fade-up-delay-2 surface-card h-20 rounded-lg" />
      <Skeleton className="animate-fade-up animate-fade-up-delay-2 surface-card h-48 rounded-lg" />
      <Skeleton className="animate-fade-up animate-fade-up-delay-3 surface-card h-64 rounded-lg" />
    </div>
  );
}
