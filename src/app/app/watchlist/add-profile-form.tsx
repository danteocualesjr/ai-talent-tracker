"use client";

import { useRef, useTransition } from "react";
import { Link2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addProfile } from "./actions";

export function AddProfileForm() {
  const [pending, start] = useTransition();
  const ref = useRef<HTMLFormElement>(null);

  function onSubmit(formData: FormData) {
    start(async () => {
      const res = await addProfile(formData);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Profile added — first refresh queued.");
        ref.current?.reset();
      }
    });
  }

  return (
    <form ref={ref} action={onSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          name="linkedin_url"
          type="url"
          required
          aria-label="LinkedIn profile URL"
          placeholder="https://www.linkedin.com/in/jane-researcher"
          autoComplete="off"
          className="h-11 pl-10"
        />
      </div>
      <Button type="submit" disabled={pending} aria-busy={pending} className="h-11 shrink-0 px-6">
        {pending ? "Adding..." : "Track profile"}
      </Button>
    </form>
  );
}
