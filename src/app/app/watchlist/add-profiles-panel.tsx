"use client";

import { Link2, FileSpreadsheet } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddProfileForm } from "./add-profile-form";
import { ImportCsvForm } from "./import-csv-form";

export function AddProfilesPanel() {
  return (
    <Tabs defaultValue="single">
      <TabsList className="mb-4 h-9 w-full sm:w-auto">
        <TabsTrigger value="single" className="gap-1.5">
          <Link2 className="h-3.5 w-3.5" />
          Single URL
        </TabsTrigger>
        <TabsTrigger value="csv" className="gap-1.5">
          <FileSpreadsheet className="h-3.5 w-3.5" />
          CSV import
        </TabsTrigger>
      </TabsList>
      <TabsContent value="single" className="mt-0">
        <AddProfileForm />
      </TabsContent>
      <TabsContent value="csv" className="mt-0">
        <ImportCsvForm />
      </TabsContent>
    </Tabs>
  );
}
