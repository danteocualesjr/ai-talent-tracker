"use client";

import { useRef, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateWorkspaceName } from "./actions";

export function WorkspaceNameForm({ currentName }: { currentName: string }) {
  const [pending, start] = useTransition();
  const ref = useRef<HTMLFormElement>(null);

  function onSubmit(formData: FormData) {
    start(async () => {
      const res = await updateWorkspaceName(formData);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        toast.success("Workspace name updated.");
      }
    });
  }

  return (
    <form ref={ref} action={onSubmit} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-end">
      <div className="min-w-0 flex-1 space-y-1.5">
        <Label htmlFor="workspace-name" className="text-xs font-semibold">
          Workspace name
        </Label>
        <Input
          id="workspace-name"
          name="name"
          defaultValue={currentName}
          required
          maxLength={80}
          minLength={2}
          autoComplete="organization"
          spellCheck={false}
          placeholder="My workspace"
          disabled={pending}
          aria-describedby="workspace-name-hint"
        />
        <p id="workspace-name-hint" className="text-[11px] text-muted-foreground">
          Shown in the sidebar and on shared alert messages. 2–80 characters.
        </p>
      </div>
      <Button type="submit" size="sm" disabled={pending} aria-busy={pending}>
        {pending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
