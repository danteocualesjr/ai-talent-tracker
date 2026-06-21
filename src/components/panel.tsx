import { cn } from "@/lib/utils";

export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
  tone = "default",
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  /** "default" uses the standard card surface, "muted" applies a subtle tinted background */
  tone?: "default" | "muted";
}) {
  const hasHeader = title || description || action;

  return (
    <div
      className={cn(
        "surface-card overflow-hidden transition-shadow duration-200 hover:shadow-sm",
        tone === "muted" && "bg-muted/35",
        className,
      )}
    >
      {hasHeader && (
        <div className="relative flex items-center justify-between gap-4 border-b border-border/60 px-5 py-4 sm:px-6">
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal/30 to-transparent" />
          <div className="min-w-0">
            {title && <div className="text-sm font-bold leading-tight tracking-tight transition-colors">{title}</div>}
            {description && (
              <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                {description}
              </div>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}

export function EmptyPanel({
  icon,
  title,
  body,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta?: React.ReactNode;
}) {
  return (
    <div role="status" className="group relative flex flex-col items-center gap-3 px-6 py-16 text-center sm:py-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-30 ring-dots [mask-image:radial-gradient(ellipse_60%_50%_at_center,black,transparent)]"
      />
      <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-background text-muted-foreground shadow-sm ring-4 ring-signal/5 motion-safe:transition-transform motion-safe:group-hover:scale-105">
        {icon}
      </div>
      <div className="relative text-sm font-bold tracking-tight">{title}</div>
      <p className="relative max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
      {cta && <div className="relative mt-1">{cta}</div>}
    </div>
  );
}
