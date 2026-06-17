"use client";

import { useState } from "react";
import { TaxonomyTree } from "@/components/roadmap/TaxonomyTree";
import { CategoryDetails } from "@/components/roadmap/CategoryDetails";

export default function RoadmapPage() {
  const [selectedCategory, setSelectedCategory] = useState<any | null>(null);

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col bg-background">
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
        {/* Left Pane: Taxonomy Tree */}
        <div className="w-full lg:w-1/3 xl:w-1/4 border-r border-border/50 bg-background overflow-y-auto">
          <div className="p-3  border-b border-border/50 sticky top-0 bg-background z-10 backdrop-blur ">
            <h1 className="text-xl font-semibold tracking-tight">Roadmap</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage categories and concepts</p>
          </div>
          <div className="p-3 pt-6">
            <TaxonomyTree 
              selectedCategory={selectedCategory} 
              onSelect={setSelectedCategory} 
            />
          </div>
        </div>

        {/* Right Pane: Category Details */}
        <div className="flex-1 overflow-y-auto bg-background/50">
          <div className="p-4 md:p-6 md:p-10 lg:p-12 max-w-5xl mx-auto">
            {selectedCategory ? (
              <CategoryDetails category={selectedCategory} />
            ) : (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center text-center">
                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                  <svg
                    className=" h-8 w-8 text-muted-foreground/50"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-foreground">No Category Selected</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                  Select a category from the tree on the left to view its details, map problems, and manage its configuration.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
