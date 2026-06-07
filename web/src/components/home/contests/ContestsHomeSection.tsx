"use client";

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ContestCard } from '@/components/contests/ContestCard';
import { type Contest } from '@/types/contest';

// Mock contests to showcase the UI
const MOCK_CONTESTS: Contest[] = [
  {
    id: 1,
    clistId: 101,
    title: "Weekly Contest 400",
    description: null,
    platform: "LeetCode",
    icon: "https://upload.wikimedia.org/wikipedia/commons/1/19/LeetCode_logo_black.png",
    startTime: new Date(Date.now() + 86400000 * 2).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 2 + 5400000).toISOString(),
    duration: 5400,
    href: "#",
    resourceId: 1,
    status: 'upcoming',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    clistId: 102,
    title: "Codeforces Round 950 (Div. 2)",
    description: null,
    platform: "Codeforces",
    icon: "https://cdn.iconscout.com/icon/free/png-256/free-codeforces-3628695-3029920.png",
    startTime: new Date(Date.now() + 86400000 * 4).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 4 + 7200000).toISOString(),
    duration: 7200,
    href: "#",
    resourceId: 2,
    status: 'upcoming',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    clistId: 103,
    title: "AtCoder Beginner Contest 350",
    description: null,
    platform: "AtCoder",
    icon: null,
    startTime: new Date(Date.now() + 86400000 * 1).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 1 + 6000000).toISOString(),
    duration: 6000,
    href: "#",
    resourceId: 3,
    status: 'upcoming',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 4,
    clistId: 104,
    title: "Starter 135 (Rated for Div 2 & 3)",
    description: null,
    platform: "CodeChef",
    icon: null,
    startTime: new Date(Date.now() + 86400000 * 3).toISOString(),
    endTime: new Date(Date.now() + 86400000 * 3 + 10800000).toISOString(),
    duration: 10800,
    href: "#",
    resourceId: 4,
    status: 'upcoming',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const ContestsHomeSection = () => {
  return (
    <section className="py-8 w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

        {/* LEFT SIDE: Text content */}
        <div className="flex flex-col items-start text-left max-w-xl">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              <span className="text-primary">Track</span> every coding contest
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed">
              We aggregate all coding contests from across the globe into a single, unified dashboard. Whether it's LeetCode, Codeforces, AtCoder, or CodeChef—view schedules at a glance and register with a single click.
            </p>
          </div>
        </div>

        {/* RIGHT SIDE: Visual representation (Grid of ContestCards) */}
        <div className="relative w-full flex flex-col justify-center">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 relative pointer-events-none pb-12 px-1">
            {MOCK_CONTESTS.slice(0, 2).map((contest) => (
              <ContestCard key={contest.id} contest={contest} />
            ))}
          </div>

          {/* Section Level Fade Overlay */}
          <div className="absolute inset-x-0 bottom-0 h-78 bg-gradient-to-t from-background via-background/95 to-transparent z-10 pointer-events-none" />
          
          <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center z-30">
            <Button
              variant="link"
              className="text-lg font-bold text-primary hover:text-primary/80 gap-2 h-auto p-0"
              asChild
            >
              <Link href="/contests">
                View All Contests <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
          </div>
        </div>

      </div>
    </section>
  );
};
