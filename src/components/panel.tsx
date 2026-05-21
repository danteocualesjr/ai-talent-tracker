import { cn } from "@/lib/utils";

export function Panel({
  title,
  description,
  action,
  children,
  className,
  bodyClassName,
}: {
  title?: React.ReactNode;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  const hasHeader = title || description || action;

  return (
    <div className={cn("surface-elevated overflow-hidden rounded-2xl border border-border/60 bg-card", className)}>
      {hasHeader && (
        <div className="flex items-center justify-between gap-4 border-b border-border/60 px-5 py-4">
          <div>
            {title && <div className="text-sm font-bold">{title}</div>}
            {description && <div className="mt-0.5 text-xs text-muted-foreground">{description}</div>}
          </div>
          {action}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </div>
  );
}

export function EmptyPanel({
  icon,
  title,
  body,
  cta,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  cta?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-muted/30 text-muted-foreground">
        {icon}
      </div>
      <div className="text-sm font-bold">{title}</div>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{body}</p>
      {cta && <div className="mt-1">{cta}</div>}
    </div>
  );
}
