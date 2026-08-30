import { cn } from "@/lib/utils";

function accentTitle(title: string) {
  const parts = title.trim().split(/\s+/);
  if (parts.length === 1) {
    return <span className="font-serif italic font-normal text-gradient-hero">{title}</span>;
  }
  const last = parts.pop()!;
  return (
    <>
      {parts.join(" ")}{" "}
      <span className="font-serif italic font-normal text-gradient-hero">{last}</span>
    </>
  );
}

export function PageHeader({
  title,
  description,
  eyebrow,
  icon,
  children,
  className,
  divider,
}: {
  title: React.ReactNode;
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
  const renderedTitle = typeof title === "string" ? accentTitle(title) : title;

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
          className="pointer-events-none absolute bottom-0 left-0 h-0.5 w-16 rounded-full bg-gradient-to-r from-signal/70 to-signal/0 opacity-80 transition-all duration-300 group-hover/header:w-28"
        />
      )}
      <div className="min-w-0">
        {eyebrow && <div className="label-caps mb-2.5 text-muted-foreground/80">{eyebrow}</div>}
        <div className="flex items-center gap-3">
          {icon && (
            <span aria-hidden="true" className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border/70 bg-card text-foreground shadow-sm">
              <span className="pointer-events-none absolute inset-0 rounded-md bg-signal/5 opacity-0 transition-opacity group-hover/header:opacity-100" />
              {icon}
            </span>
          )}
          <h1 id="page-title" className="text-balance font-serif text-[30px] font-medium leading-tight tracking-tight md:text-[34px]">
            {renderedTitle}
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
