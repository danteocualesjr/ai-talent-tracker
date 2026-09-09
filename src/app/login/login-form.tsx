"use client";

import { use, useEffect, useState } from "react";
import { Loader2, Mail, RefreshCw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn, safeRedirectPath } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const STEPS = [
  { n: 1, label: "Email" },
  { n: 2, label: "Inbox" },
  { n: 3, label: "Sign in" },
] as const;

function LoginStepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-start gap-1.5" aria-label="Sign-in steps">
      {STEPS.map((step, i) => {
        const done = step.n < current;
        const active = step.n === current;
        return (
          <li key={step.n} className="flex min-w-0 flex-1 items-center gap-1.5">
            <div className="flex min-w-0 flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                  done && "bg-signal/20 text-signal",
                  active && "bg-signal text-[hsl(var(--signal-foreground))] shadow-[0_0_0_4px_hsl(var(--signal)/0.12)]",
                  !done && !active && "border border-border/70 bg-muted/50 text-muted-foreground",
                )}
                aria-current={active ? "step" : undefined}
              >
                {done ? "✓" : step.n}
              </span>
              <span
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-[0.12em]",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span
                aria-hidden
                className={cn(
                  "mb-5 h-px min-w-[12px] flex-1",
                  done || active ? "bg-signal/35" : "bg-border/70",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function LoginForm({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const params = use(searchParams);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.error === "auth") {
      toast.error("Your sign-in link expired or is invalid. Request a new one.");
    }
  }, [params.error]);

  async function sendLink(targetEmail: string) {
    setLoading(true);
    try {
      const supa = createClient();
      const origin = window.location.origin;
      const redirect = `${origin}/auth/callback?next=${encodeURIComponent(safeRedirectPath(params.next))}`;
      const { error } = await supa.auth.signInWithOtp({ email: targetEmail, options: { emailRedirectTo: redirect } });
      if (error) throw error;
      setSent(true);
      toast.success("Magic link sent");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send link");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await sendLink(email);
  }

  if (sent) {
    return (
      <div className="mt-6 animate-fade-up space-y-4">
        <LoginStepper current={2} />
        <div className="rounded-md border border-signal/20 bg-signal/5 p-5 text-sm leading-relaxed">
          <div className="flex items-start gap-3">
            <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-signal/10 text-signal ring-4 ring-signal/10">
              <Mail className="h-4 w-4" aria-hidden="true" />
              <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border-2 border-card bg-signal signal-pulse" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-foreground">Check your inbox</p>
              <p className="mt-1 text-muted-foreground">
                We sent a magic link to{" "}
                <span className="font-medium text-foreground">{email}</span>. Click it to sign in — you can close this tab afterward.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8"
                  disabled={loading}
                  aria-busy={loading}
                  onClick={() => sendLink(email)}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                      Sending…
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                      Resend link
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
                  disabled={loading}
                  onClick={() => {
                    setSent(false);
                    toast.message("Enter your email again to use a different address.");
                  }}
                >
                  Use a different email
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form className="mt-6 space-y-4" onSubmit={onSubmit}>
      <LoginStepper current={1} />
      {params.error === "auth" && (
        <div
          role="alert"
          className="rounded-md border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm leading-relaxed text-foreground"
        >
          Your magic link expired or is invalid. Enter your email below to get a new one.
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <div className="relative group rounded-lg transition-shadow focus-within:shadow-[0_0_0_3px_hsl(var(--signal)/0.12)]">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/60 transition-colors group-focus-within:text-signal" aria-hidden />
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="you@company.com"
            className="pl-10"
          />
        </div>
      </div>
      <Button type="submit" variant="signal" className="w-full" disabled={loading || !email} aria-busy={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Sending…
          </>
        ) : (
          "Send magic link"
        )}
      </Button>
    </form>
  );
}
