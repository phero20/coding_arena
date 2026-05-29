"use client";

import { LearnMobileHeader, LearnDesktopSidebar } from "@/components/systemdesign-workspace/learn/LearnSidebar";
import { Button } from "@/components/ui/button";
import { FolderKanban } from "lucide-react";
import Link from "next/link";

export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Main Container */}
      <div className="flex-1 flex w-full">
        <div className="flex w-full flex-col md:flex-row">
          <LearnMobileHeader />
          <LearnDesktopSidebar />
          
          {/* Content Area */}
          <main className="flex-1 min-w-0">
            
            <div className="p-5 sm:p-10 lg:p-24 max-md:pt-32 max-h-screen overflow-y-auto  mx-auto relative">
              <Link href="/systemdesign/workspace" className="hidden md:block fixed top-20 right-2"><Button size="sm" variant="default"><FolderKanban /> Try WorkSpace</Button></Link>
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
