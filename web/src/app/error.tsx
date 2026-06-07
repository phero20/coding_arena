"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RefreshCw, Home, AlertCircle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="flex flex-col items-center text-center space-y-6 max-w-md">
        <div className="flex flex-col items-center space-y-2">
          <div className="p-3 rounded-full bg-destructive/10 text-destructive mb-2">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter">Something went wrong</h1>
          <p className="text-muted-foreground">
            An unexpected error occurred in the application. We've been notified and are looking into it.
          </p>
        </div>

        {error.digest && (
          <div className="px-3 py-1.5 rounded-md bg-muted text-[10px] font-mono text-muted-foreground uppercase tracking-widest">
            Error Digest: {error.digest}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <Button 
            onClick={() => reset()} 
            className="w-full sm:w-auto h-11 px-8 rounded-md font-bold flex items-center gap-2 shadow-lg shadow-primary/10"
          >
            <RefreshCw size={16} />
            Try Again
          </Button>
          <Button 
            variant="outline" 
            asChild 
            className="w-full sm:w-auto h-11 px-8 rounded-md font-bold flex items-center gap-2 border-border/60"
          >
            <Link href="/">
              <Home size={16} />
              Return Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
