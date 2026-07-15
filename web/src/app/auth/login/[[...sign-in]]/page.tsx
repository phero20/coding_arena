import { SignIn, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { SignInSkeleton } from "@/components/skeletons";

const LoginPage = () => {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background p-4 font-sans overflow-hidden">


      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tighter text-foreground sm:text-4xl">
            Welcome to <span className="text-primary">SlaveCode</span>
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        <ClerkLoading>
          <SignInSkeleton />
        </ClerkLoading>
        
        <ClerkLoaded>
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
        </ClerkLoaded>
      </div>
    </div>
  );
};

export default LoginPage;
