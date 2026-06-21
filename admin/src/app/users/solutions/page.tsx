"use client";

import { useState } from "react";
import { useUserAdmin } from "@/hooks/useUserAdmin";
import { EntitySelector } from "@/components/layout/EntitySelector";
import { UserSolutionsViewer } from "@/components/users/solutions/UserSolutionsViewer";
import { Card, CardContent } from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LayoutGrid } from "lucide-react";

export default function UsersSolutionsPage() {
  const { users, isLoading: isLoadingUsers } = useUserAdmin();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  
  const [activeTab, setActiveTab] = useState("list");

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
            <h2 className="text-3xl font-extrabold tracking-tight">User Solutions</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">Select a user below to manage their published solutions.</p>
            <div className="mt-6">
              <EntitySelector
                label="Select User"
                data={users || []}
                value={selectedUserId}
                onValueChange={(val) => {
                  setSelectedUserId(val);
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
              className="justify-start px-4 py-2.5 text-sm font-medium transition-all rounded-lg data-[state=active]:bg-primary/10 data-[state=active]:text-primary hover:bg-muted/50"
            >
              <span className="flex items-center gap-3">
                <LayoutGrid className="w-4 h-4" />
                Solutions List
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
                  Please select a user to view their solutions.
                </div>
              ) : (
                <TabsContent
                  value="list"
                  className="m-0 border-none p-0 outline-none data-[state=active]:flex flex-col flex-1 min-h-0 overflow-hidden"
                >
                  <div className="h-full overflow-auto m-0 p-0">
                    <UserSolutionsViewer 
                      userId={selectedUserId} 
                    />
                  </div>
                </TabsContent>
              )}
            </CardContent>
          </Card>
        </div>
      </Tabs>
    </div>
  );
}
