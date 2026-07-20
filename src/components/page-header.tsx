import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  eyebrow,
  icon,
  children,
  className,
  divider,
}: {
  title: string;
  description?: React.ReactNode;
  /** Small uppercase label above the title (e.g. "Workspace · Settings") */
  eyebrow?: React.ReactNode;
  /** Optional decorative icon shown next to the title */
  icon?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  /** Add a subtle bottom separator under the header */
  divider?: boolean;
}) {
  return (
    <header
      className={cn(
        "group/header animate-fade-up flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        divider && "relative pb-6",
        className,
      )}
    >
      {divider && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
        />
      )}
      {divider && (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-16 rounded-full bg-gradient-to-r from-signal/70 to-signal/0 opacity-80 transition-all duration-300 group-hover/header:w-24"
        />
      )}
      <div className="min-w-0">
        {eyebrow && <div className="label-caps mb-2.5 text-muted-foreground/80">{eyebrow}</div>}
        <div className="flex items-center gap-3">
          {icon && (
            <span aria-hidden="true" className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-gradient-to-br from-card to-muted/40 text-foreground shadow-sm motion-safe:transition-all motion-safe:duration-200 motion-safe:group-hover/header:scale-105 motion-safe:group-hover/header:-rotate-3 group-hover/header:border-signal/25 group-hover/header:shadow-[0_0_16px_-4px_hsl(var(--signal)/0.35)]">
              <span className="pointer-events-none absolute inset-0 rounded-xl bg-signal/5 opacity-0 transition-opacity group-hover/header:opacity-100" />
              {icon}
            </span>
          )}
          <h1 id="page-title" className="text-balance text-[28px] font-bold leading-tight tracking-tight md:text-[32px]">
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/65 bg-clip-text">{title}</span>
          </h1>
        </div>
        {description && (
          <p className="mt-2.5 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground/90 md:text-[15px] md:leading-[1.65]">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2 sm:shrink-0">{children}</div>}
    </header>
  );
}
