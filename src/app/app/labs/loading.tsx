import { Skeleton } from "@/components/ui/skeleton";

export default function LabsLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading lab rosters"
      className="container max-w-5xl space-y-8 px-4 py-8 md:px-6 md:py-10"
    >
      <div className="space-y-3 border-b border-border/60 pb-5">
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-8 w-40 rounded" />
        <Skeleton className="h-4 w-80 max-w-full rounded" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="surface-card space-y-3 overflow-hidden p-5">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-32 rounded" />
                <Skeleton className="h-3 w-20 rounded" />
              </div>
            </div>
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-3 w-2/3 rounded" />
            <Skeleton className="mt-2 h-8 w-24 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
