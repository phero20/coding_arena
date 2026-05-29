import React from 'react';
import { SystemDesignIcon } from './system-design-icon';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export function SystemDesignAbout() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Left Side: Text */}
        <div className="space-y-8 order-2 lg:order-1">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-[1.1]">
              Master the Architecture of <span className="text-primary">Scale</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl">
              Dive deep into the core components that power the modern web. Whether you are preparing for a FAANG interview or building your next startup, our platform provides the ultimate architecture toolkit.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <p className="text-[17px] text-foreground/90">Key Features:</p>
            <ul className="list-disc pl-5 space-y-3 text-muted-foreground text-[17px]">
              <li>
                <strong className="text-foreground">56 In-Depth Topics:</strong> Learn everything from basic caching and load balancing to complex distributed architectures.
              </li>
              <li>
                <strong className="text-foreground">Interactive Workspaces:</strong> A dedicated space to freely draw, experiment, and design your own real-world architectures.
              </li>
              <li>
                <strong className="text-foreground">Massive Icon Library:</strong> An infinite canvas giving you full control with over 3,900+ modern tech icons.
              </li>
              <li>
                <strong className="text-foreground">AI Drawing Generation:</strong> Utilize basic AI diagram generation to accelerate your architecture design process.
              </li>
              <li>
                <strong className="text-foreground">And Many More Features:</strong> Dive in to discover real-world case studies, math rendering, and highly optimized diagrams.
              </li>
            </ul>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-4">
            <Button size="lg" className="px-8 h-14 text-base rounded-lg" asChild>
              <Link href="/systemdesign/learn">
                Start Learning <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="px-8 h-14 text-base rounded-lg border-primary text-primary hover:bg-primary/10" asChild>
              <Link href="/systemdesign/workspace">
                Open Workspace
              </Link>
            </Button>
          </div>
        </div>

        {/* Right Side: Icon */}
        <div className="flex justify-center lg:justify-end relative order-1 lg:order-2">
          {/* TO CONTROL SIZE: Adjust the 'w-[...]' (width) values below! */}
          <SystemDesignIcon className="w-72 sm:w-80 md:w-96 lg:w-120 xl:w-150 2xl:w-162.5 h-auto origin-center lg:origin-right transition-all duration-300" />
        </div>
      </div>
    </div>
  );
}
