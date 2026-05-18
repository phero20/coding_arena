import React from "react";
import { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { motion } from "framer-motion";

/**
 * Premium Skeleton Provider
 * Ensures all skeletons share the same 'Industrial Dark' theme with pulsed animations.
 */
export const SkeletonProvider = ({ 
  children, 
  noWrapper = false 
}: { 
  children: React.ReactNode;
  noWrapper?: boolean;
}) => (
  <SkeletonTheme
    baseColor="var(--muted)"
    highlightColor="var(--card)"
    duration={1.5}
    borderRadius="0.5rem"
  >
    {noWrapper ? (
      children
    ) : (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
    )}
  </SkeletonTheme>
);
