"use client";

import { ThemeProvider } from "@/components/theme-provider";

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      themes={[
        "dark",
        "theme-neutral",
        "theme-bubble-gum",
        "theme-twitter",
        "theme-claude",
        "theme-astro-vista",
        "theme-chalk",
        "theme-sandstone",
        "theme-cyber-yellow",
        "theme-meridian",
        "theme-discord",
        "theme-royal-gold",
      ]}
    >
      {children}
    </ThemeProvider>
  );
}
