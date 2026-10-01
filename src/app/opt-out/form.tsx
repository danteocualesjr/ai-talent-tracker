"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const FIELD_ERRORS: Record<string, string> = {
  linkedin_url: "Enter a LinkedIn profile URL like https://www.linkedin.com/in/your-name.",
  email: "Enter a valid email address so we can confirm your request.",
};

export function OptOutForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/opt-out", { method: "POST", body: fd });
      if (res.status === 400) {
        const data = (await res.json().catch(() => null)) as { field?: string } | null;
        const message = data?.field ? FIELD_ERRORS[data.field] : undefined;
        if (message) {
          toast.error(message);
          return;
        }
      }
      if (!res.ok) throw new Error("submit failed");
      setSent(true);
      toast.success("Request received. We'll email you within 30 days.");
    } catch {
      toast.error("Failed to submit. Email privacy@aitalenttracker.com instead.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="animate-fade-up rounded-xl border border-signal/20 bg-signal/5 p-5 text-sm leading-relaxed"
      >
        <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-signal/10 text-signal">
          <Check className="h-4 w-4" aria-hidden />
        </div>
        Request received. We&apos;ll confirm via email shortly. If you don&apos;t hear back within 30 days, email{" "}
        <a className="link-subtle" href="mailto:privacy@aitalenttracker.com">
          privacy@aitalenttracker.com
        </a>
        .
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="space-y-2">
        <Label htmlFor="linkedin_url">LinkedIn URL</Label>
        <Input
          id="linkedin_url"
          name="linkedin_url"
          type="url"
          required
          placeholder="https://www.linkedin.com/in/..."
          disabled={loading}
          autoComplete="url"
          spellCheck={false}
          onKeyDown={(event) => {
            if (event.key === "Escape" && event.currentTarget.value) {
              event.preventDefault();
              event.currentTarget.value = "";
            }
          }}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Your email (for confirmation)</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          disabled={loading}
          autoComplete="email"
          onKeyDown={(event) => {
            if (event.key === "Escape" && event.currentTarget.value) {
              event.preventDefault();
              event.currentTarget.value = "";
            }
          }}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Additional notes (optional)</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          disabled={loading}
          onKeyDown={(event) => {
            if (event.key === "Escape" && event.currentTarget.value) {
              event.preventDefault();
              event.currentTarget.value = "";
            }
          }}
        />
      </div>
      <Button type="submit" disabled={loading} aria-busy={loading}>{loading ? "Submitting…" : "Submit request"}</Button>
    </form>
  );
}
