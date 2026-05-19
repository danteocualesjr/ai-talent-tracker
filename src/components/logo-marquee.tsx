export function LogoMarquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div
      className="relative overflow-hidden py-2"
      style={{ maskImage: "linear-gradient(to right, transparent, black 10%, black 90%, transparent)" }}
    >
      <div className="flex w-max animate-marquee gap-16 pr-16">
        {doubled.map((name, i) => (
          <div 
            key={`${name}-${i}`} 
            className="flex shrink-0 items-center gap-2 rounded-full border border-border/50 bg-muted/30 px-4 py-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
          >
            <span className="h-2 w-2 rounded-full bg-gradient-to-r from-primary to-purple-500" />
            {name}
          </div>
        ))}
      </div>
    </div>
  );
}
