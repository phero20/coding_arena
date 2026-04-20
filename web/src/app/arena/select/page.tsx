"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/shared/Container";
import { PracticeProblemList } from "@/components/practice/PracticeProblemList";
import { useArenaStore } from "@/store/useArenaStore";

const SelectContent = () => {
  const searchParams = useSearchParams();
  const roomId = searchParams.get("roomId") || undefined;

  return <PracticeProblemList isSelectPage={true} roomId={roomId} />;
};

const SelectPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="pt-28 pb-16">
        <Container className="space-y-8">
          <Suspense fallback={<div>Loading selector...</div>}>
            <SelectContent />
          </Suspense>
        </Container>
      </main>
    </div>
  );
};

export default SelectPage;
