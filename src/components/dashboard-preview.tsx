import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Bell, LineChart, ListChecks, Settings, Sparkles, Users } from "lucide-react";

export function DashboardPreview() {
  return (
    <div className="preview-tilt preview-glow overflow-hidden rounded-xl border bg-card">
      {/* window chrome */}
      <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full border border-border bg-background" />
          <div className="h-2.5 w-2.5 rounded-full border border-border bg-background" />
          <div className="h-2.5 w-2.5 rounded-full border border-border bg-background" />
        </div>
        <div className="hidden flex-1 items-center justify-center text-[11px] text-muted-foreground sm:flex">
          <span className="rounded-md border bg-background px-2 py-0.5 font-mono">app.aitalent.tracker</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr]">
        {/* sidebar */}
        <div className="hidden border-r bg-muted/20 md:block">
          <div className="space-y-0.5 p-3 text-xs">
            <SideItem icon={<LineChart className="h-3.5 w-3.5" />} label="Dashboard" active />
            <SideItem icon={<ListChecks className="h-3.5 w-3.5" />} label="Watchlist" />
            <SideItem icon={<Users className="h-3.5 w-3.5" />} label="Events" />
            <SideItem icon={<Sparkles className="h-3.5 w-3.5" />} label="Labs" />
            <SideItem icon={<Bell className="h-3.5 w-3.5" />} label="Alerts" />
            <SideItem icon={<Settings className="h-3.5 w-3.5" />} label="Settings" />
          </div>
        </div>

        {/* main */}
        <div className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">Recent activity</div>
              <div className="text-xs text-muted-foreground">Live updates from 47 tracked profiles</div>
            </div>
            <div className="hidden items-center gap-1.5 rounded-full border bg-background px-2 py-0.5 text-[11px] text-muted-foreground sm:inline-flex">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-signal" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-signal" />
              </span>
              Live
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2.5">
            <Stat label="Tracked" value="47" delta="+3" />
            <Stat label="Events 30d" value="12" delta="+5" />
            <Stat label="Stealth" value="3" delta="+1" tone="amber" />
          </div>

          <div className="mt-4 divide-y overflow-hidden rounded-lg border">
            <Row name="Jane Researcher" initials="JR" tag="Went stealth" tone="warning" when="14m" highlight />
            <Row name="Mike Patel" initials="MP" tag="Joined Anthropic" tone="info" when="2h" />
            <Row name="Aria Chen" initials="AC" tag="Founding signal" tone="success" when="6h" />
            <Row name="Sam Becker" initials="SB" tag="Left OpenAI" tone="warning" when="1d" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SideItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 ${
        active ? "bg-background font-medium text-foreground shadow-sm" : "text-muted-foreground"
      }`}
    >
      {icon}
      {label}
    </div>
  );
}

function Stat({ label, value, delta, tone = "default" }: { label: string; value: string; delta: string; tone?: "default" | "amber" }) {
  const color = tone === "amber" ? "text-amber-700 dark:text-amber-400" : "text-signal";
  return (
    <div className="rounded-md border bg-background p-3 shadow-sm">
      <div className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-2">
        <div className="tnum text-xl font-semibold">{value}</div>
        <div className={`text-[11px] tnum ${color}`}>{delta}</div>
      </div>
    </div>
  );
}

function Row({ name, initials, tag, tone, when, highlight }: { name: string; initials: string; tag: string; tone: "warning" | "success" | "info"; when: string; highlight?: boolean }) {
  return (
    <div className={cn("flex items-center gap-3 px-3 py-2.5", highlight && "bg-amber-50/60 dark:bg-amber-950/20")}>
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground">
        {initials}
      </div>
      <div className="flex-1 truncate text-sm font-medium">{name}</div>
      <Badge variant={tone} className="text-[10px]">{tag}</Badge>
      <div className="tnum w-7 text-right font-mono text-[10px] text-muted-foreground">{when}</div>
    </div>
  );
}
