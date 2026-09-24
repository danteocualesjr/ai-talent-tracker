import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading settings"
      className="container max-w-3xl space-y-8 px-4 py-8 md:px-6 md:py-10"
    >
      <div className="space-y-3 border-b border-border/60 pb-5">
        <Skeleton className="h-3 w-20 rounded" />
        <Skeleton className="h-8 w-36 rounded" />
        <Skeleton className="h-4 w-64 max-w-full rounded" />
      </div>

      <Skeleton className="surface-card h-28 w-full rounded-lg" />

      <div className="surface-card grid gap-3 p-5 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-md border border-border/70 p-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
            <Skeleton className="h-3 w-16 rounded" />
            <Skeleton className="h-4 w-24 rounded" />
          </div>
        ))}
      </div>

      <Skeleton className="surface-card h-40 w-full rounded-lg" />
      <Skeleton className="surface-card h-32 w-full rounded-lg" />
    </div>
  );
}
