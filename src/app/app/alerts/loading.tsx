import { Skeleton } from "@/components/ui/skeleton";

export default function AlertsLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading alerts"
      className="container max-w-4xl space-y-8 px-4 py-8 md:px-6 md:py-10"
    >
      <div className="space-y-3 border-b border-border/60 pb-5">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-8 w-28 rounded" />
        <Skeleton className="h-4 w-64 max-w-full rounded" />
      </div>

      <div className="stat-strip grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="stat-strip-item space-y-2">
            <Skeleton className="h-7 w-10 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
        ))}
      </div>

      <Skeleton className="surface-card h-44 w-full rounded-lg" />
      <Skeleton className="surface-card h-36 w-full rounded-lg" />
      <Skeleton className="surface-card h-40 w-full rounded-lg" />

      <div className="grid gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="surface-card h-40 w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
