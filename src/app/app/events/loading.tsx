import { Skeleton } from "@/components/ui/skeleton";

export default function EventsLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading events"
      className="container max-w-4xl space-y-8 px-4 py-8 md:px-6 md:py-10"
    >
      <div className="space-y-3 border-b border-border/60 pb-5">
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-8 w-36 rounded" />
        <Skeleton className="h-4 w-72 max-w-full rounded" />
      </div>
      <Skeleton className="surface-card h-14 w-full rounded-lg" />
      <div className="stat-strip grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="stat-strip-item space-y-2">
            <Skeleton className="h-7 w-12 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
          </div>
        ))}
      </div>
      <Skeleton className="surface-card h-28 w-full rounded-lg" />
      <div className="surface-card divide-y divide-border/60 overflow-hidden rounded-lg">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 px-5 py-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-48 max-w-full rounded" />
              <Skeleton className="h-3 w-full rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
