import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { AppSidebar } from "@/components/app-sidebar";
import { AppTopbar } from "@/components/app-topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) redirect("/login?next=/app");
  const org = await ensureOrgForUser(user.id, user.email ?? null);

  return (
    <div className="grid min-h-screen md:grid-cols-[260px_1fr]">
      <AppSidebar orgName={org.name} orgPlan={org.plan} />
      <div className="app-shell-bg flex min-w-0 flex-col">
        <AppTopbar email={user.email ?? ""} orgPlan={org.plan} />
        <main id="main-content" className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  );
}
