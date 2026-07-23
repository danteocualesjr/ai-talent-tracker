"use client";

import Link from "next/link";
import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addChannel } from "./actions";
import type { ChannelType } from "@/types/db";

type Field = { id: string; name: string; label: string; type: string; placeholder: string; required?: boolean };

const FIELDS: Record<ChannelType, Field[]> = {
  email: [{ id: "to", name: "to", label: "Email", type: "email", placeholder: "alerts@you.com", required: true }],
  slack: [
    {
      id: "webhook_url",
      name: "webhook_url",
      label: "Webhook URL",
      type: "url",
      placeholder: "https://hooks.slack.com/...",
      required: true,
    },
  ],
  webhook: [
    { id: "url", name: "url", label: "URL", type: "url", placeholder: "https://api.you.com/events", required: true },
    { id: "secret", name: "secret", label: "Secret (optional)", type: "text", placeholder: "signing secret" },
  ],
};

const LABELS: Record<ChannelType, string> = {
  email: "Add email",
  slack: "Add Slack",
  webhook: "Add webhook",
};

export function AddChannelForm({
  type,
  disabled = false,
  lockedMessage,
}: {
  type: ChannelType;
  disabled?: boolean;
  lockedMessage?: string;
}) {
  const [pending, start] = useTransition();
  const ref = useRef<HTMLFormElement>(null);

  function onSubmit(formData: FormData) {
    start(async () => {
      const res = await addChannel(formData);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Channel added.");
        ref.current?.reset();
      }
    });
  }

  return (
    <form ref={ref} action={onSubmit} className="space-y-3">
      <input type="hidden" name="type" value={type} />
      {lockedMessage && (
        <p className="rounded-lg border border-border/60 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          {lockedMessage}{" "}
          <Link href="/pricing" className="font-medium text-foreground underline underline-offset-2">
            View plans
          </Link>
        </p>
      )}
      {FIELDS[type].map((field) => (
        <div key={field.name} className="space-y-1.5">
          <Label htmlFor={`${type}-${field.id}`} className="text-xs font-semibold">
            {field.label}
          </Label>
          <Input
            id={`${type}-${field.id}`}
            name={field.name}
            type={field.type}
            required={field.required}
            placeholder={field.placeholder}
            disabled={disabled}
          />
        </div>
      ))}
      <Button type="submit" className="w-full" size="sm" disabled={pending || disabled} aria-busy={pending}>
        {pending ? "Adding…" : LABELS[type]}
      </Button>
    </form>
  );
}
