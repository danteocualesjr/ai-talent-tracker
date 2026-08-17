import { cn } from "@/lib/utils";

function accentHeadline(title: string) {
  const trimmed = title.trim();
  const match = trimmed.match(/^(.*?)(\s+)(\S+)([.!?]?)$/);
  if (!match || !match[1]) {
    return <span className="font-serif italic font-normal">{trimmed}</span>;
  }
  const [, lead, space, last, punct] = match;
  return (
    <>
      {lead}
      {space}
      <span className="font-serif italic font-normal">{last}</span>
      {punct}
    </>
  );
}

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
    <section className={cn("relative overflow-hidden border-b border-border/70", className)}>
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-signal" />
      <div className="pointer-events-none absolute inset-0 noise opacity-30" />
      <div className="pointer-events-none absolute inset-0 hero-backdrop" />
      <div className="pointer-events-none absolute inset-0 grid-bg grid-fade opacity-40" />
      <div className="container relative py-12 md:py-20">
        <div
          className={cn(
            "flex flex-wrap gap-6",
            centered ? "flex-col items-center justify-center text-center" : "items-end justify-between",
          )}
        >
          <div className={cn(centered ? "max-w-2xl" : "max-w-2xl")}>
            {eyebrow && <div className="animate-fade-up">{eyebrow}</div>}
            <h1 className="animate-fade-up animate-fade-up-delay-1 mt-4 text-balance font-serif text-4xl font-medium tracking-tight text-gradient-hero md:text-5xl">
              {accentHeadline(title)}
            </h1>
            {description && (
              <div className="animate-fade-up animate-fade-up-delay-2 mt-4 max-w-2xl text-pretty text-muted-foreground md:text-lg">{description}</div>
            )}
          </div>
          {children && <div className="animate-fade-up animate-fade-up-delay-3">{children}</div>}
        </div>
      </div>
    </section>
  );
}

export function LiveBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-signal/25 bg-card/80 px-3.5 py-1.5 text-[11px] font-medium text-muted-foreground shadow-sm">
      <span className="relative flex h-1.5 w-1.5">
        <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal" />
        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
      </span>
      <span className="font-semibold uppercase tracking-[0.16em] text-foreground">Live wire</span>
    </div>
  );
}
