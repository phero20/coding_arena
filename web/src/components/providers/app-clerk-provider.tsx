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
    colorTextOnPrimaryBackground: "var(--primary-foreground)",
    colorBackground: "var(--background)",
    colorText: "var(--foreground)",
    colorInputBackground: "var(--background)",
    colorInputText: "var(--foreground)",
    colorDanger: "var(--destructive)",
    borderRadius: "var(--radius)",
  },
  elements: {
    rootBox: "flex items-center justify-center",
    cardBox: "!max-h-[85vh] !my-auto !h-auto !border !border-border/30",
    card: "bg-card border border-border shadow-2xl mx-auto !my-auto !max-h-[90vh] !min-h-0 !h-auto overflow-hidden",
    scrollBox: "overflow-y-auto custom-scrollbar !max-h-[calc(90vh)]",
    navbar: "bg-transparent",
    headerTitle:
      "text-2xl font-bold tracking-tight !text-foreground after:content-['SlaveCode'] after:text-primary after:ml-2",
    headerSubtitle: "text-base !text-muted-foreground",
    socialButtonsBlockButton:
      "!bg-card !text-foreground !border-border !py-3 transition-all",
    formButtonPrimary:
      "bg-primary text-primary-foreground hover:opacity-90 transition-opacity",
    footerActionLink: "text-primary hover:text-primary/80",
    userButtonPopoverCard: "bg-card border border-border",
    modalContent: "flex items-center justify-center",
    modalBackdrop:
      "!bg-background/60 backdrop-blur-[2px] fixed inset-0 flex items-center justify-center z-[9999]",
    modalCloseButton: "!text-primary !hover:text-secondary transition-colors !border-none !ring-none",

    footer: "!hidden",
    footerInternal: "!hidden",
    watermark: "hidden",
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
