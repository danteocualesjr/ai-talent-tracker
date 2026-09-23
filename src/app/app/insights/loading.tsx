import { Skeleton } from "@/components/ui/skeleton";

export default function InsightsLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading insights"
      className="container max-w-5xl space-y-8 px-4 py-8 md:px-6 md:py-10"
    >
      <div className="flex flex-col gap-3 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-8 w-40 rounded" />
          <Skeleton className="h-4 w-80 max-w-full rounded" />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="surface-card relative overflow-hidden p-5">
            <div className="flex items-start justify-between">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
            <Skeleton className="mt-3 h-8 w-14 rounded" />
            <Skeleton className="mt-2 h-3 w-28 rounded" />
          </div>
        ))}
      </div>

      <Skeleton className="surface-card h-48 w-full rounded-lg" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="surface-card h-64 w-full rounded-lg" />
        <Skeleton className="surface-card h-64 w-full rounded-lg" />
      </div>
    </div>
  );
}
