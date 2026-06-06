#!/usr/bin/env node
/**
 * Applies queued micro UI polish patches, then commits and pushes each one.
 * Usage: node scripts/ui-polish-loop.mjs [--from N] [--to N]
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** @type {{ file: string, find: string, replace: string, message: string }[]} */
const PATCHES = [
  {
    file: "src/components/marketing-nav.tsx",
    find: '          aria-label="Toggle menu"',
    replace: '          aria-label={open ? "Close menu" : "Open menu"}\n          aria-expanded={open}',
    message: "Expose mobile menu expanded state to assistive tech.",
  },
  {
    file: "src/components/marketing-nav.tsx",
    find: `              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "relative rounded-lg px-3.5 py-2 transition-colors",`,
    replace: `              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative rounded-lg px-3.5 py-2 transition-colors",`,
    message: "Mark active marketing nav link for screen readers.",
  },
  {
    file: "src/components/marketing-nav.tsx",
    find: `              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 transition-colors",`,
    replace: `              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-lg px-3 py-2.5 transition-colors",`,
    message: "Mark active mobile marketing nav link for screen readers.",
  },
  {
    file: "src/components/app-sidebar.tsx",
    find: '            aria-label="Toggle menu"',
    replace: '            aria-label={open ? "Close menu" : "Open menu"}\n            aria-expanded={open}',
    message: "Expose app sidebar menu expanded state to assistive tech.",
  },
  {
    file: "src/components/app-topbar.tsx",
    find: '                <span className="truncate font-semibold text-foreground">{label}</span>',
    replace: '                <span className="truncate font-semibold text-foreground" aria-current="page">{label}</span>',
    message: "Mark breadcrumb current page for screen readers.",
  },
  {
    file: "src/components/event-row.tsx",
    find: '        className="inline-flex shrink-0 items-center gap-1 self-center rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground opacity-0 shadow-sm transition-all hover:border-foreground/20 hover:text-foreground group-hover:opacity-100 focus:opacity-100"',
    replace: '        aria-label={`Open ${profile.full_name || profile.linkedin_handle} on LinkedIn`}\n        className="inline-flex shrink-0 items-center gap-1 self-center rounded-lg border border-border/60 bg-background px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground opacity-0 shadow-sm transition-all hover:border-foreground/20 hover:text-foreground group-hover:opacity-100 focus:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/40"',
    message: "Improve LinkedIn action link accessibility and focus ring.",
  },
  {
    file: "src/components/panel.tsx",
    find: '    <div className="relative flex flex-col items-center gap-3 px-6 py-16 text-center">',
    replace: '    <div role="status" className="relative flex flex-col items-center gap-3 px-6 py-16 text-center">',
    message: "Announce empty panel state to screen readers.",
  },
  {
    file: "src/components/page-header.tsx",
    replace: '          <h1 id="page-title" className="text-balance text-[28px] font-bold leading-tight tracking-tight md:text-[32px]">',
    find: '          <h1 className="text-balance text-[28px] font-bold leading-tight tracking-tight md:text-[32px]">',
    message: "Add stable page title id for skip links and landmarks.",
  },
  {
    file: "src/app/app/page.tsx",
    find: '          <div className="progress-track mt-2">',
    replace: '          <div\n            className="progress-track mt-2"\n            role="progressbar"\n            aria-valuemin={0}\n            aria-valuemax={org.profile_limit}\n            aria-valuenow={profiles.length}\n            aria-label="Watchlist capacity"\n          >',
    message: "Expose watchlist capacity bar as a progressbar.",
  },
  {
    file: "src/components/theme-toggle.tsx",
    find: '      aria-label="Toggle theme"',
    replace: '      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}\n      aria-pressed={isDark}',
    message: "Clarify theme toggle state for screen readers.",
  },
  {
    file: "src/components/back-link.tsx",
    find: '        "inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/80 hover:text-foreground",',
    replace: '        "inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",',
    message: "Add focus ring to back navigation link.",
  },
  {
    file: "src/components/marketing-footer.tsx",
    find: '    <footer className="relative border-t bg-card/40">',
    replace: '    <footer aria-label="Site footer" className="relative border-t bg-card/40">',
    message: "Label marketing footer landmark for screen readers.",
  },
  {
    file: "src/app/not-found.tsx",
    find: '      <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-20">',
    replace: '      <main aria-labelledby="not-found-title" className="relative flex flex-1 flex-col items-center justify-center overflow-hidden px-6 py-20">',
    message: "Associate 404 main region with its heading.",
  },
  {
    file: "src/app/not-found.tsx",
    find: '          <h1 className="mt-4 font-serif text-7xl font-normal italic tracking-tight text-foreground md:text-8xl">',
    replace: '          <h1 id="not-found-title" className="mt-4 font-serif text-7xl font-normal italic tracking-tight text-foreground md:text-8xl">',
    message: "Add id to 404 heading for aria-labelledby.",
  },
  {
    file: "src/app/globals.css",
    find: `  .animate-pulse-dot {
    animation: pulse-dot 2s ease-in-out infinite;
  }`,
    replace: `  @media (prefers-reduced-motion: no-preference) {
    .animate-pulse-dot {
      animation: pulse-dot 2s ease-in-out infinite;
    }
  }`,
    message: "Respect reduced-motion for live status pulse animation.",
  },
  {
    file: "src/app/globals.css",
    find: `  .animate-marquee {
    animation: marquee 45s linear infinite;
  }`,
    replace: `  @media (prefers-reduced-motion: no-preference) {
    .animate-marquee {
      animation: marquee 45s linear infinite;
    }
  }`,
    message: "Respect reduced-motion for horizontal marquee.",
  },
  {
    file: "src/app/globals.css",
    find: `  .animate-marquee-vertical {
    animation: marquee-vertical 28s linear infinite;
  }`,
    replace: `  @media (prefers-reduced-motion: no-preference) {
    .animate-marquee-vertical {
      animation: marquee-vertical 28s linear infinite;
    }
  }`,
    message: "Respect reduced-motion for vertical marquee.",
  },
  {
    file: "src/app/globals.css",
    find: `  .signal-pulse {
    box-shadow: 0 0 0 0 hsl(var(--signal) / 0.45);
    animation: signal-pulse 2.4s ease-out infinite;
  }`,
    replace: `  @media (prefers-reduced-motion: no-preference) {
    .signal-pulse {
      box-shadow: 0 0 0 0 hsl(var(--signal) / 0.45);
      animation: signal-pulse 2.4s ease-out infinite;
    }
  }`,
    message: "Respect reduced-motion for signal pulse accent.",
  },
  {
    file: "src/app/globals.css",
    find: `  .animate-shimmer {
    background: linear-gradient(
      90deg,
      transparent 0%,
      hsl(var(--foreground) / 0.06) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: shimmer 2.4s linear infinite;
  }`,
    replace: `  @media (prefers-reduced-motion: no-preference) {
    .animate-shimmer {
      background: linear-gradient(
        90deg,
        transparent 0%,
        hsl(var(--foreground) / 0.06) 50%,
        transparent 100%
      );
      background-size: 200% 100%;
      animation: shimmer 2.4s linear infinite;
    }
  }`,
    message: "Respect reduced-motion for shimmer loading effect.",
  },
  {
    file: "src/components/marketing-nav.tsx",
    find: '          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent md:hidden"',
    replace: '          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 md:hidden"',
    message: "Add focus ring to marketing mobile menu button.",
  },
  {
    file: "src/components/app-sidebar.tsx",
    find: '            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent"',
    replace: '            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"',
    message: "Add focus ring to app mobile menu button.",
  },
  {
    file: "src/components/app-sidebar.tsx",
    find: '            className="rounded-lg p-1 text-muted-foreground hover:bg-accent md:hidden"',
    replace: '            className="rounded-lg p-1 text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 md:hidden"',
    message: "Add focus ring to sidebar close button.",
  },
  {
    file: "src/components/app-topbar.tsx",
    find: '          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-card/60 text-muted-foreground shadow-sm transition-colors hover:border-foreground/15 hover:bg-card hover:text-foreground"',
    replace: '          className="relative inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-card/60 text-muted-foreground shadow-sm transition-colors hover:border-foreground/15 hover:bg-card hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"',
    message: "Add focus ring to notifications button.",
  },
  {
    file: "src/components/app-topbar.tsx",
    find: '              className="ml-1 inline-flex h-9 items-center gap-2 rounded-lg border border-border/70 bg-card/60 pl-1.5 pr-2.5 text-sm shadow-sm transition-colors hover:border-foreground/15 hover:bg-card"',
    replace: '              className="ml-1 inline-flex h-9 items-center gap-2 rounded-lg border border-border/70 bg-card/60 pl-1.5 pr-2.5 text-sm shadow-sm transition-colors hover:border-foreground/15 hover:bg-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"',
    message: "Add focus ring to user menu trigger.",
  },
  {
    file: "src/components/marketing-footer.tsx",
    find: '                      className="group inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"',
    replace: '                      className="group inline-flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-sm"',
    message: "Add focus ring to footer navigation links.",
  },
  {
    file: "src/components/marketing-nav.tsx",
    find: '            className="rounded-lg px-3.5 py-2 text-muted-foreground transition-colors hover:bg-accent/80 hover:text-foreground"',
    replace: '            className="rounded-lg px-3.5 py-2 text-muted-foreground transition-colors hover:bg-accent/80 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"',
    message: "Add focus ring to marketing log in link.",
  },
  {
    file: "src/app/app/page.tsx",
    find: '    <div className="surface-card surface-card-hover relative overflow-hidden p-5">',
    replace: '    <div className="surface-card surface-card-hover relative overflow-hidden p-5 motion-safe:transition-shadow">',
    message: "Soften stat card hover transition for reduced-motion users.",
  },
  {
    file: "src/components/panel.tsx",
    find: '            {title && <div className="text-sm font-bold leading-tight">{title}</div>}',
    replace: '            {title && <div className="text-sm font-bold leading-tight tracking-tight">{title}</div>}',
    message: "Tighten panel title letter-spacing for hierarchy.",
  },
  {
    file: "src/components/page-header.tsx",
    replace: '        {description && (\n          <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground md:text-[15px]">',
    find: '        {description && (\n          <p className="mt-2 max-w-2xl text-pretty text-sm leading-relaxed text-muted-foreground">',
    message: "Slightly increase page header description size on desktop.",
  },
  {
    file: "src/components/event-row.tsx",
    find: '    <div className="group relative flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/40">',
    replace: '    <div className="group relative flex items-start gap-4 px-5 py-4 transition-colors hover:bg-muted/40 focus-within:bg-muted/30">',
    message: "Highlight event row when child controls receive focus.",
  },
  {
    file: "src/components/app-topbar.tsx",
    find: '          aria-label="Search"',
    replace: '          aria-keyshortcuts="Meta+K"\n          aria-label="Search"',
    message: "Expose search keyboard shortcut to assistive tech.",
  },
  {
    file: "src/components/app-topbar.tsx",
    find: '          aria-label="Notifications"',
    replace: '          aria-label={unreadCount > 0 ? `${unreadCount} unread notifications` : "Notifications"}',
    message: "Announce unread notification count in button label.",
  },
  {
    file: "src/components/logo.tsx",
    find: '        "group inline-flex items-center gap-2.5 font-semibold tracking-tight text-foreground",',
    replace: '        "group inline-flex items-center gap-2.5 font-semibold tracking-tight text-foreground rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",',
    message: "Add focus ring to logo home link.",
  },
  {
    file: "src/components/ui/input.tsx",
    find: '        "placeholder:text-muted-foreground/70",',
    replace: '        "placeholder:text-muted-foreground/60",',
    message: "Soften input placeholder contrast for calmer form fields.",
  },
  {
    file: "src/components/ui/textarea.tsx",
    find: '      "flex min-h-[100px] w-full rounded-lg border border-border/80 bg-background px-3.5 py-3 text-sm shadow-sm transition-all duration-200 placeholder:text-muted-foreground/70 hover:border-foreground/20 focus-visible:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",',
    replace: '      "flex min-h-[100px] w-full rounded-lg border border-border/80 bg-background px-3.5 py-3 text-sm shadow-sm transition-all duration-200 placeholder:text-muted-foreground/60 hover:border-foreground/20 focus-visible:border-foreground/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",',
    message: "Soften textarea placeholder contrast to match inputs.",
  },
  {
    file: "src/components/ui/card.tsx",
    find: '        "rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm",',
    replace: '        "rounded-xl border border-border/80 bg-card text-card-foreground shadow-sm transition-shadow duration-200",',
    message: "Add subtle shadow transition to card surfaces.",
  },
  {
    file: "src/components/ui/badge.tsx",
    find: '  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold leading-none transition-colors focus:outline-none focus:ring-2 focus:ring-ring",',
    replace: '  "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold leading-none transition-colors focus:outline-none focus:ring-2 focus:ring-ring/50",',
    message: "Soften badge focus ring for less visual noise.",
  },
  {
    file: "src/app/globals.css",
    find: `  .surface-card-hover {
    @apply transition-all duration-300;
  }
  .surface-card-hover:hover {
    transform: translateY(-1px);
    border-color: hsl(var(--foreground) / 0.14);
    box-shadow:
      0 1px 0 0 hsl(var(--background) / 0.6) inset,
      0 2px 4px hsl(var(--foreground) / 0.04),
      0 16px 36px -16px hsl(var(--foreground) / 0.14);
  }`,
    replace: `  .surface-card-hover {
    @apply transition-all duration-300;
  }
  @media (prefers-reduced-motion: no-preference) {
    .surface-card-hover:hover {
      transform: translateY(-1px);
    }
  }
  .surface-card-hover:hover {
    border-color: hsl(var(--foreground) / 0.14);
    box-shadow:
      0 1px 0 0 hsl(var(--background) / 0.6) inset,
      0 2px 4px hsl(var(--foreground) / 0.04),
      0 16px 36px -16px hsl(var(--foreground) / 0.14);
  }`,
    message: "Disable stat card lift animation for reduced-motion.",
  },
  {
    file: "src/app/globals.css",
    find: `  .hover-lift {
    @apply transition-all duration-300;
  }
  .hover-lift:hover {
    transform: translateY(-2px);
    box-shadow:
      0 0 0 1px hsl(var(--border) / 0.8),
      0 8px 24px -8px hsl(var(--foreground) / 0.12);
  }`,
    replace: `  .hover-lift {
    @apply transition-all duration-300;
  }
  @media (prefers-reduced-motion: no-preference) {
    .hover-lift:hover {
      transform: translateY(-2px);
    }
  }
  .hover-lift:hover {
    box-shadow:
      0 0 0 1px hsl(var(--border) / 0.8),
      0 8px 24px -8px hsl(var(--foreground) / 0.12);
  }`,
    message: "Disable hover-lift transform for reduced-motion users.",
  },
  {
    file: "src/components/marketing-nav.tsx",
    find: '        <nav className="hidden items-center gap-1 text-sm md:flex">',
    replace: '        <nav aria-label="Primary" className="hidden items-center gap-1 text-sm md:flex">',
    message: "Label desktop marketing navigation landmark.",
  },
  {
    file: "src/components/marketing-nav.tsx",
    find: '        <nav className="container flex flex-col gap-1 py-4 text-sm">',
    replace: '        <nav aria-label="Primary mobile" className="container flex flex-col gap-1 py-4 text-sm">',
    message: "Label mobile marketing navigation landmark.",
  },
  {
    file: "src/components/app-sidebar.tsx",
    find: '        <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4 text-sm">',
    replace: '        <nav aria-label="App" className="flex-1 space-y-5 overflow-y-auto px-3 pb-4 text-sm">',
    message: "Label app sidebar navigation landmark.",
  },
  {
    file: "src/components/app-topbar.tsx",
    find: '      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">',
    replace: '      <nav aria-label="Breadcrumb" className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">',
    message: "Let breadcrumbs consume available topbar space.",
  },
  {
    file: "src/components/panel.tsx",
    find: '        <div className="flex items-center justify-between gap-4 border-b border-border/60 px-5 py-4">',
    replace: '        <div className="flex items-center justify-between gap-4 border-b border-border/60 px-5 py-4 sm:px-6">',
    message: "Increase panel header horizontal padding on larger screens.",
  },
  {
    file: "src/components/panel.tsx",
    find: '    <div role="status" className="relative flex flex-col items-center gap-3 px-6 py-16 text-center">',
    replace: '    <div role="status" className="relative flex flex-col items-center gap-3 px-6 py-16 text-center sm:py-20">',
    message: "Add breathing room to empty panel on larger screens.",
  },
  {
    file: "src/app/app/page.tsx",
    find: '    <div className="container max-w-6xl space-y-8 px-4 py-8 md:px-6 md:py-10">',
    replace: '    <div className="container max-w-6xl space-y-8 px-4 py-8 md:px-6 md:py-10 lg:space-y-10">',
    message: "Increase dashboard vertical rhythm on large screens.",
  },
  {
    file: "src/app/app/page.tsx",
    find: '      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">',
    replace: '      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">',
    message: "Tighten stat card grid gap on small screens.",
  },
  {
    file: "src/components/event-row.tsx",
    find: '        <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground">',
    replace: '        <p className="mt-1.5 text-pretty text-sm leading-relaxed text-muted-foreground line-clamp-3">',
    message: "Clamp long event summaries to three lines in lists.",
  },
  {
    file: "src/components/event-row.tsx",
    find: '          <p className="mt-1 truncate text-xs text-muted-foreground/60">{profile.headline}</p>',
    replace: '          <p className="mt-1 truncate text-xs text-muted-foreground/70">{profile.headline}</p>',
    message: "Slightly improve headline contrast in event rows.",
  },
  {
    file: "src/components/marketing-footer.tsx",
    find: '          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">',
    replace: '          <p className="mt-4 max-w-xs text-pretty text-sm leading-relaxed text-muted-foreground">',
    message: "Improve footer tagline wrapping with text-pretty.",
  },
  {
    file: "src/components/marketing-footer.tsx",
    find: '              <ul className="mt-4 space-y-3 text-sm">',
    replace: '              <ul className="mt-4 space-y-2.5 text-sm">',
    message: "Tighten footer link vertical spacing slightly.",
  },
  {
    file: "src/components/ui/kbd.tsx",
    find: '  return <span className={cn("kbd", className)}>{children}</span>;',
    replace: '  return <span className={cn("kbd select-none", className)}>{children}</span>;',
    message: "Prevent accidental selection of keyboard hint chips.",
  },
  {
    file: "src/components/ui/separator.tsx",
    find: '        "shrink-0 bg-border",',
    replace: '        "shrink-0 bg-border/80",',
    message: "Soften separator contrast for subtler dividers.",
  },
  {
    file: "src/components/ui/avatar.tsx",
    find: '    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)}',
    replace: '    className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted", className)}',
    message: "Add muted fallback background behind avatars.",
  },
  {
    file: "src/components/ui/dialog.tsx",
    find: '        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",',
    replace: '        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border/60 bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-xl sm:p-7",',
    message: "Increase dialog padding and radius on larger breakpoints.",
  },
  {
    file: "src/components/ui/tabs.tsx",
    find: 'className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground", className)}',
    replace: 'className={cn("inline-flex h-9 items-center justify-center rounded-lg bg-muted/80 p-1 text-muted-foreground", className)}',
    message: "Soften tabs list background for lighter chrome.",
  },
  {
    file: "src/components/ui/switch.tsx",
    find: '      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",',
    replace: '      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",',
    message: "Soften switch focus ring to match other controls.",
  },
  {
    file: "src/components/ui/label.tsx",
    find: '  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"',
    replace: '  "text-sm font-medium leading-none text-foreground/90 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"',
    message: "Improve form label contrast slightly.",
  },
  {
    file: "src/components/ui/dropdown-menu.tsx",
    find: '        "z-50 min-w-[10rem] overflow-hidden rounded-xl border border-border/70 bg-popover p-1 text-popover-foreground shadow-pop",',
    replace: '        "z-50 min-w-[10rem] overflow-hidden rounded-xl border border-border/70 bg-popover/95 p-1 text-popover-foreground shadow-pop backdrop-blur-sm",',
    message: "Add glass effect to dropdown menus.",
  },
  {
    file: "src/components/app-sidebar.tsx",
    find: '                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",',
    replace: '                        : "text-muted-foreground hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",',
    message: "Add focus ring to inactive sidebar nav links.",
  },
  {
    file: "src/components/app-sidebar.tsx",
    find: '              className="group flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-foreground/15 hover:text-foreground"',
    replace: '              className="group flex items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-xs text-muted-foreground transition-colors hover:border-foreground/15 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"',
    message: "Add focus ring to public feed sidebar link.",
  },
  {
    file: "src/components/live-ticker.tsx",
    find: '    <div className="relative">',
    replace: '    <div aria-live="polite" aria-atomic="true" className="relative">',
    message: "Announce live ticker updates politely to screen readers.",
  },
  {
    file: "src/components/sparkline.tsx",
    find: '      className={cn("overflow-visible", className)}\n      aria-hidden',
    replace: '      className={cn("overflow-visible", className)}\n      aria-hidden="true"\n      focusable="false"',
    message: "Keep decorative sparklines out of tab order.",
  },
  {
    file: "src/components/logo-marquee.tsx",
    find: '      className="marquee-pause relative overflow-hidden"',
    replace: '      aria-hidden="true"\n      className="marquee-pause relative overflow-hidden"',
    message: "Hide decorative logo marquee from accessibility tree.",
  },
  {
    file: "src/components/dashboard-preview.tsx",
    find: '    <div className="preview-tilt preview-glow overflow-hidden rounded-2xl border border-border/80 bg-card">',
    replace: '    <div aria-hidden="true" className="preview-tilt preview-glow overflow-hidden rounded-2xl border border-border/80 bg-card">',
    message: "Mark marketing dashboard preview as decorative.",
  },
  {
    file: "src/components/marketing-hero.tsx",
    find: '              <div className="mt-4 text-pretty text-muted-foreground md:text-lg">{description}</div>',
    replace: '              <div className="mt-4 max-w-2xl text-pretty text-muted-foreground md:text-lg">{description}</div>',
    message: "Widen hero subcopy on medium screens for readability.",
  },
  {
    file: "src/components/marketing-hero.tsx",
    find: '      <div className="container relative py-14 md:py-20">',
    replace: '      <div className="container relative py-12 md:py-20">',
    message: "Tighten hero vertical padding on mobile.",
  },
  {
    file: "src/app/login/login-form.tsx",
    find: '      <Button type="submit" className="w-full" disabled={loading || !email}>',
    replace: '      <Button type="submit" className="w-full" disabled={loading || !email} aria-busy={loading}>',
    message: "Expose login submit loading state to assistive tech.",
  },
  {
    file: "src/app/app/watchlist/add-profile-form.tsx",
    find: '      <Button type="submit" disabled={pending} className="h-11 shrink-0 px-6">',
    replace: '      <Button type="submit" disabled={pending} aria-busy={pending} className="h-11 shrink-0 px-6">',
    message: "Expose add-profile submit loading state to assistive tech.",
  },
  {
    file: "src/app/pricing/checkout-button.tsx",
    find: '    <Button className="w-full" onClick={go} disabled={loading}>',
    replace: '    <Button className="w-full" onClick={go} disabled={loading} aria-busy={loading}>',
    message: "Expose checkout loading state to assistive tech.",
  },
  {
    file: "src/app/opt-out/form.tsx",
    find: '      <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit request"}</Button>',
    replace: '      <Button type="submit" disabled={loading} aria-busy={loading}>{loading ? "Submitting..." : "Submit request"}</Button>',
    message: "Expose opt-out submit loading state to assistive tech.",
  },
  {
    file: "src/components/theme-settings.tsx",
    find: '                : "border-border/60 text-muted-foreground hover:border-foreground/15 hover:bg-accent/60 hover:text-foreground",',
    replace: '                : "border-border/60 text-muted-foreground hover:border-foreground/15 hover:bg-accent/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40",',
    message: "Add focus ring to inactive theme setting options.",
  },
  {
    file: "src/app/app/layout.tsx",
    find: '        <main className="flex-1 min-w-0">{children}</main>',
    replace: '        <main id="main-content" className="flex-1 min-w-0">{children}</main>',
    message: "Add main content landmark id for skip navigation.",
  },
  {
    file: "src/app/layout.tsx",
    find: '      <body className="min-h-full bg-background font-sans antialiased" suppressHydrationWarning>',
    replace: '      <body className="min-h-full bg-background font-sans antialiased text-foreground" suppressHydrationWarning>',
    message: "Ensure body text inherits foreground color token.",
  },
  {
    file: "src/app/globals.css",
    find: `  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1, "ss01" 1;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }`,
    replace: `  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1, "ss01" 1;
    text-rendering: optimizeLegibility;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  @media (prefers-reduced-motion: reduce) {
    html:focus-within {
      scroll-behavior: auto;
    }
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }`,
    message: "Add global reduced-motion fallback for animations.",
  },
  {
    file: "src/app/globals.css",
    find: `  .progress-fill {
    @apply h-full rounded-full bg-gradient-to-r from-signal/90 to-signal transition-all duration-500;
  }`,
    replace: `  .progress-fill {
    @apply h-full rounded-full bg-gradient-to-r from-signal/90 to-signal motion-safe:transition-all motion-safe:duration-500;
  }`,
    message: "Only animate progress fill when motion is allowed.",
  },
  {
    file: "src/app/globals.css",
    find: `  .chip {
    @apply inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-foreground/15 hover:text-foreground;
  }`,
    replace: `  .chip {
    @apply inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card px-2.5 py-1 text-[11px] font-medium text-muted-foreground transition-colors hover:border-foreground/15 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40;
  }`,
    message: "Add focus ring utility to chip style.",
  },
  {
    file: "src/app/globals.css",
    find: `  .link-subtle {
    @apply font-medium text-foreground underline-offset-4 transition-colors hover:underline;
  }`,
    replace: `  .link-subtle {
    @apply font-medium text-foreground underline-offset-4 transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 rounded-sm;
  }`,
    message: "Add focus ring to subtle link utility class.",
  },
  {
    file: "src/components/ui/button.tsx",
    find: '  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",',
    replace: '  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 motion-safe:active:scale-[0.98]",',
    message: "Soften button focus ring and respect reduced-motion on press.",
  },
  {
    file: "src/components/page-header.tsx",
    find: '            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-card text-foreground shadow-sm">',
    replace: '            <span aria-hidden="true" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-card text-foreground shadow-sm">',
    message: "Hide decorative page header icon from screen readers.",
  },
  {
    file: "src/components/panel.tsx",
    find: '        tone === "muted" && "bg-muted/40",',
    replace: '        tone === "muted" && "bg-muted/35",',
    message: "Lighten muted panel tone for subtler sections.",
  },
  {
    file: "src/components/app-topbar.tsx",
    find: '    <div className="sticky top-0 z-20 hidden h-[60px] items-center gap-3 border-b border-border/60 bg-background/75 px-5 backdrop-blur-xl md:flex">',
    replace: '    <div className="sticky top-0 z-20 hidden h-[60px] items-center gap-3 border-b border-border/60 bg-background/80 px-5 backdrop-blur-xl md:flex">',
    message: "Slightly increase app topbar background opacity.",
  },
  {
    file: "src/components/app-sidebar.tsx",
    find: '          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-border/60 bg-card/95 backdrop-blur-xl transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0",',
    replace: '          "fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-border/60 bg-card/95 backdrop-blur-xl motion-safe:transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0",',
    message: "Only animate sidebar slide when motion is allowed.",
  },
  {
    file: "src/components/marketing-nav.tsx",
    find: '        "sticky top-0 z-30 w-full transition-all duration-300",',
    replace: '        "sticky top-0 z-30 w-full motion-safe:transition-all motion-safe:duration-300",',
    message: "Only animate marketing nav scroll state when motion allowed.",
  },
  {
    file: "src/components/event-row.tsx",
    find: '        <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm">',
    replace: '        <Avatar className="h-10 w-10 ring-2 ring-background shadow-sm motion-safe:transition-transform motion-safe:group-hover:scale-[1.02]">',
    message: "Add subtle avatar scale on event row hover.",
  },
  {
    file: "src/app/app/page.tsx",
    find: '        <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">',
    replace: '        <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">',
    message: "Tighten stat card label tracking for cleaner caps.",
  },
  {
    file: "src/app/app/page.tsx",
    find: '      <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6">',
    replace: '      <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-6 lg:p-5">',
    message: "Increase plan capacity card padding on large screens.",
  },
  {
    file: "src/app/app/page.tsx",
    find: '        <div className="surface-card md:col-span-2 flex flex-col p-6">',
    replace: '        <div className="surface-card md:col-span-2 flex flex-col p-6 lg:p-7">',
    message: "Increase plan details card padding on large screens.",
  },
  {
    file: "src/app/app/page.tsx",
    find: '        <div className="surface-card relative flex flex-col overflow-hidden p-6">',
    replace: '        <div className="surface-card relative flex flex-col overflow-hidden p-6 lg:p-7">',
    message: "Increase Slack alerts nudge card padding on large screens.",
  },
  {
    file: "src/components/marketing-footer.tsx",
    find: '      <div className="container grid gap-12 py-16 md:grid-cols-[1.4fr_2fr]">',
    replace: '      <div className="container grid gap-12 py-14 md:grid-cols-[1.4fr_2fr] md:py-16">',
    message: "Reduce footer vertical padding on mobile.",
  },
  {
    file: "src/components/marketing-footer.tsx",
    find: '        <div className="container flex flex-col items-start justify-between gap-2 py-6 text-xs text-muted-foreground md:flex-row md:items-center">',
    replace: '        <div className="container flex flex-col items-start justify-between gap-3 py-5 text-xs text-muted-foreground md:flex-row md:items-center md:py-6">',
    message: "Tune footer meta bar spacing across breakpoints.",
  },
  {
    file: "src/components/ui/card.tsx",
    find: '  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />',
    replace: '  <div ref={ref} className={cn("flex flex-col space-y-1.5 p-5 sm:p-6", className)} {...props} />',
    message: "Responsive card header padding for small screens.",
  },
  {
    file: "src/components/ui/card.tsx",
    find: '  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />',
    replace: '  <div ref={ref} className={cn("p-5 pt-0 sm:p-6 sm:pt-0", className)} {...props} />',
    message: "Responsive card content padding for small screens.",
  },
  {
    file: "src/components/ui/card.tsx",
    find: '  <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />',
    replace: '  <div ref={ref} className={cn("flex items-center p-5 pt-0 sm:p-6 sm:pt-0", className)} {...props} />',
    message: "Responsive card footer padding for small screens.",
  },
  {
    file: "src/components/back-link.tsx",
    find: '      <ArrowLeft className="h-4 w-4" />',
    replace: '      <ArrowLeft aria-hidden="true" className="h-4 w-4" />',
    message: "Hide decorative arrow icon on back link.",
  },
  {
    file: "src/components/app-topbar.tsx",
    find: '          <LayoutDashboard className="h-3.5 w-3.5" />',
    replace: '          <LayoutDashboard aria-hidden="true" className="h-3.5 w-3.5" />',
    message: "Hide decorative dashboard icon in breadcrumb.",
  },
  {
    file: "src/components/app-topbar.tsx",
    find: '              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" />',
    replace: '              <ChevronRight aria-hidden="true" className="h-3.5 w-3.5 text-muted-foreground/50" />',
    message: "Hide decorative chevrons in breadcrumb trail.",
  },
  {
    file: "src/components/app-topbar.tsx",
    find: '          <Search className="h-3.5 w-3.5" />',
    replace: '          <Search aria-hidden="true" className="h-3.5 w-3.5" />',
    message: "Hide decorative search icon in topbar trigger.",
  },
  {
    file: "src/components/app-topbar.tsx",
    find: '          <Bell className="h-4 w-4" />',
    replace: '          <Bell aria-hidden="true" className="h-4 w-4" />',
    message: "Hide decorative bell icon in notifications button.",
  },
  {
    file: "src/app/not-found.tsx",
    replace: '          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">',
    find: '          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">',
    message: "Increase 404 action button spacing on larger screens.",
  },
];

