import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { countRecentOrgEvents } from "@/lib/queries";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";
import { AppMobileTitle } from "@/components/app-mobile-title";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) redirect("/login?next=/app");
  const org = await ensureOrgForUser(user.id, user.email ?? null);
  const recentEventCount = await countRecentOrgEvents(org.id);

  return (
    <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:border focus:border-border/60 focus:bg-background focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        Skip to main content
      </a>
      <AppSidebar orgName={org.name} orgPlan={org.plan} />
      <div className="app-shell-bg relative flex min-w-0 flex-col">
        <div className="pointer-events-none absolute inset-0 noise opacity-30" aria-hidden />
        <AppTopbar email={user.email ?? ""} orgPlan={org.plan} unreadCount={recentEventCount} />
        <AppMobileTitle />
        <main id="main-content" className="relative flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
