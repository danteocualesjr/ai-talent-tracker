import Link from "next/link";
import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";

export const metadata = { title: "Log in" };

export default function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-muted/30 p-6">
      <div className="pointer-events-none absolute inset-0 grid-bg grid-fade opacity-50" />
      <div className="pointer-events-none absolute inset-0 gradient-mesh" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border bg-background p-6 shadow-xl">
          <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">We&apos;ll email you a magic link.</p>
          <LoginForm searchParams={searchParams} />
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          By signing in you agree to our <Link href="/privacy" className="underline">privacy policy</Link>.
        </p>
      </div>
    </div>
  );
}
