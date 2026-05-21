"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function OptOutForm() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch("/api/opt-out", { method: "POST", body: fd });
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
      <div className="rounded-xl border border-signal/20 bg-signal/5 p-5 text-sm leading-relaxed">
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
        <Input id="linkedin_url" name="linkedin_url" type="url" required placeholder="https://www.linkedin.com/in/..." />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Your email (for confirmation)</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Additional notes (optional)</Label>
        <Textarea id="notes" name="notes" rows={3} />
      </div>
      <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit request"}</Button>
    </form>
  );
}
