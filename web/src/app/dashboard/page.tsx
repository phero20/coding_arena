"use client";

import React from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { useCurrentUser } from "@/hooks/use-current-user";

const DashboardPage = () => {
  const { isLoaded, user } = useUser();
  const { backendUser, isLoading: isSyncingUser } = useCurrentUser();

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const displayName =
    backendUser?.username || user?.username || user?.firstName || "Profile";
  const email =
    backendUser?.email || user?.primaryEmailAddress?.emailAddress || "";

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-8">
      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-12">
        <h1 className="text-2xl font-bold tracking-tighter italic">
          CODING<span className="text-primary">ARENA</span>
        </h1>
        <div className="flex items-center gap-6">
          <Link
            href="/profile"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {displayName}
          </Link>
          <SignOutButton>
            <button className="text-sm bg-secondary border border-border px-4 py-2 rounded-lg hover:bg-secondary/80 transition-all text-secondary-foreground">
              Sign Out
            </button>
          </SignOutButton>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="md:col-span-2 p-8 rounded-2xl bg-linear-to-br from-primary/10 to-accent/10 border border-border shadow-2xl backdrop-blur-xl">
            <h2 className="text-4xl font-extrabold mb-2">
              Welcome back, {displayName || "Contender"}!
            </h2>
            <p className="text-muted-foreground text-lg mb-6">
              {isSyncingUser
                ? "Syncing your profile with the arena..."
                : "You are currently logged in with "}
              {!isSyncingUser && email && (
                <>
                  {" "}
                  <span className="font-mono">{email}</span>. Ready for your
                  next battle?
                </>
              )}
            </p>
            <div className="flex gap-4">
              <Link
                href="/arena"
                className="bg-primary hover:opacity-90 text-primary-foreground px-6 py-3 rounded-xl font-bold transition-all shadow-[0_0_20px_rgba(var(--primary-rgb),0.4)]"
              >
                Enter Arena
              </Link>
              <Link
                href="/practice"
                className="bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border px-6 py-3 rounded-xl font-bold transition-all"
              >
                Practice Mode
              </Link>
            </div>
          </div>

          {/* Stats Card */}
          <div className="p-8 rounded-2xl bg-card border border-border shadow-2xl">
            <h3 className="text-sm font-bold mb-6 text-muted-foreground uppercase tracking-widest">
              Quick Stats
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground text-sm">
                  Arena Rank
                </span>
                <span className="font-mono text-primary font-bold">#1,234</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground text-sm">Win Rate</span>
                <span className="font-mono text-primary font-bold">68%</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                <span className="text-muted-foreground text-sm">Total XP</span>
                <span className="font-mono text-primary font-bold">12,450</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
