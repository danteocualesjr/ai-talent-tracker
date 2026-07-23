"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Menu, Terminal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/feed", label: "feed" },
  { href: "/labs", label: "labs" },
  { href: "/pricing", label: "pricing" },
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
    <header className="sticky top-0 z-30 border-b border-signal/30 bg-background/95 font-mono backdrop-blur-md">
      <div className="container flex h-12 items-center justify-between">
        <div className="flex items-center gap-3">
          <Terminal className="h-4 w-4 text-signal" />
          <Logo />
        </div>

        <nav aria-label="Primary" className="hidden items-center gap-1 md:flex">
          <span className="mr-2 text-xs text-signal">$</span>
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "rounded px-3 py-1.5 text-xs transition-colors",
                  active ? "bg-signal/15 text-signal" : "text-muted-foreground hover:text-signal",
                )}
              >
                ./{l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link href="/login" className="text-xs text-muted-foreground hover:text-signal">login</Link>
          <Button asChild size="sm" variant="signal" className="h-8 rounded font-mono text-xs">
            <Link href="/login">./start <ArrowRight className="h-3 w-3" /></Link>
          </Button>
        </div>

        <button onClick={() => setOpen(!open)} className="p-2 md:hidden" aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <X className="h-5 w-5 text-signal" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <nav aria-label="Primary mobile" className="border-t border-signal/20 px-4 py-3 font-mono text-xs md:hidden">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block py-2 text-signal">
              ./{l.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
