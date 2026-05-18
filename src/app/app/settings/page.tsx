import { createClient } from "@/lib/supabase/server";
import { ensureOrgForUser } from "@/lib/org";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supa = await createClient();
  const { data: { user } } = await supa.auth.getUser();
  const org = await ensureOrgForUser(user!.id, user!.email ?? null);

  return (
    <div className="container max-w-3xl space-y-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Workspace</CardTitle>
          <CardDescription>Identifiers for your org.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span>{org.name}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Slug</span><span className="font-mono">{org.slug}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">Plan</span><span className="capitalize">{org.plan}</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{user!.email}</span></div>
          <div className="flex justify-between"><span className="text-muted-foreground">User ID</span><span className="font-mono text-xs">{user!.id}</span></div>
        </CardContent>
      </Card>
    </div>
  );
}
