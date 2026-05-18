import Link from "next/link";
import { Radar } from "lucide-react";
import { LoginForm } from "./login-form";

export const metadata = { title: "Log in" };

export default function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-6">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-semibold">
          <Radar className="h-5 w-5" /> AI Talent Tracker
        </Link>
        <div className="rounded-xl border bg-background p-6 shadow">
          <h1 className="text-xl font-semibold">Sign in</h1>
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
