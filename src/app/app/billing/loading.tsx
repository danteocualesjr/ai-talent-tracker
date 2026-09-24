import { Skeleton } from "@/components/ui/skeleton";

export default function BillingLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading billing"
      className="container max-w-3xl space-y-8 px-4 py-8 md:px-6 md:py-10"
    >
      <div className="space-y-3 border-b border-border/60 pb-5">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-8 w-32 rounded" />
        <Skeleton className="h-4 w-72 max-w-full rounded" />
      </div>

      <div className="surface-card overflow-hidden rounded-lg">
        <div className="space-y-4 border-b border-border/70 p-6">
          <Skeleton className="h-3 w-24 rounded" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-28 rounded" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-4 w-48 rounded" />
        </div>
        <div className="grid gap-4 p-6 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24 rounded" />
              <Skeleton className="h-7 w-16 rounded" />
            </div>
          ))}
        </div>
        <div className="space-y-2 border-t border-border/60 px-6 pb-6 pt-4">
          <Skeleton className="h-3 w-36 rounded" />
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>

      <Skeleton className="surface-card h-48 w-full rounded-lg" />
    </div>
  );
}
