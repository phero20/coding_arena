"use client";

import { ThemeProvider } from "@/components/theme-provider";

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="theme-cyber-yellow"
      enableSystem={false}
      themes={[
        "theme-cyber-yellow",
        "dark",
        "theme-neutral",
        "theme-bubble-gum",
        "theme-twitter",
        "theme-claude",
        "theme-astro-vista",
        "theme-chalk",
        "theme-sandstone",
        "theme-meridian",
        "theme-discord",
        "theme-royal-gold",
      ]}
    >
      {children}
    </ThemeProvider>
  );
}
