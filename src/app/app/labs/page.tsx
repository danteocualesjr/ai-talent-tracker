import { Sparkles } from "lucide-react";
import { listLabs } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { EmptyPanel } from "@/components/panel";
import { LabsRosterGrid } from "./labs-roster-grid";

export const metadata = { title: "Lab rosters" };

export default async function LabsIndexPage() {
  const labs = await listLabs();
  const featuredCount = labs.filter((l) => l.is_featured).length;

  return (
    <div className="container max-w-6xl space-y-8 px-4 py-8 md:px-6 md:py-10">
      <PageHeader
        title="Lab rosters"
        eyebrow="Tracking"
        icon={<Sparkles className="h-4 w-4" />}
        description="Curated employee lists for top AI labs. Click to view and bulk-add."
        divider
      />

      {labs.length > 0 && (
        <div className="stat-strip grid-cols-2 sm:grid-cols-3">
          <div className="group stat-strip-item">
            <div className="tnum font-serif text-2xl font-medium">{labs.length}</div>
            <div className="mt-1 label-caps">Labs available</div>
          </div>
          <div className="group stat-strip-item">
            <div className="tnum font-serif text-2xl font-medium">{featuredCount}</div>
            <div className="mt-1 label-caps">Featured</div>
          </div>
          <div className="group stat-strip-item hidden sm:block">
            <div className="text-sm font-semibold text-foreground">One-click bulk add</div>
            <div className="mt-1 text-xs leading-relaxed text-muted-foreground">Track an entire org from any roster page</div>
          </div>
        </div>
      )}
      {labs.length === 0 ? (
        <EmptyPanel
          icon={<Sparkles className="h-5 w-5" />}
          title="No lab rosters yet"
          body="Curated lab lists appear here after the first sync. Check back soon or add profiles manually from the watchlist."
        />
      ) : (
        <LabsRosterGrid labs={labs} />
      )}
    </div>
  );
}
