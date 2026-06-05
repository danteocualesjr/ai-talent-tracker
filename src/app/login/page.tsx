import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { LoginForm } from "./login-form";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div className="absolute right-4 top-4 z-10 md:right-6 md:top-6">
        <ThemeToggle />
      </div>
      <div className="pointer-events-none absolute inset-0 hero-backdrop" />
      <div className="pointer-events-none absolute inset-0 grid-bg grid-fade" />
      <div className="pointer-events-none absolute inset-x-0 top-1/3 -z-0 mx-auto h-72 w-[480px] rounded-full bg-signal/12 blur-[120px]" />
      <div className="relative w-full max-w-[400px]">
        <div className="mb-10 flex justify-center">
          <Logo />
        </div>
        <div className="surface-card surface-elevated relative overflow-hidden p-8">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-foreground/15 to-transparent" />
          <h1 className="text-balance text-2xl font-bold tracking-tight">Sign in</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            We&apos;ll email you a magic link &mdash; no password required.
          </p>
          <Suspense fallback={<div className="mt-6 h-24 animate-pulse rounded-xl bg-muted" />}>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By signing in you agree to our{" "}
          <Link href="/privacy" className="link-subtle">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
