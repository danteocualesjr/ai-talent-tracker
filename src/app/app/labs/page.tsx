import { Sparkles } from "lucide-react";
import { listLabs } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { EmptyPanel } from "@/components/panel";
import { LabsSearchGrid } from "@/components/labs-search-grid";

export const metadata = { title: "Lab rosters" };

export default async function LabsIndexPage() {
  const labs = await listLabs();
  return (
    <div className="container max-w-6xl space-y-8 px-4 py-8 md:px-6 md:py-10">
      <PageHeader
        title="Lab rosters"
        eyebrow="Tracking"
        icon={<Sparkles className="h-4 w-4" />}
        description="Curated employee lists for top AI labs. Click to view and bulk-add."
        divider
      />
      {labs.length === 0 ? (
        <EmptyPanel
          icon={<Sparkles className="h-5 w-5" />}
          title="No lab rosters yet"
          body="Curated lab lists appear here after the first sync. Check back soon or add profiles manually from the watchlist."
        />
      ) : (
        <LabsSearchGrid labs={labs} />
      )}
    </div>
  );
}
