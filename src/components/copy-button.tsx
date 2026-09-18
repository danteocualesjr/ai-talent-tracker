"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

export function CopyButton({ value, className }: { value: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setFailed(false);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setFailed(true);
      setTimeout(() => setFailed(false), 2000);
    }
  }

  const label = failed ? "Copy failed" : copied ? "Copied" : "Copy to clipboard";

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background px-2 py-1 text-[10px] font-medium text-muted-foreground shadow-sm transition-all hover:border-signal/30 hover:bg-signal/5 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal/40",
        copied && "border-signal/30 bg-signal/5 text-signal motion-safe:scale-[1.02] motion-safe:duration-300",
        failed && "border-destructive/40 bg-destructive/5 text-destructive",
        className,
      )}
      aria-label={label}
    >
      {copied ? <Check className="h-3 w-3 motion-safe:scale-110" aria-hidden /> : <Copy className="h-3 w-3" aria-hidden />}
      {failed ? "Failed" : copied ? "Copied" : "Copy"}
      <span className="sr-only" aria-live="polite">
        {failed ? "Could not copy to clipboard" : copied ? "Copied to clipboard" : ""}
      </span>
    </button>
  );
}
