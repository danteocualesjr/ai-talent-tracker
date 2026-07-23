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
    const onScroll = () => setScrolled(window.scrollY > 24);
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
    <header className="sticky top-0 z-30 w-full px-4 pt-4 md:px-6">
      <div
        className={cn(
          "mx-auto flex max-w-5xl items-center justify-between rounded-2xl border px-4 py-2.5 motion-safe:transition-all motion-safe:duration-300 md:px-5",
          scrolled
            ? "border-border/70 bg-background/80 shadow-[0_8px_32px_-12px_hsl(var(--foreground)/0.12)] backdrop-blur-2xl"
            : "border-border/40 bg-background/50 backdrop-blur-xl",
        )}
      >
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
                  "rounded-xl px-4 py-2 text-sm font-medium transition-all",
                  active
                    ? "bg-signal/10 text-foreground shadow-[inset_0_0_0_1px_hsl(var(--signal)/0.2)]"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <ThemeToggle />
          <Link
            href="/login"
            className="rounded-xl px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Log in
          </Link>
          <Button asChild size="sm" variant="signal" className="rounded-xl group">
            <Link href="/login">
              Start tracking
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            onClick={() => setOpen(!open)}
            className="rounded-xl p-2 text-muted-foreground transition-colors hover:bg-accent"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-20 bg-foreground/25 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <div
        className={cn(
          "relative z-30 mx-auto mt-2 max-w-5xl overflow-hidden rounded-2xl border border-border/60 bg-background/95 backdrop-blur-2xl md:hidden motion-safe:transition-all",
          open ? "visible max-h-[420px] opacity-100" : "invisible max-h-0 opacity-0",
        )}
      >
        <nav aria-label="Primary mobile" className="flex flex-col gap-1 p-4 text-sm">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-4 py-3 font-medium transition-colors",
                  active ? "bg-signal/10 text-foreground" : "text-muted-foreground hover:bg-accent",
                )}
              >
                {l.label}
              </Link>
            );
          })}
          <Link href="/login" onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 text-muted-foreground hover:bg-accent">
            Log in
          </Link>
          <Button asChild variant="signal" className="mt-2 rounded-xl">
            <Link href="/login">Start tracking</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
