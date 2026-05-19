"use client";

import Link from "next/link";
import { useState } from "react";
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

  return (
    <header className="sticky top-0 z-30 w-full border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-1 text-sm md:flex">
          {LINKS.map((l) => (
            <Link 
              key={l.href} 
              href={l.href}
              className="rounded-lg px-4 py-2 font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {l.label}
            </Link>
          ))}
          <div className="mx-3 h-5 w-px bg-border" />
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild size="sm" className="ml-1">
            <Link href="/login">Start tracking</Link>
          </Button>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-lg p-2.5 transition-colors hover:bg-accent md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className={cn("border-t border-border/40 bg-background/95 backdrop-blur-lg md:hidden", open ? "block" : "hidden")}>
        <nav className="container flex flex-col gap-1 py-4 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-4 py-2.5 font-medium transition-colors hover:bg-accent"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-4 py-2.5 font-medium transition-colors hover:bg-accent">
            Log in
          </Link>
          <Button asChild className="mt-2">
            <Link href="/login">Start tracking</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
