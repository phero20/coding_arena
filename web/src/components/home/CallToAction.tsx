"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/shared/Container";

const ease = [0.16, 1, 0.3, 1] as const;

export const CallToAction = () => {
  return (
    <section className="relative py-40 overflow-hidden border-t border-border/20">

      <Container className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease }}
          className="text-center max-w-2xl mx-auto"
        >


          <h2 className="text-3xl md:text-5xl font-black tracking-[-0.04em] leading-[1.0] mb-6">
            <span className="text-transparent bg-clip-text bg-gradient-to-b from-foreground via-foreground/80 to-foreground/30">
              Ready to enter the arena?
            </span>
          </h2>

          <p className="text-muted-foreground text-base md:text-lg max-w-sm mx-auto leading-relaxed mb-12">
            Join thousands of developers competing, growing, and proving their
            skills every day. Your rank is waiting.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 font-semibold rounded-full text-sm w-full sm:w-auto"
            >
              <Link href="/auth/register">
                Create Free Account
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 px-8 font-semibold rounded-full text-sm border-border/50 text-muted-foreground hover:text-foreground w-full sm:w-auto"
            >
              <Link href="/arena">Watch Live Battles</Link>
            </Button>
          </div>

          {/* Trust note */}
          <p className="mt-8 text-[11px] text-muted-foreground/30 font-medium">
            Free forever · No credit card required · Instant access
          </p>
        </motion.div>
      </Container>
    </section>
  );
};
