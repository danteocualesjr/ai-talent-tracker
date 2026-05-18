"use client";

import { useRef, useTransition } from "react";
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
    <form ref={ref} action={onSubmit} className="flex gap-2">
      <Input
        name="linkedin_url"
        type="url"
        required
        placeholder="https://www.linkedin.com/in/jane-researcher"
        autoComplete="off"
      />
      <Button type="submit" disabled={pending}>{pending ? "Adding..." : "Track"}</Button>
    </form>
  );
}
