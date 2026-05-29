<<<<<<< HEAD
import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground">
      <h2 className="text-4xl font-bold">404 - Arena Not Found</h2>
      <p className="mt-4 text-muted-foreground">It seems you've wandered out of bounds.</p>
      <Link href="/" className="mt-6 rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
        Return Home
      </Link>
=======
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="flex flex-col items-center text-center space-y-6 max-w-md">
        <div className="space-y-2">
          <h1 className="text-6xl font-bold tracking-tighter">404</h1>
          <h2 className="text-2xl font-semibold tracking-tight">Page Not Found</h2>
          <p className="text-muted-foreground">
            The page you are looking for does not exist or has been moved to a new location.
          </p>
        </div>

        <Button asChild className="rounded-md px-8 font-medium">
          <Link href="/" className="flex items-center gap-2">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </Button>
      </div>
>>>>>>> prod-deploy
    </div>
  );
}
