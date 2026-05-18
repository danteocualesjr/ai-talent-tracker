import Link from "next/link";

export function MarketingFooter() {
  return (
    <footer className="mt-24 border-t">
      <div className="container flex flex-col gap-4 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div>© {new Date().getFullYear()} AI Talent Tracker</div>
        <nav className="flex flex-wrap gap-4">
          <Link href="/feed">Departure feed</Link>
          <Link href="/labs">Labs</Link>
          <Link href="/pricing">Pricing</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/opt-out">Opt-out</Link>
        </nav>
      </div>
    </footer>
  );
}
