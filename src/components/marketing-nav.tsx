import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Radar } from "lucide-react";

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Radar className="h-5 w-5" />
          <span>AI Talent Tracker</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Button asChild variant="ghost" size="sm"><Link href="/feed">Feed</Link></Button>
          <Button asChild variant="ghost" size="sm"><Link href="/labs">Labs</Link></Button>
          <Button asChild variant="ghost" size="sm"><Link href="/pricing">Pricing</Link></Button>
          <Button asChild variant="ghost" size="sm"><Link href="/login">Log in</Link></Button>
          <Button asChild size="sm"><Link href="/login">Start tracking</Link></Button>
        </nav>
      </div>
    </header>
  );
}
