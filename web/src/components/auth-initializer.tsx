"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect } from "react";
import { setTokenGetter } from "@/lib/api-client";

export function AuthInitializer() {
  const { getToken, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded) {
      setTokenGetter(getToken);
    }
  }, [isLoaded, getToken]);

  return null;
}
