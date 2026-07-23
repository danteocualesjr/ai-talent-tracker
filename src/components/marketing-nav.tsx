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
    <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "font-serif text-base italic transition-colors",
                  active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <ThemeToggle />
          <Link href="/login" className="font-serif text-base italic text-muted-foreground hover:text-foreground">
            Log in
          </Link>
          <Button asChild size="sm" variant="signal" className="rounded-sm font-serif italic">
            <Link href="/login">
              Start tracking
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button onClick={() => setOpen(!open)} className="p-2" aria-label={open ? "Close menu" : "Open menu"}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Primary mobile" className="border-t border-border/80 px-6 py-4 md:hidden">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-3 font-serif text-lg italic">
              {l.label}
            </Link>
          ))}
          <Button asChild variant="signal" className="mt-4 w-full rounded-sm font-serif italic">
            <Link href="/login">Start tracking</Link>
          </Button>
        </nav>
      )}
    </header>
  );
}
