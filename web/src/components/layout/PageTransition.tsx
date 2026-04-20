"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useIsMounted } from "@/hooks/shared/use-is-mounted";

export const PageTransition = ({ children }: { children: React.ReactNode }) => {
  const isMounted = useIsMounted();
  const pathname = usePathname();

  if (!isMounted) {
    return <div className="opacity-0">{children}</div>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ 
          duration: 0.5, 
          ease: [0.22, 1, 0.36, 1], // Smooth premium easing
        }}
        className="w-full h-full flex flex-col overflow-hidden"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
