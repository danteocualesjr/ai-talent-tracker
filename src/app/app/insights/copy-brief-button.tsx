"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyBriefButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const [failed, setFailed] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setFailed(false);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
      setFailed(true);
      window.setTimeout(() => setFailed(false), 2500);
    }
  }

  const label = failed ? "Copy failed — try again" : copied ? "Copied to clipboard" : "Copy brief";

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={`gap-1.5 transition-colors ${copied ? "border-signal/40 bg-signal/5 text-signal" : ""} ${failed ? "border-destructive/40 bg-destructive/5 text-destructive" : ""}`}
      onClick={copy}
      aria-label={label}
    >
      {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      {label}
      <span className="sr-only" aria-live="polite">
        {failed ? "Could not copy insights brief" : copied ? "Insights brief copied" : ""}
      </span>
    </Button>
  );
}
