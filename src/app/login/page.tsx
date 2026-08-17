import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
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
        <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{
          backgroundImage:
            "linear-gradient(to right, hsl(var(--background)) 1px, transparent 1px), linear-gradient(to bottom, hsl(var(--background)) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }} />
        <div className="pointer-events-none absolute -left-16 top-20 h-64 w-64 rounded-full bg-signal/25 blur-[90px]" />
        <div className="flex h-full flex-col justify-between p-12 text-background">
          <Logo showWordmark />
          <div>
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
          </div>
          <p className="text-xs text-background/40">© {new Date().getFullYear()} AI Talent Tracker</p>
        </div>
      </div>

      <div className="relative flex w-full flex-col items-center justify-center bg-background p-6 lg:w-[54%]">
        <div className="pointer-events-none absolute inset-0 hero-backdrop opacity-50" />
        <div className="relative w-full max-w-md animate-fade-up">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>
          <div className="surface-card surface-elevated relative overflow-hidden p-8">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-signal" />
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
          <p className="mt-6 text-center text-xs text-muted-foreground">
            By signing in you agree to our{" "}
            <Link href="/privacy" className="link-subtle">privacy policy</Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
