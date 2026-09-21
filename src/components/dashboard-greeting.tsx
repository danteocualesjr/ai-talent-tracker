import Link from "next/link";
import { ArrowRight, Moon, Sun, Sunrise } from "lucide-react";

function getGreeting(): { salutation: string; hint: string; icon: typeof Sun } {
  const hour = new Date().getHours();
  if (hour < 12) {
    return {
      salutation: "Good morning",
      hint: "Check overnight stealth flips and new departures first.",
      icon: Sunrise,
    };
  }
  if (hour < 17) {
    return {
      salutation: "Good afternoon",
      hint: "Review priority moves and route high-confidence alerts.",
      icon: Sun,
    };
  }
  return {
    salutation: "Good evening",
    hint: "Catch up on today's events before the next refresh cycle.",
    icon: Moon,
  };
}

function formatDateStamp(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(date);
}

function formatTimeStamp(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function DashboardGreeting({
  orgName,
  profileCount = 0,
  eventCount7d = 0,
  staleCount = 0,
}: {
  orgName: string;
  profileCount?: number;
  eventCount7d?: number;
  staleCount?: number;
}) {
  const { salutation, hint, icon: Icon } = getGreeting();
  const now = new Date();
  const nextHint =
    profileCount === 0
      ? "Your watchlist is empty — add a few LinkedIn URLs to start the brief."
      : staleCount > 0
        ? `${staleCount} profile${staleCount === 1 ? "" : "s"} need a refresh before the next cycle.`
        : eventCount7d > 0
          ? `${eventCount7d} event${eventCount7d === 1 ? "" : "s"} in the last 7 days — review high-confidence moves first.`
          : hint;
  const nextHref = profileCount === 0 ? "/app/watchlist" : staleCount > 0 ? "/app/watchlist?status=stale" : "/app/events";
  const nextLabel = profileCount === 0 ? "Add profiles" : staleCount > 0 ? "Refresh stale" : "Open event inbox";
  const showInsightsLink = profileCount > 0 && staleCount === 0 && eventCount7d > 0;

  return (
    <div className="surface-card group/greeting relative overflow-hidden p-5 lg:p-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-signal/60 to-transparent" />
      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-signal/8 blur-3xl transition-opacity duration-500 group-hover/greeting:opacity-100" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          maskImage: "radial-gradient(ellipse 80% 70% at 20% 0%, black, transparent)",
          WebkitMaskImage: "radial-gradient(ellipse 80% 70% at 20% 0%, black, transparent)",
        }}
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border/60 bg-signal/10 text-signal motion-safe:transition-transform motion-safe:group-hover/greeting:scale-105">
            <Icon className="h-4 w-4" aria-hidden />
          </div>
          <div>
            <p className="label-caps flex items-center gap-2">
              {salutation}
              <span className="h-1 w-1 rounded-full bg-signal signal-pulse" aria-hidden />
              daily brief
            </p>
            <h2 className="mt-1 font-serif text-2xl font-medium tracking-tight md:text-[1.7rem]">
              <span className="text-gradient-hero">{orgName}</span>
            </h2>
            <p className="mt-1.5 text-xs text-muted-foreground">
              <time dateTime={now.toISOString()} className="tnum">
                {formatDateStamp(now)}
                <span className="mx-1.5 text-border">·</span>
                {formatTimeStamp(now)}
              </time>
            </p>
          </div>
        </div>
        <div className="max-w-xs rounded-md border border-border/50 bg-muted/30 px-4 py-3 transition-colors duration-200 hover:border-signal/25 hover:bg-signal/[0.04] sm:max-w-[280px]">
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-right">{nextHint}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 sm:justify-end">
            <Link
              href={nextHref}
              className="group/hint inline-flex items-center gap-1 text-xs font-semibold text-foreground transition-colors hover:text-signal"
            >
              {nextLabel}
              <ArrowRight className="h-3 w-3 transition-transform motion-safe:group-hover/hint:translate-x-0.5" aria-hidden />
            </Link>
            {showInsightsLink && (
              <Link
                href="/app/insights"
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-signal"
              >
                View trends
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
