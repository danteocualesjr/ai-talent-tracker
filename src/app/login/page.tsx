import Link from "next/link";
import { Logo } from "@/components/logo";
import { LoginForm } from "./login-form";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-6">
      <div className="pointer-events-none absolute inset-0 hero-backdrop" />
      <div className="pointer-events-none absolute inset-0 grid-bg grid-fade" />
      <div className="relative w-full max-w-[400px]">
        <div className="mb-10 flex justify-center">
          <Logo />
        </div>
        <div className="surface-elevated rounded-2xl border border-border/60 bg-card p-8">
          <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">We&apos;ll email you a magic link.</p>
          <LoginForm next={params.next} />
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By signing in you agree to our{" "}
          <Link href="/privacy" className="font-medium text-foreground underline-offset-4 hover:underline">
            privacy policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
