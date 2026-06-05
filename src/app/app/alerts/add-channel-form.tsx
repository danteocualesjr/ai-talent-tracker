"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addChannel } from "./actions";
import type { ChannelType } from "@/types/db";

export function AddChannelForm({
  type,
  submitLabel,
  children,
}: {
  type: ChannelType;
  submitLabel: string;
  children: React.ReactNode;
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
      {children}
      <Button type="submit" className="w-full" size="sm" disabled={pending}>
        {pending ? "Adding..." : submitLabel}
      </Button>
    </form>
  );
}

export function EmailChannelFields() {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="to" className="text-xs font-semibold">
        Email
      </Label>
      <Input id="to" name="to" type="email" required placeholder="alerts@you.com" />
    </div>
  );
}

export function SlackChannelFields() {
  return (
    <div className="space-y-1.5">
      <Label htmlFor="webhook_url" className="text-xs font-semibold">
        Webhook URL
      </Label>
      <Input id="webhook_url" name="webhook_url" type="url" required placeholder="https://hooks.slack.com/..." />
    </div>
  );
}

export function WebhookChannelFields() {
  return (
    <>
      <div className="space-y-1.5">
        <Label htmlFor="url" className="text-xs font-semibold">
          URL
        </Label>
        <Input id="url" name="url" type="url" required placeholder="https://api.you.com/events" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="secret" className="text-xs font-semibold">
          Secret (optional)
        </Label>
        <Input id="secret" name="secret" type="text" placeholder="signing secret" />
      </div>
    </>
  );
}
