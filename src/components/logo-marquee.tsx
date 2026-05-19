export function LogoMarquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div
      className="relative overflow-hidden"
      style={{ maskImage: "linear-gradient(to right, transparent, black 12%, black 88%, transparent)" }}
    >
      <div className="flex w-max animate-marquee gap-12 pr-12">
        {doubled.map((name, i) => (
          <div
            key={`${name}-${i}`}
            className="flex shrink-0 items-center text-[15px] font-medium tracking-tight text-muted-foreground/80"
          >
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}
