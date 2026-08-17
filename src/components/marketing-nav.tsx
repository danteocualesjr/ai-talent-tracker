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
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 w-full motion-safe:transition-all motion-safe:duration-300",
        scrolled
          ? "border-b border-border/80 bg-background/88 shadow-[0_1px_0_0_hsl(var(--border)/0.6)] backdrop-blur-xl"
          : "border-b border-border/50 bg-background/40 backdrop-blur-sm",
      )}
    >
      <div className="container flex h-[64px] items-center justify-between">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-0.5 md:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-md px-3.5 py-1.5 text-sm font-medium transition-all",
                  active
                    ? "text-foreground after:absolute after:inset-x-3 after:-bottom-[15px] after:h-0.5 after:bg-signal"
                    : "text-muted-foreground hover:bg-accent/80 hover:text-foreground",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2.5 md:flex">
          <ThemeToggle />
          <Link href="/login" className="rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Log in
          </Link>
          <Button asChild size="sm" variant="signal" className="group">
            <Link href="/login">
              Start tracking
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button onClick={() => setOpen(!open)} className="rounded-md p-2.5 text-muted-foreground hover:bg-accent" aria-label={open ? "Close menu" : "Open menu"}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <>
          <button aria-label="Close menu" className="fixed inset-0 z-20 bg-foreground/20 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)} />
          <nav aria-label="Primary mobile" className="relative z-30 border-t border-border/70 bg-background/96 px-6 py-4 backdrop-blur-xl md:hidden">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block rounded-md px-4 py-3 font-medium hover:bg-accent">
                {l.label}
              </Link>
            ))}
            <Button asChild variant="signal" className="mt-3 w-full">
              <Link href="/login">Start tracking</Link>
            </Button>
          </nav>
        </>
      )}
    </header>
  );
}
