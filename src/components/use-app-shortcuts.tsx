"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyboardShortcutsDialog } from "./keyboard-shortcuts-dialog";

export function useAppShortcuts() {
  const router = useRouter();
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [pendingGo, setPendingGo] = useState(false);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.tagName === "INPUT" || target?.tagName === "TEXTAREA" || target?.isContentEditable;

      if (event.key === "?" && !typing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      if (event.key.toLowerCase() === "g" && !typing && !event.metaKey && !event.ctrlKey) {
        setPendingGo(true);
        return;
      }

      if (pendingGo && !typing) {
        const map: Record<string, string> = {
          w: "/app/watchlist",
          e: "/app/events",
          a: "/app/alerts",
          s: "/app/settings",
        };
        const href = map[event.key.toLowerCase()];
        if (href) {
          event.preventDefault();
          router.push(href);
        }
        setPendingGo(false);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pendingGo, router]);

  return { shortcutsOpen, setShortcutsOpen };
}

export function AppKeyboardShortcuts() {
  const { shortcutsOpen, setShortcutsOpen } = useAppShortcuts();
  return <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />;
}
