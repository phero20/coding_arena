"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AcademyDataPageProps {
  title: string;
  description: string;
  itemNamePlural: string; // e.g. "Tracks", "Configs"
  renderTable: (props: { onEdit: (slug: string) => void; onView: (slug: string) => void }) => React.ReactNode;
  renderViewer: (props: { slug: string; onBack: () => void }) => React.ReactNode;
  renderEditor: (props: { slug?: string; onSuccess: () => void; onCancel: () => void }) => React.ReactNode;
  headerAction?: React.ReactNode;
}

export function AcademyDataPage({
  title,
  description,
  itemNamePlural,
  renderTable,
  renderViewer,
  renderEditor,
  headerAction,
}: AcademyDataPageProps) {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const handleEdit = (slug: string) => {
    setSelectedSlug(slug);
    setActiveTab("edit");
  };

  const handleView = (slug: string) => {
    setSelectedSlug(slug);
    setActiveTab("view");
  };

  const handleBackToList = () => {
    setSelectedSlug(null);
    setActiveTab("list");
  };

  return (
    <div className="h-[calc(100vh-8rem)] overflow-hidden px-2">
      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="flex flex-col md:flex-row gap-8 h-full"
      >
        {/* Left Column (Fixed, no scroll) */}
        <div className="w-full md:w-64 shrink-0 space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
            <p className="text-muted-foreground mt-2">{description}</p>
            {headerAction && <div className="mt-6">{headerAction}</div>}
          </div>

          <TabsList className="flex flex-col h-auto w-full items-stretch p-1 space-y-1">
            <TabsTrigger
              value="list"
              onClick={() => setSelectedSlug(null)}
              className="justify-start"
            >
              {itemNamePlural} List
            </TabsTrigger>
            {activeTab === "view" && (
              <TabsTrigger value="view" className="justify-start">View Details</TabsTrigger>
            )}
            {activeTab === "edit" && (
              <TabsTrigger value="edit" className="justify-start">Edit</TabsTrigger>
            )}
            <TabsTrigger
              value="create"
              onClick={() => setSelectedSlug(null)}
              className="justify-start"
            >
              Create New
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Right Column (Scrollable internally) */}
        <div className="flex-1 min-w-0 h-full">
          <Card className="h-full flex flex-col">
            <CardContent className="p-0 pb-4 px-4 flex-1 overflow-y-auto min-h-0">
              <TabsContent value="list" className="m-0 border-none p-0 outline-none">
                {renderTable({ onEdit: handleEdit, onView: handleView })}
              </TabsContent>

              <TabsContent value="view" className="m-0 border-none p-0 outline-none">
                {selectedSlug && renderViewer({ slug: selectedSlug, onBack: handleBackToList })}
              </TabsContent>

              <TabsContent value="edit" className="m-0 border-none p-0 outline-none">
                {selectedSlug && renderEditor({ slug: selectedSlug, onSuccess: handleBackToList, onCancel: handleBackToList })}
              </TabsContent>

              <TabsContent value="create" className="m-0 border-none p-0 outline-none">
                {renderEditor({ onSuccess: handleBackToList, onCancel: handleBackToList })}
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}
