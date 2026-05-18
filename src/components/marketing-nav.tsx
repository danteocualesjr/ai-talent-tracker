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
    <header className="sticky top-0 z-30 w-full border-b border-border/60 bg-background/70 backdrop-blur-md">
      <div className="container flex h-14 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-1 text-sm md:flex">
          {LINKS.map((l) => (
            <Button asChild key={l.href} variant="ghost" size="sm">
              <Link href={l.href}>{l.label}</Link>
            </Button>
          ))}
          <div className="mx-2 h-5 w-px bg-border" />
          <Button asChild variant="ghost" size="sm"><Link href="/login">Log in</Link></Button>
          <Button asChild size="sm"><Link href="/login">Start tracking</Link></Button>
        </nav>

        <button
          onClick={() => setOpen(!open)}
          className="rounded-md p-2 hover:bg-accent md:hidden"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className={cn("border-t border-border/60 bg-background md:hidden", open ? "block" : "hidden")}>
        <nav className="container flex flex-col gap-1 py-3 text-sm">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 hover:bg-accent"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/login" onClick={() => setOpen(false)} className="rounded-md px-3 py-2 hover:bg-accent">
            Log in
          </Link>
          <Button asChild size="sm" className="mt-1"><Link href="/login">Start tracking</Link></Button>
        </nav>
      </div>
    </header>
  );
}
