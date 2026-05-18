import { Badge } from "@/components/ui/badge";
import { Bell, LineChart, ListChecks, Radar, Settings, Sparkles, Users } from "lucide-react";

export function DashboardPreview() {
  return (
    <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl ring-1 ring-foreground/5">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-amber-400/70" />
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400/70" />
        </div>
        <div className="ml-3 hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex">
          <Radar className="h-3 w-3" />
          <span className="font-mono">app.aitalent.tracker</span>
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
              <div className="text-xs text-muted-foreground">Live updates from your 47 tracked profiles</div>
            </div>
            <Badge variant="success" className="hidden sm:inline-flex">All systems live</Badge>
          </div>

          <div className="mt-4 grid gap-2.5 grid-cols-3">
            <Stat label="Tracked" value="47" delta="+3" />
            <Stat label="Events 30d" value="12" delta="+5" />
            <Stat label="Stealth" value="3" delta="+1" tone="amber" />
          </div>

          <div className="mt-4 divide-y rounded-lg border">
            <Row name="Jane Researcher" initials="JR" tone="purple" tag="Went stealth" tone2="warning" when="14m" />
            <Row name="Mike Patel" initials="MP" tone="blue" tag="Joined Anthropic" tone2="default" when="2h" />
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
      className={`flex items-center gap-2 rounded-md px-2.5 py-1.5 ${active ? "bg-background font-medium shadow-sm" : "text-muted-foreground"}`}
    >
      {icon}
      {label}
    </div>
  );
}

function Stat({ label, value, delta, tone = "emerald" }: { label: string; value: string; delta: string; tone?: "emerald" | "amber" }) {
  const color = tone === "amber" ? "text-amber-600" : "text-emerald-600";
  return (
    <div className="rounded-lg border bg-muted/20 p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 flex items-baseline gap-1.5">
        <div className="text-xl font-semibold tabular-nums">{value}</div>
        <div className={`text-xs ${color}`}>{delta}</div>
      </div>
    </div>
  );
}

const TONE_MAP: Record<string, string> = {
  purple: "from-purple-200 to-purple-400 text-purple-900",
  blue:   "from-blue-200 to-blue-400 text-blue-900",
  emerald:"from-emerald-200 to-emerald-400 text-emerald-900",
  rose:   "from-rose-200 to-rose-400 text-rose-900",
};

function Row({ name, initials, tone, tag, tone2, when }: { name: string; initials: string; tone: keyof typeof TONE_MAP; tag: string; tone2: "default" | "warning" | "success"; when: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className={`flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-semibold ${TONE_MAP[tone]}`}>
        {initials}
      </div>
      <div className="flex-1 text-sm font-medium">{name}</div>
      <Badge variant={tone2 as "default" | "warning" | "success"} className="text-[10px]">{tag}</Badge>
      <div className="font-mono text-[10px] text-muted-foreground">{when}</div>
    </div>
  );
}
