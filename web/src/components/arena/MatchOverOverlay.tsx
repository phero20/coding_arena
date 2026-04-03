"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, ArrowRight, Timer, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface MatchOverOverlayProps {
  roomId: string;
  isOpen: boolean;
  onViewResults?: () => void;
  playersCount: number;
}

export const MatchOverOverlay = ({ 
  roomId, 
  isOpen, 
  onViewResults,
  playersCount 
}: MatchOverOverlayProps) => {
  const router = useRouter();

  const handleNavigate = () => {
    if (onViewResults) {
      onViewResults();
    } else {
      router.push(`/arena/match/${roomId}/results`);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-background/40 backdrop-blur-md"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-primary/20 bg-card/80 shadow-[0_0_50px_-12px_rgba(236,72,153,0.3)] backdrop-blur-2xl"
          >
            {/* Animated Background Glow */}
            <div className="absolute -top-24 -left-24 size-64 bg-primary/20 blur-[100px] animate-pulse" />
            <div className="absolute -bottom-24 -right-24 size-64 bg-secondary/20 blur-[100px] animate-pulse delay-1000" />

            <div className="relative z-10 p-8 flex flex-col items-center text-center">
              {/* Trophy Icon with Pulse */}
              <motion.div
                initial={{ rotate: -10, scale: 0.5 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="relative mb-6"
              >
                <div className="absolute inset-0 bg-primary/40 blur-2xl rounded-full" />
                <div className="relative size-20 rounded-2xl bg-linear-to-br from-primary/20 to-secondary/20 border border-primary/30 flex items-center justify-center">
                  <Trophy className="size-10 text-primary" />
                </div>
              </motion.div>

              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="space-y-2"
              >
                <h2 className="text-4xl font-black uppercase tracking-tighter italic text-foreground leading-none">
                  Match Finished!
                </h2>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-[0.2em]">
                  The battle has concluded
                </p>
              </motion.div>

              {/* Stats Grid */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="grid grid-cols-2 gap-4 w-full mt-8"
              >
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-1">
                  <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                    <CheckCircle2 className="size-4 text-primary" />
                  </div>
                  <span className="text-xl font-black">{playersCount}</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Participants</span>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col items-center gap-1">
                  <div className="size-8 rounded-full bg-secondary/10 flex items-center justify-center mb-1">
                    <Timer className="size-4 text-secondary" />
                  </div>
                  <span className="text-xl font-black">COMP</span>
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Match State</span>
                </div>
              </motion.div>

              {/* Action Button */}
              <motion.div
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="w-full mt-8"
              >
                <Button
                  onClick={handleNavigate}
                  size="lg"
                  className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-black uppercase tracking-widest group shadow-[0_10px_20px_-10px_rgba(236,72,153,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  View Final Rankings
                  <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                </Button>
                
                <p className="mt-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-relaxed">
                  Room: {roomId} • Record secured in global archives
                </p>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
