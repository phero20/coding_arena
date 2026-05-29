"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, ArrowLeft } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSystemDesignTopicsQuery } from "@/hooks/queries/use-system-design.queries";
import { QueryGuard } from "@/components/shared/QueryGuard";
import { LearnSidebarSkeleton } from "@/components/skeletons/SystemDesignLearnSkeletons";

const TopicsList = ({ isMobile }: { isMobile?: boolean }) => {
  const pathname = usePathname();
  const query = useSystemDesignTopicsQuery();

  return (
    <div className={cn("flex flex-col gap-1", isMobile ? "p-2 py-4" : "p-2 py-4")}>
      <QueryGuard 
        loading={query.isLoading}
        error={query.error}
        errorTitle="Unexpected Error Occured"
        data={query.data}
        skeleton={<LearnSidebarSkeleton />}
        emptyMessage="No topics found in the curriculum."
      >
        {(topics) => (
          <>
            {topics.map((topic) => {
              const isActive = pathname.includes(`/learn/${topic.slug}`);
              const button = (
                <Button
                  key={topic.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "justify-start w-full font-normal shadow-none h-auto whitespace-normal text-left py-2",
                    isActive && "font-medium text-primary"
                  )}
                  asChild
                >
                  <Link href={`/systemdesign/learn/${topic.slug}`}>
                    {topic.title}
                  </Link>
                </Button>
              );

              if (isMobile) {
                return (
                  <SheetClose asChild key={topic.id}>
                    {button}
                  </SheetClose>
                );
              }
              return <React.Fragment key={topic.id}>{button}</React.Fragment>;
            })}
          </>
        )}
      </QueryGuard>
    </div>
  );
};

export const LearnMobileHeader = () => {
  return (
    <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between border-b border-border/40 bg-background p-4 pt-20">
      <Button variant="outline" size="sm" className="text-muted-foreground hover:text-foreground shadow-none" asChild>
        <Link href="/systemdesign" className="flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Link>
      </Button>

      <Sheet>
        <SheetTrigger asChild>
          <div className="flex items-center gap-2 cursor-pointer">
            <span className="font-bold text-sm tracking-tight">Topics</span>
            <Button variant="ghost" className="p-2 -mr-2 text-foreground" asChild>
              <div><Menu className="h-5 w-5" /></div>
            </Button>
          </div>
        </SheetTrigger>
        <SheetContent
          side="right"
          className="w-full p-0 top-20! h-[calc(100vh-5rem)]!"
          overlayClass="!top-20"
        >
          <SheetHeader className="p-4 border-b border-border/40 bg-muted/20 text-left">
            <SheetTitle className="text-sm font-bold">Topics</SheetTitle>
          </SheetHeader>
          <ScrollArea className="h-[calc(100vh-80px-4rem)]">
            <TopicsList isMobile />
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export const LearnDesktopSidebar = () => {
  return (
    <aside className="hidden md:block w-64 lg:w-72 shrink-0 border-r border-border/40 bg-card/30">
      <div className="sticky top-20 overflow-hidden flex flex-col h-[calc(100vh-5rem)]">
        <div className="px-3 py-2 border-b border-border/40 flex items-center justify-between gap-2">
          <Button variant="outline" size="sm" className="text-muted-foreground hover:text-foreground shadow-none" asChild>
            <Link href="/systemdesign" className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Link>
          </Button>
          <h3 className="font-bold text-sm tracking-tight text-foreground/80">Topics</h3>
        </div>
        <div className="flex-1 overflow-y-auto">
          <TopicsList />
        </div>
      </div>
    </aside>
  );
};
