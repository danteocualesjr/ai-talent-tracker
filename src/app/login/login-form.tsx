"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function LoginForm({ next }: { next: string }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const supa = createClient();
      const origin = window.location.origin;
      const redirect = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
      const { error } = await supa.auth.signInWithOtp({ email, options: { emailRedirectTo: redirect } });
      if (error) throw error;
      setSent(true);
      toast.success("Magic link sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send link");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-6 rounded-xl border border-signal/20 bg-signal/5 p-4 text-sm leading-relaxed">
        Check <span className="font-semibold text-foreground">{email}</span> for a magic link. You can close this tab.
      </div>
    );
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
          placeholder="you@company.com"
        />
      </div>
      <Button type="submit" className="w-full" disabled={loading || !email}>
        {loading ? "Sending..." : "Send magic link"}
      </Button>
    </form>
  );
}
