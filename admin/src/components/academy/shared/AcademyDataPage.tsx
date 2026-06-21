"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, Eye, Edit, FlaskConical, Plus } from "lucide-react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface AcademyDataPageProps {
  title: string;
  description: string;
  itemNamePlural: string; // e.g. "Tracks", "Configs"
  renderTable: (props: {
    onEdit: (id: string) => void;
    onView: (id: string) => void;
    onTest?: (id: string) => void;
    activeId?: string | null;
  }) => React.ReactNode;
  renderViewer: (props: {
    id: string;
    slug: string;
    onBack: () => void;
  }) => React.ReactNode;
  renderEditor?: (props: {
    id?: string;
    slug?: string;
    onSuccess: () => void;
    onCancel: () => void;
  }) => React.ReactNode;
  hideCreate?: boolean;
  renderTests?: (props: {
    id: string;
    slug: string;
    onSuccess: () => void;
    onCancel: () => void;
  }) => React.ReactNode;
  headerAction?: React.ReactNode;
}

export function AcademyDataPage({
  title,
  description,
  itemNamePlural,
  renderTable,
  renderViewer,
  renderEditor,
  renderTests,
  headerAction,
  hideCreate,
}: AcademyDataPageProps) {
  const [activeTab, setActiveTab] = useState("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleEdit = (id: string) => {
    setSelectedId(id);
    setActiveTab("edit");
  };

  const handleView = (id: string) => {
    setSelectedId(id);
    setActiveTab("view");
  };

  const handleTests = (id: string) => {
    setSelectedId(id);
    setActiveTab("tests");
  };

  const handleBackToList = () => {
    setSelectedId(null);
    setActiveTab("list");
  };

  return (
    <div className="h-[calc(100vh-7.5rem)] overflow-hidden p-2 md:p-6">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col md:flex-row gap-8 h-full"
      >
        {/* Left Navigation Menu */}
        <div className="w-full md:w-64 shrink-0 space-y-8 pr-4 mt-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">{title}</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">
              {description}
            </p>
            {headerAction && <div className="mt-6">{headerAction}</div>}
          </div>

          <TabsList className="flex flex-col h-auto w-full items-stretch p-0 bg-transparent space-y-2">
            <TabsTrigger
              value="list"
              onClick={() => setSelectedId(null)}
              className="justify-start px-4 py-2.5 text-sm font-medium transition-all rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50"
            >
              <span className="flex items-center gap-3">
                <LayoutGrid className="w-4 h-4" />
                {itemNamePlural} List
              </span>
            </TabsTrigger>

            {activeTab === "view" && (
              <TabsTrigger
                value="view"
                className="justify-start px-4 py-2.5 text-sm font-medium transition-all rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50"
              >
                <span className="flex items-center gap-3">
                  <Eye className="w-4 h-4" />
                  View Details
                </span>
              </TabsTrigger>
            )}

            {activeTab === "edit" && renderEditor && (
              <TabsTrigger
                value="edit"
                className="justify-start px-4 py-2.5 text-sm font-medium transition-all rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50"
              >
                <span className="flex items-center gap-3">
                  <Edit className="w-4 h-4" />
                  Edit Item
                </span>
              </TabsTrigger>
            )}

            {activeTab === "tests" && (
              <TabsTrigger
                value="tests"
                className="justify-start px-4 py-2.5 text-sm font-medium transition-all rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50"
              >
                <span className="flex items-center gap-3">
                  <FlaskConical className="w-4 h-4" />
                  Test Cases
                </span>
              </TabsTrigger>
            )}

            {!hideCreate && renderEditor && (
              <TabsTrigger
                value="create"
                onClick={() => setSelectedId(null)}
                className="justify-start px-4 py-2.5 text-sm font-medium transition-all rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50"
              >
                <span className="flex items-center gap-3">
                  <Plus className="w-4 h-4" />
                  Create New
                </span>
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* Right Content Area (Scrollable internally handled by children) */}
        <div className="flex-1 min-w-0 h-full">
          <Card className="h-full flex flex-col border-none bg-transparent shadow-none overflow-hidden rounded-none">
            <CardContent className="p-0 flex-1 flex flex-col min-h-0 overflow-hidden">
              <TabsContent
                value="list"
                className="m-0 border-none p-0 outline-none data-[state=active]:flex flex-col flex-1 min-h-0 overflow-hidden"
              >
                {renderTable({
                  onEdit: handleEdit,
                  onView: handleView,
                  onTest: handleTests,
                  activeId: selectedId,
                })}
              </TabsContent>

              <TabsContent
                value="view"
                className="m-0 border-none p-0 outline-none data-[state=active]:flex flex-col flex-1 min-h-0 overflow-hidden"
              >
                {selectedId &&
                  renderViewer({
                    id: selectedId,
                    slug: selectedId,
                    onBack: handleBackToList,
                  })}
              </TabsContent>

              {renderEditor && (
                <TabsContent
                  value="edit"
                  className="m-0 border-none p-0 outline-none data-[state=active]:flex flex-col flex-1 min-h-0 overflow-hidden"
                >
                  {selectedId &&
                    renderEditor({
                      id: selectedId,
                      slug: selectedId,
                      onSuccess: handleBackToList,
                      onCancel: handleBackToList,
                    })}
                </TabsContent>
              )}

              {renderEditor && !hideCreate && (
                <TabsContent
                  value="create"
                  className="m-0 border-none p-0 outline-none data-[state=active]:flex flex-col flex-1 min-h-0 overflow-hidden"
                >
                  {renderEditor({
                    onSuccess: handleBackToList,
                    onCancel: handleBackToList,
                  })}
                </TabsContent>
              )}

              <TabsContent
                value="tests"
                className="m-0 border-none p-0 outline-none data-[state=active]:flex flex-col flex-1 min-h-0 overflow-hidden"
              >
                {selectedId &&
                  renderTests &&
                  renderTests({
                    id: selectedId,
                    slug: selectedId,
                    onSuccess: handleBackToList,
                    onCancel: handleBackToList,
                  })}
              </TabsContent>
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}
