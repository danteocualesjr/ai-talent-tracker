export function LogoMarquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div
      className="marquee-pause relative overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
    >
      <div className="flex w-max animate-marquee items-center gap-10 pr-10">
        {doubled.map((name, i) => (
          <div
            key={`${name}-${i}`}
            className="flex shrink-0 items-center gap-10 text-[15px] font-medium tracking-tight text-muted-foreground/75 transition-colors hover:text-foreground"
          >
            <span>{name}</span>
            <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
          </div>
        ))}
      </div>
    </div>
  );
}
