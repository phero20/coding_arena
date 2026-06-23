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
    headerTitle:
      "text-2xl font-bold tracking-tight !text-foreground after:content-['SlaveCode'] after:text-primary after:ml-2",
    headerSubtitle: "text-base !text-muted-foreground",
    socialButtonsBlockButton:
      "!bg-card !text-foreground !border-border !py-3 transition-all",
    formButtonPrimary:
      "bg-primary !text-primary-foreground hover:opacity-90 transition-opacity",
    formFieldLabel: "!text-foreground",
    formFieldInput: "!bg-input !text-foreground !border-border placeholder:!text-muted-foreground",
    dividerText: "!text-muted-foreground",
    dividerLine: "!bg-border",
    footerActionLink: "text-primary hover:text-primary/80",
    userButtonPopoverCard: "bg-card border border-border",
    modalContent: "flex items-center justify-center",
    modalBackdrop:
      "!bg-background/60 backdrop-blur-[2px] fixed inset-0 flex items-center justify-center z-[9999]",
    modalCloseButton: "!text-primary !hover:text-secondary transition-colors !border-none !ring-none",
    badge: "!bg-primary/10 !text-primary !border !border-primary/30",

    footer: "!hidden",
    footerInternal: "!hidden",
    watermark: "hidden",
    profilePage: "!text-foreground",
    pageScrollBox: "!text-foreground",
    profileSection: "!text-foreground",
    userButtonPopoverActionButton: "!text-foreground",
        // The main titles like "Profile" or "Email addresses"
    profileSectionTitleText: "!text-foreground",
    
    // The actual values (like your username or email)
     profileSectionContent: "!text-foreground [&_p]:!text-foreground [&_span]:!text-foreground",
        // Catches the specific field labels and values
    profileSectionItemTitleText: "!text-foreground",
    profileSectionItemValue: "!text-foreground",

    // The big username/email at the top
    userPreviewMainIdentifier: "!text-foreground font-semibold",
    userPreviewSecondaryIdentifier: "!text-foreground",
    
    // The sidebar navigation links
    navbarButton: "!text-foreground aria-[current='page']:!text-primary data-[active='true']:!text-primary !border !border-input !bg-background  !hover:bg-accent hover:!text-primary/80 !mt-1",

    // The breadcrumbs at the top (e.g., Account > Security)
    breadcrumbsItem: "!text-foreground",
    breadcrumbsItemDivider: "!text-foreground",
    navbar: "bg-transparent [&_h1]:!text-foreground [&_p]:!text-muted-foreground",

    // The "Update" or "Edit" buttons inside the sections
        // The "Update" buttons on the right side
    profileSectionPrimaryButton: "!border !border-input !bg-background  !hover:bg-accent !hover:text-accent-foreground",
        // This forces all paragraphs and spans inside the profile sections to be visible
   

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
