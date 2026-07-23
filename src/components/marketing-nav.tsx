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
  { href: "/feed", label: "FEED" },
  { href: "/labs", label: "LABS" },
  { href: "/pricing", label: "PRICING" },
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
    <header className="sticky top-0 z-30 border-b-4 border-foreground bg-signal">
      <div className="container flex h-16 items-stretch justify-between">
        <div className="flex items-center border-r-4 border-foreground pr-6">
          <Logo />
        </div>

        <nav aria-label="Primary" className="hidden items-stretch md:flex">
          {LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center border-r-4 border-foreground px-8 text-sm font-black tracking-wider transition-colors",
                  active ? "bg-foreground text-signal" : "bg-signal text-foreground hover:bg-foreground hover:text-signal",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-stretch md:flex">
          <div className="flex items-center border-l-4 border-foreground px-4">
            <ThemeToggle />
          </div>
          <Button asChild size="sm" variant="default" className="h-full rounded-none border-l-4 border-foreground px-8 font-black uppercase tracking-wider">
            <Link href="/login">
              START
              <ArrowRight className="h-4 w-4 stroke-[3]" />
            </Link>
          </Button>
        </div>

        <button onClick={() => setOpen(!open)} className="border-l-4 border-foreground px-4 md:hidden" aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <X className="h-6 w-6 stroke-[3]" /> : <Menu className="h-6 w-6 stroke-[3]" />}
        </button>
      </div>

      {open && (
        <nav aria-label="Primary mobile" className="border-t-4 border-foreground md:hidden">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block border-b-4 border-foreground px-6 py-4 font-black tracking-wider">
              {l.label}
            </Link>
          ))}
          <div className="p-4">
            <Button asChild variant="default" className="w-full rounded-none font-black uppercase">
              <Link href="/login">Start tracking</Link>
            </Button>
          </div>
        </nav>
      )}
    </header>
  );
}
