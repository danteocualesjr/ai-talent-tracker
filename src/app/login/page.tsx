import Link from "next/link";
import { ArrowLeft, Bell, ListChecks, Shield, Sparkles } from "lucide-react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginForm } from "./login-form";

export const metadata = { title: "Log in" };

export default function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return (
    <div className="relative flex min-h-screen overflow-hidden">
      <div className="absolute left-0 top-0 z-10 p-6">
        <Link
          href="/"
          className="group inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-background/85 px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-all hover:border-foreground/15 hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform motion-safe:group-hover:-translate-x-0.5" />
          Home
        </Link>
      </div>
      <div className="absolute right-0 top-0 z-10 p-6">
        <ThemeToggle />
      </div>

      <div className="relative hidden w-[46%] overflow-hidden bg-foreground lg:block">
        <div className="pointer-events-none absolute inset-0 terminal-scanlines opacity-60" aria-hidden />
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--background)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--background)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />
        <div className="pointer-events-none absolute -left-16 top-20 h-64 w-64 rounded-full bg-signal/25 blur-[90px]" />
        <div className="flex h-full flex-col justify-between p-12 text-background">
          <Logo showWordmark />
          <div className="animate-fade-up">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-background/45">
              Vol. 08 · Wire brief
            </p>
            <h2 className="mt-5 max-w-md font-serif text-4xl font-medium leading-[1.15] tracking-tight">
              Your watchlist starts warming immediately.
            </h2>
            <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-background/60">
              Paste LinkedIn URLs, browse lab rosters, and get classified alerts in minutes.
            </p>
            <div className="mt-8 border-l-2 border-signal pl-4">
              <p className="font-serif text-lg italic leading-snug text-background/85">
                “The departure feed is the closest thing to a cheat code we&apos;ve seen for AI sourcing.”
              </p>
              <p className="mt-2 text-xs text-background/45">Casey Aldridge · founding recruiter</p>
            </div>
            <div className="mt-10 grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-background/15 bg-background/10">
              {[
                { value: "5", label: "Free profiles" },
                { value: "<15m", label: "Detection" },
                { value: "3", label: "Alert channels" },
              ].map((stat) => (
                <div key={stat.label} className="bg-background/5 px-4 py-3">
                  <div className="tnum text-xl font-bold text-background">{stat.value}</div>
                  <div className="mt-0.5 text-[10px] uppercase tracking-wide text-background/45">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-background/40">© {new Date().getFullYear()} AI Talent Tracker</p>
        </div>
      </div>

      <div className="relative flex w-full flex-col items-center justify-center bg-background p-6 lg:w-[54%]">
        <div className="pointer-events-none absolute inset-0 hero-backdrop opacity-50" />
        <div className="relative w-full max-w-md">
          <div className="mb-8 flex justify-center animate-fade-up lg:hidden">
            <Logo />
          </div>
          <div className="surface-card surface-elevated relative overflow-hidden p-8 animate-fade-up animate-fade-up-delay-1">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-signal/80 via-signal to-signal/80" />
            <h1 className="text-balance font-serif text-3xl font-medium tracking-tight">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              We&apos;ll email you a magic link — no password required.
            </p>
            <LoginForm searchParams={searchParams} />
            <div className="mt-6 flex items-center gap-2 rounded-md border border-border/60 bg-muted/40 px-3 py-2.5 text-[11px] text-muted-foreground">
              <Shield className="h-3.5 w-3.5 shrink-0 text-signal" />
              <span>Magic links expire in 15 minutes. We never store passwords.</span>
            </div>
          </div>
          <div className="mt-8 grid gap-3 animate-fade-up animate-fade-up-delay-2 lg:hidden">
            {[
              { icon: ListChecks, label: "Paste LinkedIn URLs or import a lab roster" },
              { icon: Sparkles, label: "Get classified stealth & founder alerts" },
              { icon: Bell, label: "Route to Slack, email, or webhook" },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-3 rounded-md border border-border/60 bg-card/60 px-3.5 py-2.5 text-xs text-muted-foreground"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-signal/10 text-signal">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {label}
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground animate-fade-up animate-fade-up-delay-3">
            By signing in you agree to our{" "}
            <Link href="/privacy" className="link-subtle">privacy policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
