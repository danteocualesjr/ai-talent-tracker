function getGreeting(): { salutation: string; hint: string } {
  const hour = new Date().getHours();
  if (hour < 12) {
    return {
      salutation: "Good morning",
      hint: "Check overnight stealth flips and new departures first.",
    };
  }
  if (hour < 17) {
    return {
      salutation: "Good afternoon",
      hint: "Review priority moves and route high-confidence alerts.",
    };
  }
  return {
    salutation: "Good evening",
    hint: "Catch up on today's events before the next refresh cycle.",
  };
}

export function DashboardGreeting({ orgName }: { orgName: string }) {
  const { salutation, hint } = getGreeting();

  return (
    <div className="surface-card relative overflow-hidden p-5 lg:p-6">
      <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-signal/8 blur-3xl" />
      <div className="relative flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="label-caps">{salutation}</p>
          <h2 className="mt-1 text-xl font-bold tracking-tight md:text-2xl">
            {orgName}
          </h2>
        </div>
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground sm:text-right">
          {hint}
        </p>
      </div>
    </div>
  );
}
