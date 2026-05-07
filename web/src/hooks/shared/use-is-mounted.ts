"use client";

import { useEffect, useState } from "react";

/**
 * A simple hook to handle hydration bypass in Next.js (client-side only rendering).
 * @returns {boolean} True if the component has mounted on the client.
 */
export function useIsMounted() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}
