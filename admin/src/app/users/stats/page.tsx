"use client";

import { useState } from "react";
import { useUserAdmin, useUserStatsAdmin } from "@/hooks/useUserAdmin";
import { EntitySelector } from "@/components/layout/EntitySelector";
import { UserStatsViewer } from "@/components/users/stats/UserStatsViewer";
import { UserStatsEditor } from "@/components/users/stats/UserStatsEditor";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { QueryState } from "@/components/ui/query-state";
import { Card, CardContent } from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Edit, Plus } from "lucide-react";

export default function UsersStatsPage() {
  const { users, isLoading: isLoadingUsers } = useUserAdmin();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  
  const [activeTab, setActiveTab] = useState("view");

  const { stats, isLoading: isLoadingStats, isError, error } = useUserStatsAdmin(selectedUserId);

  const handleEdit = () => setActiveTab("edit");
  const handleView = () => setActiveTab("view");
  const handleCreate = () => setActiveTab("create");

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
            <h2 className="text-3xl font-extrabold tracking-tight">User Stats</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">Select a user below to manage their statistics directly.</p>
            <div className="mt-6">
              <EntitySelector
                label="Select User"
                data={users || []}
                value={selectedUserId}
                onValueChange={(val) => {
                  setSelectedUserId(val);
                  handleView(); // Reset edit mode on user change
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
              value="view"
              onClick={handleView}
              className="justify-start px-4 py-2.5 text-sm font-medium transition-all rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50"
            >
              <span className="flex items-center gap-3">
                <Eye className="w-4 h-4" />
                View Stats
              </span>
            </TabsTrigger>

            {(!stats || !stats.userId) ? (
              <TabsTrigger
                value="create"
                onClick={handleCreate}
                className="justify-start px-4 py-2.5 text-sm font-medium transition-all rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50"
              >
                <span className="flex items-center gap-3">
                  <Plus className="w-4 h-4" />
                  Create Stats
                </span>
              </TabsTrigger>
            ) : (
              <TabsTrigger
                value="edit"
                onClick={handleEdit}
                className="justify-start px-4 py-2.5 text-sm font-medium transition-all rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50"
              >
                <span className="flex items-center gap-3">
                  <Edit className="w-4 h-4" />
                  Edit Stats
                </span>
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0 h-full">
          <Card className="h-full flex flex-col border-none bg-transparent shadow-none overflow-hidden rounded-none">
            <CardContent className="p-0 flex-1 flex flex-col min-h-0 overflow-hidden">
              {!selectedUserId ? (
                <div className="flex h-full items-center justify-center p-8 text-center text-muted-foreground bg-muted/20 border border-dashed rounded-lg m-4">
                  Please select a user to view their stats.
                </div>
              ) : (
                <QueryState isLoading={isLoadingStats} isError={isError} error={error}>
                  <TabsContent
                    value="view"
                    className="m-0 border-none p-0 outline-none data-[state=active]:flex flex-col flex-1 min-h-0 overflow-hidden"
                  >
                    {!stats || !stats.userId ? (
                        <EmptyState 
                          message="This user does not have any statistics recorded yet." 
                        />
                    ) : (
                      <div className="h-full overflow-auto m-0 p-0">
                        <UserStatsViewer 
                          id={selectedUserId} 
                          onEdit={handleEdit} 
                        />
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent
                    value="edit"
                    className="m-0 border-none p-0 outline-none data-[state=active]:flex flex-col flex-1 min-h-0 overflow-hidden"
                  >
                    <div className="h-full overflow-auto m-0 p-0">
                      <UserStatsEditor 
                        id={stats?.userId} 
                        userId={selectedUserId} 
                        onSuccess={handleView} 
                        onCancel={handleView} 
                      />
                    </div>
                  </TabsContent>

                  <TabsContent
                    value="create"
                    className="m-0 border-none p-0 outline-none data-[state=active]:flex flex-col flex-1 min-h-0 overflow-hidden"
                  >
                    <div className="h-full overflow-auto m-0 p-0">
                      <UserStatsEditor 
                        userId={selectedUserId} 
                        onSuccess={handleView} 
                        onCancel={handleView} 
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
