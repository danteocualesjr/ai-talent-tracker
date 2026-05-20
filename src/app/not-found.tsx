import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-4xl font-semibold tracking-tight">404</h1>
      <p className="text-muted-foreground">That page doesn&apos;t exist.</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button asChild><Link href="/">Go home</Link></Button>
        <Button variant="outline" asChild><Link href="/feed">Browse feed</Link></Button>
      </div>
    </div>
  );
}
