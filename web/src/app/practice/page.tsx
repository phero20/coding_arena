import React from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/shared/Container";
import { PracticeProblemList } from "@/components/practice/PracticeProblemList";

const PracticePage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="pt-28 pb-16">
        <Container className="space-y-8">
          <PracticeProblemList />
        </Container>
      </main>
    </div>  
  );
};

export default PracticePage;
