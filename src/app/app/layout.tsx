import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, Building2, CreditCard, LayoutDashboard, ListChecks, LogOut, Radar, Settings, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) redirect("/login?next=/app");
  const org = await ensureOrgForUser(user.id, user.email ?? null);

  return (
    <div className="grid min-h-screen grid-cols-[260px_1fr]">
      <aside className="border-r bg-muted/30">
        <div className="flex h-14 items-center gap-2 border-b px-5 font-semibold">
          <Radar className="h-5 w-5" />
          <span>AI Talent Tracker</span>
        </div>
        <div className="px-3 py-4">
          <div className="px-2 pb-2 text-xs uppercase tracking-widest text-muted-foreground">Workspace</div>
          <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2 text-sm">
            <span className="truncate">{org.name}</span>
            <Badge variant="secondary" className="capitalize">{org.plan}</Badge>
          </div>
        </div>
        <nav className="space-y-1 px-3 text-sm">
          <NavItem href="/app" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" />
          <NavItem href="/app/watchlist" icon={<ListChecks className="h-4 w-4" />} label="Watchlist" />
          <NavItem href="/app/events" icon={<Users className="h-4 w-4" />} label="Events" />
          <NavItem href="/app/labs" icon={<Building2 className="h-4 w-4" />} label="Lab rosters" />
          <NavItem href="/app/alerts" icon={<Bell className="h-4 w-4" />} label="Alerts" />
          <NavItem href="/app/billing" icon={<CreditCard className="h-4 w-4" />} label="Billing" />
          <NavItem href="/app/settings" icon={<Settings className="h-4 w-4" />} label="Settings" />
        </nav>
        <div className="absolute bottom-4 left-3 right-3">
          <form action="/auth/signout" method="post">
            <Button variant="ghost" className="w-full justify-start" size="sm">
              <LogOut className="mr-2 h-4 w-4" /> Sign out ({user.email})
            </Button>
          </form>
        </div>
      </aside>
      <main className="overflow-y-auto">{children}</main>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
    >
      {icon}
      {label}
    </Link>
  );
}
