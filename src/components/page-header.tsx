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
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        divider && "pb-5 border-b border-border/60",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && <div className="label-caps mb-2">{eyebrow}</div>}
        <div className="flex items-center gap-3">
          {icon && (
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-card text-foreground shadow-sm">
              {icon}
            </span>
          )}
          <h1 id="page-title" className="text-balance text-[28px] font-bold leading-tight tracking-tight md:text-[32px]">
            {title}
          </h1>
        </div>
        {description && (
          <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-[15px]">
            {description}
          </p>
        )}
      </div>
      {children && <div className="flex flex-wrap items-center gap-2 sm:shrink-0">{children}</div>}
    </header>
  );
}
