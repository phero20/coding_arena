"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";
import { AuthInitializer } from "./auth-initializer";
import { ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { FullPageOverlay } from "./shared/StatusState";
import { ArenaSocketProvider } from "./providers/ArenaSocketProvider";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2 * 60 * 1000, // 2 minutes
            gcTime: 10 * 60 * 1000,   // 10 minutes
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ClerkLoading>
        <FullPageOverlay message="Authenticating session..." />
      </ClerkLoading>

      <ClerkLoaded>
        <AuthInitializer />
        <ArenaSocketProvider>
          {children}
        </ArenaSocketProvider>
      </ClerkLoaded>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
