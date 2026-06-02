"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { ArrowRight, Code2, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/shared/Container";

export const CTASection = () => {
  return (
    <section className="relative py-32 overflow-hidden bg-background">
      
      <Container className="relative z-10 flex flex-col items-center justify-center text-center">
        <div className="max-w-3xl flex flex-col items-center">

          {/* Heading */}
          <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            Stop Thinking. <br className="hidden md:block" />
            <span className="text-primary/90">Start Delivering.</span>
          </h2>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
            Master data structures and algorithms with our comprehensive problem set, or build a strong foundation through our step-by-step academy.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto h-12 px-8 font-bold text-base gap-2 group" asChild>
              <Link href="/problems">
                <Code2 className="size-5" />
                Start Coding Now
                <ArrowRight className="size-4 transition-transform" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 font-bold text-base gap-2 transition-colors" asChild>
              <Link href="/academy">
                <GraduationCap className="size-5" />
                Academy for Beginners
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
};
