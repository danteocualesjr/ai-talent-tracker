"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQ_ITEMS = [
  {
    q: "How does profile monitoring work?",
    a: "We poll LinkedIn profiles on your plan's refresh cadence, hash-diff against historical snapshots, and classify meaningful changes — departures, stealth flips, founding signals, and more.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Paid plans can be cancelled from the billing portal. Your watchlist stays active until the end of the billing period, then reverts to the free tier.",
  },
  {
    q: "What alert channels are supported?",
    a: "Email and Slack webhooks on Pro and above. Team adds HMAC-signed webhooks for custom integrations. All plans include access to the public departure feed.",
  },
  {
    q: "Is this compliant with LinkedIn's terms?",
    a: "We use licensed data providers and never scrape LinkedIn directly from our infrastructure. Profiles can opt out via our DSAR flow at any time.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Annual billing with a discount is available on request for Team and Enterprise plans. Contact us at hello@aitalenttracker.com.",
  },
];

export function PricingFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="border-t border-border/60 bg-muted/20">
      <div className="container max-w-3xl py-14 md:py-20">
        <div className="text-center">
          <div className="label-caps">FAQ</div>
          <h2 className="mt-3 text-balance text-2xl font-bold tracking-tight md:text-3xl">
            Common questions
          </h2>
        </div>
        <div className="mt-10 divide-y divide-border/60 rounded-2xl border border-border/60 bg-card">
          {FAQ_ITEMS.map(({ q, a }, i) => {
            const isOpen = open === i;
            return (
              <div key={q}>
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="group flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/40 sm:px-6"
                >
                  <span className="text-sm font-semibold tracking-tight transition-colors group-hover:text-foreground">
                    {q}
                  </span>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200",
                      isOpen && "rotate-180 text-signal",
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-200 motion-safe:transition-[grid-template-rows,opacity]",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-4 text-sm leading-relaxed text-muted-foreground sm:px-6">
                      {a}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
