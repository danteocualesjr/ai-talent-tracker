"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/feed", label: "Feed" },
  { href: "/labs", label: "Labs" },
  { href: "/pricing", label: "Pricing" },
];

export function MarketingNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-foreground bg-background">
      <div className="container flex h-14 items-center justify-between">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center md:flex">
          {LINKS.map((l, i) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "border-l border-foreground px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] transition-colors",
                  active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-foreground hover:text-background",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center border-l border-foreground md:flex">
          <div className="border-r border-foreground px-4 py-4">
            <ThemeToggle />
          </div>
          <Link
            href="/login"
            className="border-r border-foreground px-6 py-4 text-xs font-bold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:bg-foreground hover:text-background"
          >
            Log in
          </Link>
          <Button asChild size="sm" variant="default" className="h-14 rounded-none px-6 text-xs uppercase tracking-[0.18em]">
            <Link href="/login">
              Start
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="flex items-center border-l border-foreground md:hidden">
          <div className="px-3 py-3">
            <ThemeToggle />
          </div>
          <button
            onClick={() => setOpen(!open)}
            className="border-l border-foreground px-4 py-3"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Primary mobile" className="border-t border-foreground md:hidden">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "block border-b border-foreground px-6 py-4 text-xs font-bold uppercase tracking-[0.18em]",
                  active ? "bg-foreground text-background" : "text-muted-foreground",
                )}
              >
                {l.label}
              </Link>
            );
          })}
          <Link href="/login" onClick={() => setOpen(false)} className="block border-b border-foreground px-6 py-4 text-xs font-bold uppercase tracking-[0.18em]">
            Log in
          </Link>
          <div className="p-4">
            <Button asChild variant="default" className="w-full rounded-none uppercase tracking-[0.18em]">
              <Link href="/login">Start tracking</Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
