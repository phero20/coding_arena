"use client";

import { useState } from "react";
import { useUserAdmin, useUserActivityAdmin } from "@/hooks/useUserAdmin";
import { EntitySelector } from "@/components/layout/EntitySelector";
import { UserActivityViewer } from "@/components/users/activity/UserActivityViewer";
import { UserActivityEditor } from "@/components/users/activity/UserActivityEditor";
import { EmptyState } from "@/components/ui/empty-state";
import { QueryState } from "@/components/ui/query-state";
import { Card, CardContent } from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid, Plus, Edit } from "lucide-react";

export default function UsersActivityPage() {
  const { users, isLoading: isLoadingUsers } = useUserAdmin();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  
  const [activeTab, setActiveTab] = useState("list");
  const [editingDate, setEditingDate] = useState<string | null>(null);

  const { activity, isLoading: isLoadingActivity, isError, error } = useUserActivityAdmin(selectedUserId);

  const handleEdit = (date: string) => {
    setEditingDate(date);
    setActiveTab("edit");
  };

  const handleCreate = () => {
    setEditingDate(null);
    setActiveTab("create");
  };

  const handleBackToList = () => {
    setEditingDate(null);
    setActiveTab("list");
  };

  return (
    <div className="h-[calc(100vh-7.5rem)] overflow-hidden px-2">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex flex-col md:flex-row gap-8 h-full"
      >
        {/* Left Navigation Menu */}
        <div className="w-full md:w-64 shrink-0 space-y-8 pr-4 mt-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight">User Activity</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">Select a user below to manage their daily activity directly.</p>
            <div className="mt-6">
              <EntitySelector
                label="Select User"
                data={users || []}
                value={selectedUserId}
                onValueChange={(val) => {
                  setSelectedUserId(val);
                  handleBackToList();
                }}
                valueKey="id"
                labelKey="username"
                placeholder="Choose a user..."
                searchPlaceholder="Search users..."
                emptyMessage="No users found."
                isLoading={isLoadingUsers}
              />
            </div>
          </div>

          <TabsList className="flex flex-col h-auto w-full items-stretch p-0 bg-transparent space-y-2">
            <TabsTrigger
              value="list"
              onClick={handleBackToList}
              className="justify-start px-4 py-2.5 text-sm font-medium transition-all rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50"
            >
              <span className="flex items-center gap-3">
                <LayoutGrid className="w-4 h-4" />
                Activity List
              </span>
            </TabsTrigger>

            {activeTab === "edit" && (
              <TabsTrigger
                value="edit"
                className="justify-start px-4 py-2.5 text-sm font-medium transition-all rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50"
              >
                <span className="flex items-center gap-3">
                  <Edit className="w-4 h-4" />
                  Edit Activity
                </span>
              </TabsTrigger>
            )}

            <TabsTrigger
              value="create"
              onClick={handleCreate}
              className="justify-start px-4 py-2.5 text-sm font-medium transition-all rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50"
            >
              <span className="flex items-center gap-3">
                <Plus className="w-4 h-4" />
                Add Activity
              </span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0 h-full">
          <Card className="h-full flex flex-col border-none bg-transparent shadow-none overflow-hidden rounded-none">
            <CardContent className="p-0 flex-1 flex flex-col min-h-0 overflow-hidden">
              {!selectedUserId ? (
                <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground bg-muted/20 border border-dashed rounded-lg m-4">
                  Please select a user to view their activity.
                </div>
              ) : (
                <QueryState isLoading={isLoadingActivity} isError={isError} error={error}>
                  <TabsContent
                    value="list"
                    className="m-0 border-none p-0 outline-none data-[state=active]:flex flex-col flex-1 min-h-0 overflow-hidden"
                  >
                    <div className="h-full overflow-auto m-0 p-0">
                      <UserActivityViewer 
                        userId={selectedUserId} 
                        onEdit={handleEdit} 
                        onCreate={handleCreate}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="edit"
                    className="m-0 border-none p-0 outline-none data-[state=active]:flex flex-col flex-1 min-h-0 overflow-hidden"
                  >
                    <div className="h-full overflow-auto m-0 p-0">
                      <UserActivityEditor 
                        userId={selectedUserId} 
                        date={editingDate || undefined}
                        onSuccess={handleBackToList} 
                        onCancel={handleBackToList} 
                      />
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="create"
                    className="m-0 border-none p-0 outline-none data-[state=active]:flex flex-col flex-1 min-h-0 overflow-hidden"
                  >
                    <div className="h-full overflow-auto m-0 p-0">
                      <UserActivityEditor 
                        userId={selectedUserId} 
                        onSuccess={handleBackToList} 
                        onCancel={handleBackToList} 
                      />
                    </div>
                  </TabsContent>
                </QueryState>
              )}
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}
