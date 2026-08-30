export function LabGrid({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 md:gap-x-10">
      {items.map((name) => (
        <span
          key={name}
          className="text-[15px] font-semibold tracking-tight text-muted-foreground/70 transition-colors hover:text-foreground md:text-base"
        >
          {name}
        </span>
      ))}
    </div>
  );
}
