export function LogoMarquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div
      className="marquee-pause relative overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)",
      }}
    >
      <div className="flex w-max animate-marquee items-center gap-12 pr-12">
        {doubled.map((name, i) => (
          <div
            key={`${name}-${i}`}
            className="flex shrink-0 items-center gap-12 text-[15px] font-semibold tracking-tight text-muted-foreground/60 transition-colors duration-200 hover:text-foreground"
          >
            <span>{name}</span>
            <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
          </div>
        ))}
      </div>
    </div>
  );
}
