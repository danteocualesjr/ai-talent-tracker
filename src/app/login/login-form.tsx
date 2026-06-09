"use client";

import { use, useState } from "react";
import { Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { safeRedirectPath } from "@/lib/utils";

export function LoginForm({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = use(searchParams);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const supa = createClient();
      const origin = window.location.origin;
      const redirect = `${origin}/auth/callback?next=${encodeURIComponent(safeRedirectPath(params.next))}`;
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
      <div className="mt-6 rounded-xl border border-signal/20 bg-signal/5 p-5 text-sm leading-relaxed">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-signal/10 text-signal">
            <Mail className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">Check your inbox</p>
            <p className="mt-1 text-muted-foreground">
              We sent a magic link to{" "}
              <span className="font-medium text-foreground">{email}</span>. Click it to sign in — you can close this tab afterward.
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-3 h-8 px-0 text-xs text-muted-foreground hover:text-foreground"
              disabled={loading}
              onClick={() => {
                setSent(false);
                toast.message("Enter your email again to resend the link.");
              }}
            >
              Use a different email
            </Button>
          </div>
        </div>
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
      <Button type="submit" className="w-full" disabled={loading || !email} aria-busy={loading}>
        {loading ? "Sending..." : "Send magic link"}
      </Button>
    </form>
  );
}
