import Link from "next/link";
import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";

export const metadata = { title: "Log in" };

export default function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div className="pointer-events-none absolute inset-0 grid-bg grid-fade" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-xl border bg-card p-7 shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.25)]">
          <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">We&apos;ll email you a magic link.</p>
          <LoginForm searchParams={searchParams} />
        </div>
        <p className="mt-5 text-center text-xs text-muted-foreground">
          By signing in you agree to our{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:no-underline">
            privacy policy
          </Link>.
        </p>
      </div>
    </div>
  );
}
