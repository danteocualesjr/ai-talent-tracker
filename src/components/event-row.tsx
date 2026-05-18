import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelative } from "@/lib/utils";
import type { EventRow as EventRowT, Profile } from "@/types/db";

const TYPE_LABEL: Record<string, string> = {
  left_company: "Left",
  joined_company: "Joined",
  went_stealth: "Went stealth",
  headline_signals_founding: "Founding signal",
  role_change_internal: "Role change",
  about_changed: "About updated",
  location_changed: "Location",
  github_dark: "GitHub dark",
  new_domain: "New domain",
  other: "Update",
};

const TYPE_VARIANT: Record<string, "default" | "success" | "warning" | "secondary"> = {
  left_company: "warning",
  went_stealth: "warning",
  headline_signals_founding: "success",
  joined_company: "default",
};

export function EventListItem({ event, profile, href }: { event: EventRowT; profile: Profile; href?: string }) {
  const initials = (profile.full_name || profile.linkedin_handle || "??").slice(0, 2).toUpperCase();
  return (
    <div className="flex items-start gap-3 border-b py-4 last:border-b-0">
      <Avatar>
        {profile.avatar_url ? <AvatarImage src={profile.avatar_url} alt={profile.full_name ?? ""} /> : null}
        <AvatarFallback>{initials}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Link href={href ?? `/app/profiles/${profile.id}`} className="truncate font-medium hover:underline">
            {profile.full_name || profile.linkedin_handle}
          </Link>
          <Badge variant={TYPE_VARIANT[event.type] ?? "secondary"}>{TYPE_LABEL[event.type] ?? event.type}</Badge>
          <span className="text-xs text-muted-foreground">{formatRelative(event.detected_at)}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{event.summary}</p>
        {profile.headline && (
          <p className="mt-1 text-xs text-muted-foreground">{profile.headline}</p>
        )}
      </div>
      <a
        href={profile.linkedin_url}
        target="_blank"
        rel="noreferrer noopener"
        className="text-xs text-muted-foreground underline-offset-4 hover:underline"
      >
        LinkedIn
      </a>
    </div>
  );
}
