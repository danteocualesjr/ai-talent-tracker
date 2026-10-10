import { Skeleton } from "@/components/ui/skeleton";

export default function LabRosterLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading lab roster"
      className="container max-w-5xl space-y-8 px-4 py-8 md:px-6 md:py-10"
    >
      <Skeleton className="h-4 w-28 rounded" />

      <div className="surface-card flex flex-col gap-6 p-6 sm:flex-row sm:items-center md:p-8">
        <Skeleton className="h-16 w-16 shrink-0 rounded-2xl" />
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-7 w-48 rounded" />
          <Skeleton className="h-4 w-72 max-w-full rounded" />
        </div>
        <Skeleton className="h-9 w-36 rounded-md" />
      </div>

      <div className="surface-card divide-y divide-border/60 overflow-hidden rounded-lg">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-40 max-w-full rounded" />
              <Skeleton className="h-3 w-56 max-w-full rounded" />
            </div>
            <Skeleton className="h-8 w-20 rounded-md" />
          </div>
        ))}
      </div>
    </div>
  );
}
