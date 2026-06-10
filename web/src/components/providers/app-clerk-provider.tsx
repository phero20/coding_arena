"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

const clerkLocalization = {
  signIn: {
    start: {
      title: "Welcome to",
      subtitle: "Sign in or Create account to continue",
    },
  },
  signUp: {
    start: {
      title: "Welcome to",
      subtitle: "Sign in or Create account to continue",
    },
  },
};

const clerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: "var(--primary)",
    colorBackground: "var(--background)",
    colorText: "var(--foreground)",
    colorInputBackground: "var(--card)",
    colorInputText: "var(--foreground)",
    borderRadius: "var(--radius)",
  },
  elements: {
    card: "bg-card border border-border shadow-2xl mx-auto !my-auto",
    navbar: "bg-transparent",
    headerTitle: "text-2xl font-bold tracking-tight text-foreground after:content-['SlaveCode'] after:text-primary after:ml-2",
    headerSubtitle: "text-base text-muted-foreground",
    socialButtonsBlockButton:
      "bg-muted/50 border-border hover:bg-muted transition-all",
    formButtonPrimary:
      "bg-primary text-primary-foreground hover:opacity-90 transition-opacity",
    footerActionLink: "text-primary hover:text-primary/80",
    userButtonPopoverCard: "bg-card border border-border",
    modalContent: "flex items-center justify-center",
    modalBackdrop: "!bg-background/60 backdrop-blur-[2px] fixed inset-0 flex items-center justify-center z-[9999]",
  },
};

export function AppClerkProvider({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider
      localization={clerkLocalization}
      appearance={clerkAppearance}
    >
      {children}
    </ClerkProvider>
  );
}
