"use client";

import { useRef, useTransition } from "react";
import { FileSpreadsheet, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { importProfilesFromCsv } from "./actions";

export function ImportCsvForm() {
  const [pending, start] = useTransition();
  const ref = useRef<HTMLFormElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onSubmit(formData: FormData) {
    start(async () => {
      const res = await importProfilesFromCsv(formData);
      if ("error" in res) {
        toast.error(res.error);
      } else {
        const parts = [`${res.added} added`];
        if (res.skipped) parts.push(`${res.skipped} already tracked`);
        if (res.invalid) parts.push(`${res.invalid} invalid`);
        if (res.limitReached) parts.push("plan limit reached");
        toast.success(`Import complete — ${parts.join(", ")}.`);
        ref.current?.reset();
        if (fileRef.current) fileRef.current.value = "";
      }
    });
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const textarea = ref.current?.querySelector("textarea[name='csv_text']") as HTMLTextAreaElement | null;
      if (textarea) textarea.value = String(reader.result ?? "");
    };
    reader.readAsText(file);
  }

  return (
    <form ref={ref} action={onSubmit} className="space-y-4">
      <Textarea
        name="csv_text"
        placeholder={`Paste LinkedIn URLs — one per line or CSV with a linkedin_url column:\n\nhttps://www.linkedin.com/in/jane-researcher\nhttps://www.linkedin.com/in/john-engineer`}
        className="min-h-[140px] font-mono text-xs leading-relaxed"
        required
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground">
          <Upload className="h-3.5 w-3.5" />
          <span>Upload .csv file</span>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv,text/plain"
            className="sr-only"
            onChange={onFileChange}
          />
        </label>
        <Button type="submit" disabled={pending} aria-busy={pending} className="h-10 shrink-0 gap-2 px-5">
          <FileSpreadsheet className="h-4 w-4" />
          {pending ? "Importing..." : "Import roster"}
        </Button>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        Duplicates and profiles already on your watchlist are skipped. Refreshes queue immediately for each new profile.
      </p>
    </form>
  );
}
