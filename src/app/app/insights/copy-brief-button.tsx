"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyBriefButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <Button type="button" variant="outline" size="sm" className="gap-1.5" onClick={copy}>
      {copied ? <Check className="h-3.5 w-3.5 text-signal" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy brief"}
    </Button>
  );
}
