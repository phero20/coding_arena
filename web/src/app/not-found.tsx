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
    </div>
  );
}
