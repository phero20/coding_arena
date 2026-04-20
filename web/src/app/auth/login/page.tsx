import React from "react";
import { SignIn } from "@clerk/nextjs";

const LoginPage = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 font-sans overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tighter text-foreground sm:text-4xl">
            Welcome to <span className="text-primary">Coding Arena</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Join the battle and prove your skills
          </p>
        </div>

        <SignIn
          appearance={{
            elements: {
              formButtonPrimary:
                "bg-primary text-primary-foreground hover:opacity-90 text-sm normal-case h-10 transition-all",
              card: "bg-card/50 border border-border shadow-2xl backdrop-blur-xl",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton:
                "bg-secondary border border-border text-secondary-foreground hover:bg-secondary/80 h-10 transition-all",
              socialButtonsBlockButtonText:
                "text-secondary-foreground font-medium",
              dividerLine: "bg-border",
              dividerText: "text-muted-foreground",
              formFieldLabel: "text-muted-foreground font-medium mb-1",
              formFieldInput:
                "bg-secondary/50 border border-border text-foreground h-10 focus:border-primary/50 transition-all",
              footerActionText: "text-muted-foreground",
              footerActionLink: "text-primary hover:underline font-medium",
              identityPreviewText: "text-foreground",
              identityPreviewEditButtonIcon: "text-primary",
            },
          }}
          routing="path"
          path="/auth/login"
          signUpUrl="/auth/register"
        />
      </div>
    </div>
  );
};

export default LoginPage;
