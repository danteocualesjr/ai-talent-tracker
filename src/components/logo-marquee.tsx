export function LogoMarquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div
      aria-hidden="true"
      className="marquee-pause relative overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div className="flex w-max animate-marquee items-center gap-10 pr-10 md:gap-14 md:pr-14">
        {doubled.map((name, i) => (
          <div
            key={`${name}-${i}`}
            className="group/lab flex shrink-0 items-center gap-10 text-[15px] font-semibold tracking-tight text-muted-foreground/55 transition-all duration-200 hover:text-foreground md:gap-14 md:text-base"
          >
            <span className="inline-flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-signal/35 shadow-[0_0_0_3px_hsl(var(--signal)/0.08)] transition-all group-hover/lab:bg-signal group-hover/lab:shadow-[0_0_0_4px_hsl(var(--signal)/0.16)]" aria-hidden />
              <span className="font-serif italic font-normal opacity-90 transition-opacity group-hover/lab:opacity-100">{name}</span>
            </span>
            <span className="h-px w-6 bg-border/80" aria-hidden />
          </div>
        ))}
      </div>
    </div>
  );
}
