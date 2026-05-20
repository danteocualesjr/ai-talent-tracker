"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/feed", label: "Feed" },
  { href: "/labs", label: "Labs" },
  { href: "/pricing", label: "Pricing" },
];

export function MarketingNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-md transition-shadow duration-200",
        scrolled ? "border-border shadow-[0_8px_30px_-20px_hsl(var(--foreground)/0.12)]" : "border-border/60",
      )}
    >
      <div className="container flex h-14 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-1 text-sm md:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <span className="mx-2 h-4 w-px bg-border" />
          <Link
            href="/login"
            className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-accent/60 hover:text-foreground"
          >
            Log in
          </Link>
          <Button asChild size="sm" className="ml-1">
            <Link href="/login">Start tracking</Link>
          </Button>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-md p-2 text-muted-foreground hover:bg-accent md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className={cn("border-t border-border/70 bg-background md:hidden", open ? "block" : "hidden")}>
        <nav className="container flex flex-col gap-1 py-3 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="rounded-md px-3 py-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            Log in
          </Link>
          <Button asChild className="mt-1">
            <Link href="/login">Start tracking</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