function parseArgs() {
  const args = process.argv.slice(2);
  let from = 1;
  let to = PATCHES.length;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--from") {
      const value = args[i + 1];
      if (value === undefined) {
        console.error("Missing value for --from");
        process.exit(1);
      }
      from = Number(value);
      if (!Number.isFinite(from)) {
        console.error(`Invalid --from value: ${value}`);
        process.exit(1);
      }
      i++;
    } else if (args[i] === "--to") {
      const value = args[i + 1];
      if (value === undefined) {
        console.error("Missing value for --to");
        process.exit(1);
      }
      to = Number(value);
      if (!Number.isFinite(to)) {
        console.error(`Invalid --to value: ${value}`);
        process.exit(1);
      }
      i++;
    }
  }
  return { from, to };
}

function applyPatch(patch) {
  const filePath = path.join(root, patch.file);
  if (!existsSync(filePath)) throw new Error(`Missing file: ${patch.file}`);
  const content = readFileSync(filePath, "utf8");
  if (!content.includes(patch.find)) {
    if (content.includes(patch.replace)) return "skip";
    throw new Error(`Pattern not found in ${patch.file}`);
  }
  writeFileSync(filePath, content.replace(patch.find, patch.replace), "utf8");
  return "applied";
}

function runGit(args) {
  execFileSync("git", args, { cwd: root, stdio: "inherit" });
}

const { from, to } = parseArgs();
let applied = 0;
let skipped = 0;
let failed = 0;

for (let i = from - 1; i < to && i < PATCHES.length; i++) {
  const patch = PATCHES[i];
  const n = i + 2; // iteration 1 was manual aria-current sidebar patch
  try {
    const result = applyPatch(patch);
    if (result === "skip") {
      skipped++;
      console.log(`[${n}] skip (already applied): ${patch.message}`);
      continue;
    }
    runGit(["add", patch.file]);
    runGit(["commit", "-m", patch.message]);
    runGit(["pull", "--rebase", "origin", "main"]);
    runGit(["push", "origin", "main"]);
    applied++;
    console.log(`[${n}] pushed: ${patch.message}`);
  } catch (err) {
    failed++;
    console.error(`[${n}] failed: ${err.message}`);
    process.exitCode = 1;
    break;
  }
}

console.log(`Done. applied=${applied} skipped=${skipped} failed=${failed} (target iterations 2-${to + 1})`);
