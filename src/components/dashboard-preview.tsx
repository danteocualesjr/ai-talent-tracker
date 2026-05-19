import { Badge } from "@/components/ui/badge";
import { Bell, LineChart, ListChecks, Radar, Settings, Sparkles, Users } from "lucide-react";

export function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-primary/10 ring-1 ring-foreground/5">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b bg-gradient-to-r from-muted/60 to-muted/40 px-4 py-3">
        <div className="flex gap-2">
          <div className="h-3 w-3 rounded-full bg-red-400 shadow-sm shadow-red-400/50" />
          <div className="h-3 w-3 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
          <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
        </div>
        <div className="ml-4 hidden items-center gap-2 rounded-full bg-background/60 px-3 py-1 text-xs text-muted-foreground sm:flex">
          <Radar className="h-3 w-3 text-primary" />
          <span className="font-mono">app.aitalent.tracker</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[180px_1fr]">
        {/* sidebar */}
        <div className="hidden border-r bg-muted/10 md:block">
          <div className="space-y-1 p-3 text-xs">
            <SideItem icon={<LineChart className="h-3.5 w-3.5" />} label="Dashboard" active />
            <SideItem icon={<ListChecks className="h-3.5 w-3.5" />} label="Watchlist" />
            <SideItem icon={<Users className="h-3.5 w-3.5" />} label="Events" />
            <SideItem icon={<Sparkles className="h-3.5 w-3.5" />} label="Labs" />
            <SideItem icon={<Bell className="h-3.5 w-3.5" />} label="Alerts" />
            <SideItem icon={<Settings className="h-3.5 w-3.5" />} label="Settings" />
          </div>
        </div>

        {/* main */}
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-bold tracking-tight">Recent activity</div>
              <div className="text-xs text-muted-foreground">Live updates from your 47 tracked profiles</div>
            </div>
            <Badge variant="success" className="hidden animate-pulse sm:inline-flex">All systems live</Badge>
          </div>

          <div className="mt-5 grid gap-3 grid-cols-3">
            <Stat label="Tracked" value="47" delta="+3" />
            <Stat label="Events 30d" value="12" delta="+5" />
            <Stat label="Stealth" value="3" delta="+1" tone="amber" />
          </div>

          <div className="mt-5 divide-y rounded-xl border shadow-sm">
            <Row name="Jane Researcher" initials="JR" tone="purple" tag="Went stealth" tone2="warning" when="14m" />
            <Row name="Mike Patel" initials="MP" tone="blue" tag="Joined Anthropic" tone2="info" when="2h" />
            <Row name="Aria Chen" initials="AC" tone="emerald" tag="Founding eng signal" tone2="success" when="6h" />
            <Row name="Sam Becker" initials="SB" tone="rose" tag="Left OpenAI" tone2="warning" when="1d" />
          </div>
        </div>
      </div>
    </div>
  );
}

function SideItem({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2 transition-all ${active ? "bg-primary/10 font-semibold text-primary shadow-sm" : "text-muted-foreground hover:bg-accent"}`}
    >
      {icon}
      {label}
    </div>
  );
}

function Stat({ label, value, delta, tone = "emerald" }: { label: string; value: string; delta: string; tone?: "emerald" | "amber" }) {
  const color = tone === "amber" ? "text-amber-600 dark:text-amber-400" : "text-emerald-600 dark:text-emerald-400";
  const bg = tone === "amber" ? "bg-amber-50 dark:bg-amber-950/30" : "bg-emerald-50 dark:bg-emerald-950/30";
  return (
    <div className="rounded-xl border bg-card p-3.5 shadow-sm transition-all hover:shadow-md">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">{label}</div>
      <div className="mt-1.5 flex items-baseline gap-2">
        <div className="text-2xl font-bold tabular-nums tracking-tight">{value}</div>
        <div className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${color} ${bg}`}>{delta}</div>
      </div>
    </div>
  );
}

const TONE_MAP: Record<string, string> = {
  purple: "from-purple-400 to-purple-600 text-white shadow-purple-500/25",
  blue:   "from-blue-400 to-blue-600 text-white shadow-blue-500/25",
  emerald:"from-emerald-400 to-emerald-600 text-white shadow-emerald-500/25",
  rose:   "from-rose-400 to-rose-600 text-white shadow-rose-500/25",
};

function Row({ name, initials, tone, tag, tone2, when }: { name: string; initials: string; tone: keyof typeof TONE_MAP; tag: string; tone2: "default" | "warning" | "success" | "info"; when: string }) {
  return (
    <div className="flex items-center gap-3.5 px-4 py-3 transition-colors hover:bg-accent/30">
      <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-[11px] font-bold shadow-lg ${TONE_MAP[tone]}`}>
        {initials}
      </div>
      <div className="flex-1 text-sm font-semibold">{name}</div>
      <Badge variant={tone2 as "default" | "warning" | "success" | "info"} className="text-[10px]">{tag}</Badge>
      <div className="font-mono text-[10px] text-muted-foreground/70">{when}</div>
    </div>
  );
}
