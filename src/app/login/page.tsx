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
          className="group inline-flex items-center gap-1.5 rounded-xl border border-border/60 bg-background/80 px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-all hover:border-foreground/15 hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform motion-safe:group-hover:-translate-x-0.5" />
          Home
        </Link>
      </div>
      <div className="absolute right-0 top-0 z-10 p-6">
        <ThemeToggle />
      </div>

      <div className="hidden w-1/2 bg-foreground lg:block">
        <div className="flex h-full flex-col justify-between p-12 text-background">
          <Logo showWordmark />
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-background/50">Signal intelligence</p>
            <h2 className="mt-4 max-w-md text-4xl font-bold leading-tight tracking-tight">
              Your watchlist starts warming immediately.
            </h2>
            <p className="mt-4 max-w-sm text-background/60">
              Paste LinkedIn URLs, browse lab rosters, and get classified alerts in minutes.
            </p>
          </div>
          <p className="text-xs text-background/40">© {new Date().getFullYear()} AI Talent Tracker</p>
        </div>
      </div>

      <div className="relative flex w-full flex-col items-center justify-center bg-background p-6 lg:w-1/2">
        <div className="pointer-events-none absolute inset-0 hero-backdrop opacity-60" />
        <div className="relative w-full max-w-md animate-fade-up">
          <div className="mb-8 flex justify-center lg:hidden">
            <Logo />
          </div>
          <div className="surface-card surface-elevated relative overflow-hidden p-8">
            <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-signal/40 to-transparent" />
            <h1 className="text-balance text-2xl font-bold tracking-tight">
              Sign <span className="font-serif italic font-normal text-gradient-hero">in</span>
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              We&apos;ll email you a magic link — no password required.
            </p>
            <LoginForm searchParams={searchParams} />
            <div className="mt-6 flex items-center gap-2 rounded-xl border border-border/50 bg-muted/30 px-3 py-2.5 text-[11px] text-muted-foreground">
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
