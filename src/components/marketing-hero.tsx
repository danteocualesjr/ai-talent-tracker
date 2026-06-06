import { cn } from "@/lib/utils";

export function MarketingHero({
  eyebrow,
  title,
  description,
  children,
  className,
  align = "start",
}: {
  eyebrow?: React.ReactNode;
  title: string;
  description?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  align?: "start" | "center";
}) {
  const centered = align === "center";

  return (
    <section className={cn("relative overflow-hidden border-b border-border/60", className)}>
      <div className="pointer-events-none absolute inset-0 hero-backdrop" />
      <div className="pointer-events-none absolute inset-0 grid-bg grid-fade" />
      <div className="container relative py-14 md:py-20">
        <div
          className={cn(
            "flex flex-wrap gap-6",
            centered ? "flex-col items-center justify-center text-center" : "items-end justify-between",
          )}
        >
          <div className={cn(centered ? "max-w-2xl" : "max-w-2xl")}>
            {eyebrow}
            <h1 className="mt-4 text-balance text-4xl font-bold tracking-tight md:text-5xl">{title}</h1>
            {description && (
              <div className="mt-4 max-w-2xl text-pretty text-muted-foreground md:text-lg">{description}</div>
            )}
          </div>
          {children}
        </div>
      </div>
    </section>
  );
}

export function LiveBadge() {
  return (
    <div className="surface-glass inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-medium text-muted-foreground">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
      </span>
      <span className="font-semibold text-foreground">Live</span>
    </div>
  );
}
