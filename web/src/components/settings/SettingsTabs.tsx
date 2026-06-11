"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { AppearanceSection } from "./AppearanceSection";
import { EditorSection } from "./EditorSection";
import { ProfileSection } from "./ProfileSection";
import { Paintbrush, User, Code2, Bug, Palette } from "lucide-react";
import Link from "next/link";
import { useProfileStore } from "@/store/use-profile-store";
import { cn } from "@/lib/utils";

export const SettingsTabs = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  
  const { activeTab, initTab, syncTab } = useProfileStore();

  React.useEffect(() => {
    initTab({ tabParam, router, pathname, searchParams });
  }, [tabParam, initTab, router, pathname, searchParams]);

  const handleTabChange = (value: string) => {
    syncTab({ value, router, pathname, searchParams, redirectSettings: false });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Sidebar Navigation */}
        <aside className="md:w-64 shrink-0">
          <div className="sticky top-24 space-y-6">
            <TabsList className="flex flex-col h-auto w-full bg-transparent p-0 gap-1">
              {[
                { id: "profile", label: "Profile", icon: User },
                { id: "appearance", label: "Appearance", icon: Palette },
                { id: "editor", label: "Editor", icon: Code2 },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    "w-full justify-start gap-4 px-4 py-3 h-auto text-[10px] font-bold uppercase transition-all tracking-widest",
                    "bg-transparent border border-transparent text-muted-foreground hover:text-foreground",
                    "data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:border-border data-[state=active]:shadow-sm"
                  )}
                >
                  <tab.icon size={14} className="not-italic shrink-0" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="border-t border-border/50 pt-4 px-1">
              <Link
                href="/report-bug"
                className="flex items-center gap-4 px-3 py-3 h-auto text-xs font-bold tracking-wide text-muted-foreground hover:text-difficulty-medium  hover:bg-difficulty-medium/10 rounded-md transition-all"
              >
                <Bug size={14} className="not-italic shrink-0" />
                Report a Bug
              </Link>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          <TabsContent value="appearance" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <AppearanceSection />
          </TabsContent>
          
          <TabsContent value="editor" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <EditorSection />
          </TabsContent>
          
          <TabsContent value="profile" className="mt-0 focus-visible:outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <ProfileSection />
          </TabsContent>
        </main>
      </div>
    </Tabs>
  );
};
