"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Kbd } from "@/components/ui/kbd";

const SHORTCUTS = [
  { keys: ["⌘", "K"], description: "Open command menu" },
  { keys: ["?"], description: "Show keyboard shortcuts" },
  { keys: ["G", "W"], description: "Go to watchlist" },
  { keys: ["G", "E"], description: "Go to events" },
  { keys: ["G", "A"], description: "Go to alerts" },
  { keys: ["G", "S"], description: "Go to settings" },
];

export function KeyboardShortcutsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogTitle>Keyboard shortcuts</DialogTitle>
        <ul className="mt-4 space-y-3">
          {SHORTCUTS.map(({ keys, description }) => (
            <li key={description} className="flex items-center justify-between gap-4 text-sm">
              <span className="text-muted-foreground">{description}</span>
              <span className="inline-flex items-center gap-1">
                {keys.map((key) => (
                  <Kbd key={key}>{key}</Kbd>
                ))}
              </span>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
