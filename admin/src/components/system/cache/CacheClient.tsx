"use client";

import { useState } from "react";
import { CacheList } from "./CacheList";
import { CacheViewer } from "./CacheViewer";

import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CacheClient() {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  return (
    <div className="h-[calc(100vh-6.5rem)] overflow-hidden flex flex-col md:block">
      {/* Mobile Header & Sidebar Toggle */}
      <div className="md:hidden flex items-center p-4 border-b shrink-0 bg-background/95 backdrop-blur z-10">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="mr-4 shrink-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[85vw] sm:w-[350px] p-0 flex flex-col">
            <SheetHeader className="p-6 border-b text-left shrink-0">
              <SheetTitle className="text-2xl font-extrabold tracking-tight">System Cache</SheetTitle>
              <p className="text-muted-foreground text-sm">Manage and inspect Redis keys.</p>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              <CacheList 
                activeId={selectedKey} 
                onView={setSelectedKey}
                onEdit={() => {}} 
              />
            </div>
          </SheetContent>
        </Sheet>
        <h2 className="text-xl font-bold tracking-tight truncate">System Cache</h2>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-0 md:gap-8 min-h-0 md:h-full">
        {/* Desktop Left Navigation Menu */}
        <div className="hidden md:flex w-[350px] lg:w-1/3 xl:w-1/4 shrink-0 space-y-8 pr-4 mt-4 flex-col border-r">
          <div className="shrink-0">
            <h2 className="text-3xl font-extrabold tracking-tight">System Cache</h2>
            <p className="text-muted-foreground mt-2 text-sm leading-relaxed">Manage and inspect Redis keys.</p>
          </div>
          <div className="flex-1 overflow-y-auto pr-2 -mr-2 min-h-0">
            <CacheList 
              activeId={selectedKey} 
              onView={setSelectedKey}
              onEdit={() => {}}
            />
          </div>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0 h-full">
          <Card className="h-full flex flex-col border-none bg-transparent shadow-none overflow-hidden rounded-none">
            <CardContent className="p-0 flex-1 flex flex-col min-h-0">
              {selectedKey ? (
                <CacheViewer 
                  id={selectedKey} 
                  onBack={() => setSelectedKey(null)} 
                />
              ) : (
                <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center p-4 md:p-6 md:p-10 lg:p-12 mx-auto w-full">
                  <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center mb-4 text-muted-foreground/50">
                    <Database className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-medium">No Key Selected</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mt-2">
                    Select a cache key from the tree on the left to inspect its details and contents.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
