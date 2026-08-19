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
        "surface-card group/panel overflow-hidden transition-colors duration-200 hover:border-border focus-within:border-signal/25",
        tone === "muted" && "bg-muted/35",
        className,
      )}
    >
      {hasHeader && (
        <div className="relative flex items-center justify-between gap-4 border-b border-border/60 px-5 py-4 sm:px-6">
          <span aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal/40 to-transparent opacity-60 transition-opacity group-hover/panel:opacity-100 group-focus-within/panel:opacity-100" />
          <div className="min-w-0">
            {title && (
              <div className="font-serif text-base font-medium leading-tight tracking-tight text-foreground/90 transition-colors group-hover/panel:text-foreground">
                <span aria-hidden className="mr-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-signal/60 opacity-0 transition-opacity group-hover/panel:opacity-100 motion-safe:group-focus-within/panel:opacity-100" />
                {title}
              </div>
            )}
            {description && (
              <div className="mt-1 text-xs leading-relaxed text-muted-foreground/90">
                {description}
              </div>
            )}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={cn(!bodyClassName && "px-5 py-5 sm:px-6", bodyClassName)}>{children}</div>
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
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-[calc(50%-2rem)] h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-br from-signal/12 via-signal/5 to-transparent blur-2xl opacity-60 motion-safe:group-hover:opacity-90 motion-safe:transition-opacity"
      />
      <div className="animate-fade-up relative flex h-12 w-12 items-center justify-center rounded-xl border border-border/70 bg-background text-muted-foreground shadow-sm">
        {icon}
      </div>
      <div className="animate-fade-up animate-fade-up-delay-1 relative text-sm font-bold tracking-tight text-foreground/90">{title}</div>
      <p className="animate-fade-up animate-fade-up-delay-2 relative max-w-sm text-pretty text-sm leading-relaxed text-muted-foreground">
        {body}
      </p>
      {cta && <div className="animate-fade-up animate-fade-up-delay-3 relative mt-1">{cta}</div>}
    </div>
  );
}
