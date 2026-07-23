import { Badge } from "@/components/ui/badge";
import { Sparkline, buildTrendSeries } from "@/components/sparkline";
import { cn } from "@/lib/utils";
import { Bell, LineChart, ListChecks, Search, Settings, Sparkles, Users } from "lucide-react";

export function DashboardPreview() {
  return (
    <div aria-hidden="true" className="preview-frame preview-float preview-tilt">
      <div className="overflow-hidden rounded-[calc(1.15rem-1px)] border border-border/40 bg-card">
        {/* Browser chrome */}
        <div className="relative flex items-center gap-3 border-b border-border/60 bg-gradient-to-b from-muted/50 to-muted/20 px-4 py-3">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-signal/35 to-transparent" />
          <div className="flex gap-1.5">
            <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57] ring-1 ring-black/10" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e] ring-1 ring-black/10" />
            <div className="h-2.5 w-2.5 rounded-full bg-[#28c840] ring-1 ring-black/10" />
          </div>
          <div className="hidden flex-1 items-center justify-center text-[11px] text-muted-foreground sm:flex">
            <span className="inline-flex items-center gap-2 rounded-lg border border-border/60 bg-background/90 px-3 py-1 font-mono shadow-sm backdrop-blur-sm">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
              </span>
              app.aitalent.tracker
            </span>
          </div>
          <div className="hidden items-center gap-1 rounded-md border border-border/50 bg-background/70 px-1.5 py-0.5 text-[10px] text-muted-foreground sm:flex">
            <Search className="h-3 w-3" />
            <span className="hidden md:inline">⌘K</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr]">
          <div className="hidden border-r border-border/60 bg-gradient-to-b from-muted/30 to-muted/10 md:block">
            <div className="px-3 pt-3 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Tracking</div>
            <div className="space-y-0.5 px-3 text-xs">
              <SideItem icon={<LineChart className="h-3.5 w-3.5" />} label="Dashboard" active />
              <SideItem icon={<ListChecks className="h-3.5 w-3.5" />} label="Watchlist" />
              <SideItem icon={<Users className="h-3.5 w-3.5" />} label="Events" />
              <SideItem icon={<Sparkles className="h-3.5 w-3.5" />} label="Labs" />
            </div>
            <div className="mt-4 px-3 pb-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Workspace</div>
            <div className="space-y-0.5 px-3 text-xs">
              <SideItem icon={<Bell className="h-3.5 w-3.5" />} label="Alerts" />
              <SideItem icon={<Settings className="h-3.5 w-3.5" />} label="Settings" />
            </div>
          </div>

          <div className="relative p-6">
            <div className="pointer-events-none absolute -right-8 -top-10 h-36 w-36 rounded-full bg-signal/10 blur-3xl" />
            <div className="relative flex items-center justify-between">
              <div>
                <div className="text-sm font-bold tracking-tight">
                  Recent <span className="font-serif italic font-normal text-gradient-hero">activity</span>
                </div>
                <div className="text-xs text-muted-foreground">Live updates from 47 tracked profiles</div>
              </div>
              <div className="hidden items-center gap-1.5 rounded-full border border-signal/25 bg-signal/5 px-2.5 py-1 text-[11px] font-medium text-signal shadow-sm sm:inline-flex">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
                </span>
                Live
              </div>
            </div>

            <div className="relative mt-5 grid grid-cols-3 gap-3">
              <Stat label="Tracked" value="47" delta="+3" series={buildTrendSeries(47, 12, 0.4)} />
              <Stat label="Events 30d" value="12" delta="+5" series={buildTrendSeries(12, 12, 0.6)} tone="signal" />
              <Stat label="Stealth" value="3" delta="+1" series={buildTrendSeries(3, 12, 0.6)} tone="amber" />
            </div>

            <div className="relative mt-5 divide-y divide-border/60 overflow-hidden rounded-xl border border-border/60 bg-background/60 shadow-[inset_0_1px_0_0_hsl(var(--background)/0.5)] backdrop-blur-sm">
              <Row name="Jane Researcher" initials="JR" tag="Went stealth" tone="warning" when="14m" highlight />
              <Row name="Mike Patel" initials="MP" tag="Joined Anthropic" tone="info" when="2h" />
              <Row name="Aria Chen" initials="AC" tag="Founding signal" tone="success" when="6h" />
              <Row name="Sam Becker" initials="SB" tag="Left OpenAI" tone="warning" when="1d" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SideItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-2.5 py-2 transition-colors",
        active
          ? "nav-active-rail bg-signal/10 pl-3.5 font-semibold text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-background/60 hover:text-foreground",
      )}
    >
      {icon}
      {label}
    </div>
  );
}

function Stat({
  label,
  value,
  delta,
  tone = "default",
  series,
}: {
  label: string;
  value: string;
  delta: string;
  tone?: "default" | "amber" | "signal";
  series?: number[];
}) {
  const deltaColor =
    tone === "amber" ? "text-amber-accent" : tone === "signal" ? "text-signal" : "text-signal";
  const lineColor =
    tone === "amber" ? "text-amber-accent" : tone === "signal" ? "text-signal" : "text-foreground/70";
  return (
    <div className="surface-card relative overflow-hidden p-3.5">
      <div className="pointer-events-none absolute -right-4 -top-4 h-12 w-12 rounded-full bg-signal/8 blur-xl" />
      <div className="relative text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="relative mt-1.5 flex items-end justify-between gap-2">
        <div>
          <div className="tnum text-xl font-bold tracking-tight">{value}</div>
          <div className={`tnum text-[11px] font-semibold ${deltaColor}`}>{delta}</div>
        </div>
        {series && (
          <div className={lineColor} aria-hidden>
            <Sparkline data={series} width={48} height={18} strokeWidth={1.25} />
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ name, initials, tag, tone, when, highlight }: { name: string; initials: string; tag: string; tone: "warning" | "success" | "info"; when: string; highlight?: boolean }) {
  return (
    <div className={cn("group relative flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/40", highlight && "bg-amber-50/70 dark:bg-amber-950/25")}>
      {highlight && (
        <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-0.5 rounded-full bg-amber-accent/80" />
      )}
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-muted to-muted/40 text-[10px] font-bold text-foreground ring-2 ring-background">
        {initials}
      </div>
      <div className="flex-1 truncate text-sm font-semibold">{name}</div>
      <Badge variant={tone} className="text-[10px]">{tag}</Badge>
      <div className="tnum w-8 text-right font-mono text-[10px] text-muted-foreground">{when}</div>
    </div>
  );
}
