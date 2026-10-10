import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileDetailLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading profile"
      className="container max-w-4xl space-y-8 px-4 py-8 md:px-6 md:py-10"
    >
      <Skeleton className="h-4 w-36 rounded" />
      <div className="space-y-3 border-b border-border/60 pb-5">
        <Skeleton className="h-3 w-16 rounded" />
        <Skeleton className="h-8 w-56 rounded" />
        <Skeleton className="h-4 w-80 max-w-full rounded" />
      </div>

      <div className="surface-card flex items-start gap-5 p-6 md:p-8">
        <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
        <div className="min-w-0 flex-1 space-y-3">
          <Skeleton className="h-4 w-64 max-w-full rounded" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
            <Skeleton className="h-8 w-24 rounded-md" />
          </div>
          <Skeleton className="h-3 w-56 rounded" />
        </div>
      </div>

      <div className="stat-strip grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="stat-strip-item space-y-2">
            <Skeleton className="h-7 w-12 rounded" />
            <Skeleton className="h-3 w-24 rounded" />
          </div>
        ))}
      </div>

      <div className="surface-card space-y-5 p-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-48 max-w-full rounded" />
              <Skeleton className="h-3 w-full rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
