import Link from "next/link";
import { ArrowLeft, Bell, ListChecks, Shield, Users, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginForm } from "./login-form";

export const metadata = { title: "Log in" };

export default function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div className="absolute left-4 top-4 z-10 md:left-6 md:top-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-background/80 px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-all hover:border-foreground/15 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform motion-safe:group-hover:-translate-x-0.5" />
          Home
        </Link>
      </div>
      <div className="absolute right-4 top-4 z-10 md:right-6 md:top-6">
        <ThemeToggle />
      </div>
      <div className="pointer-events-none absolute inset-0 hero-backdrop" />
      <div className="pointer-events-none absolute inset-0 grid-bg grid-fade" />
      <div className="pointer-events-none absolute inset-x-0 top-1/3 -z-0 mx-auto h-72 w-[480px] rounded-full bg-signal/12 blur-[120px]" />
      <div className="relative w-full max-w-4xl animate-fade-up">
        <div className="mb-10 flex justify-center animate-fade-up animate-fade-up-delay-1">
          <Logo />
        </div>
        <div className="grid gap-5 md:grid-cols-[400px_1fr] animate-fade-up animate-fade-up-delay-2">
          <div>
            <div className="surface-card surface-elevated relative overflow-hidden p-8 ring-1 ring-border/40 transition-shadow focus-within:ring-signal/25 motion-safe:hover:-translate-y-0.5 motion-safe:hover:shadow-pop">
              <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
              <div className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-signal/8 blur-3xl" />
              <h1 className="text-balance text-2xl font-bold tracking-tight">Sign in</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                We&apos;ll email you a magic link &mdash; no password required.
              </p>
              <LoginForm searchParams={searchParams} />
              <div className="mt-6 flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 px-3 py-2.5 text-[11px] text-muted-foreground">
                <Shield className="h-3.5 w-3.5 shrink-0 text-signal" />
                <span>Magic links expire in 15 minutes. We never store passwords.</span>
              </div>
            </div>
            <p className="mt-6 text-center text-xs text-muted-foreground">
              By signing in you agree to our{" "}
              <Link href="/privacy" className="link-subtle">
                privacy policy
              </Link>
              .
            </p>
          </div>
          <div className="surface-card hidden p-8 md:block animate-fade-up animate-fade-up-delay-3">
            <div className="label-caps">After sign-in</div>
            <h2 className="mt-3 text-2xl font-bold tracking-tight">Your watchlist starts warming immediately.</h2>
            <div className="mt-6 space-y-3">
              {([
                { icon: ListChecks, title: "Paste profiles", body: "Add individual LinkedIn URLs or browse curated lab rosters." },
                { icon: Users, title: "Review changes", body: "See classified events, confidence scores, and profile snapshots." },
                { icon: Bell, title: "Route alerts", body: "Send high-signal changes to Slack, email, or signed webhooks." },
              ] satisfies { icon: LucideIcon; title: string; body: string }[]).map(({ icon: Icon, title, body }, i, arr) => {
                const delayClass = ["animate-fade-up-delay-3", "animate-fade-up-delay-4", "animate-fade-up-delay-5"][i] ?? "animate-fade-up-delay-5";
                return (
                <div
                  key={title}
                  className={`relative flex gap-3 rounded-xl border border-border/60 bg-muted/30 p-4 transition-all duration-200 hover:border-signal/20 hover:bg-muted/50 hover:shadow-sm animate-fade-up ${delayClass}`}
                >
                  {i < arr.length - 1 && (
                    <span className="pointer-events-none absolute -bottom-3 left-[22px] hidden h-3 w-px bg-gradient-to-b from-signal/40 to-transparent md:block" aria-hidden />
                  )}
                  <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-signal/10 text-signal ring-4 ring-card">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="tnum text-[10px] font-bold text-signal">0{i + 1}</span>
                      <span className="text-sm font-semibold">{title}</span>
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{body}</p>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
