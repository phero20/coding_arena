import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const ContestHeroSkeleton = () => (
  <Card className="relative mb-10 overflow-hidden border-border bg-card shadow-sm animate-pulse">
    <CardContent className="relative z-10 flex flex-col items-start justify-between gap-8 p-6 sm:p-8 lg:flex-row lg:items-center">
      <div className="w-full max-w-2xl space-y-4">
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
      <div className="flex w-full shrink-0 flex-col items-start gap-4 rounded-xl border border-border bg-muted/30 p-6 lg:w-auto lg:items-end">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-12 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
    </CardContent>
  </Card>
);

export const ContestListSkeleton = () => (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
    {[...Array(8)].map((_, i) => (
      <Card key={i} className="flex h-[350px] flex-col overflow-hidden border-border bg-card/50">
        <div className="flex flex-col p-5 space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-10 w-full" />
          <div className="space-y-3 mt-auto">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md mt-4" />
          </div>
        </div>
      </Card>
    ))}
  </div>
);
