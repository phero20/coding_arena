"use client";


import Link from "next/link";
import { motion } from "framer-motion";
import {
  Swords,
  Code2,
  Trophy,
  Rocket,
  ChevronRight,
  Github,
  Star,
  Zap,
  Shield,
  Globe,
  Activity
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Container } from "@/components/shared/Container";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Real-time Arena",
    description: "Battle against other developers in instant coding matches.",
    icon: Swords,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    title: "Refactor Challenges",
    description: "Improve existing code and earn points for elegance.",
    icon: Zap,
    color: "text-amber-500",
    bg: "bg-amber-500/10",
  },
  {
    title: "Global Leaderboards",
    description: "Climb the ranks and show the world your true skill level.",
    icon: Trophy,
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
  {
    title: "Secure Environment",
    description: "Sandboxed execution ensures safe and fair competition.",
    icon: Shield,
    color: "text-purple-500",
    bg: "bg-purple-500/10",
  },
];

export default function HomePage() {
  return (
    <div className="relative min-h-screen bg-background selection:bg-primary/30 selection:text-primary overflow-x-hidden">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-20" />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.4, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none"
          />
        </div>

        <Container className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              v1.0 is now live
            </div>
            <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 leading-[0.9]">
              CODE. BATTLE.
              <br />
              <span className="text-transparent bg-clip-text bg-linear-to-b from-primary to-primary/60">
                CONQUER THE ARENA.
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-muted-foreground text-lg md:text-xl mb-12 leading-relaxed">
              The ultimate platform for competitive programmers. Solve complex
              problems in real-time, climb the global leaderboard, and prove
              your engineering excellence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="h-14 px-10 text-lg font-bold rounded-2xl shadow-xl shadow-primary/20 gap-2"
                >
                  Start Fighting <Rocket className="h-5 w-5" />
                </Button>
              </Link>
              <Link href="/watch">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 px-10 text-lg font-bold rounded-2xl bg-background/50 backdrop-blur-sm gap-2"
                >
                  Watch Live <Activity className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Features Grid */}
      <section className="py-24 border-t border-border/40 relative">
        <Container>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative p-8 rounded-3xl border border-border/50 bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 shadow-sm"
              >
                <div
                  className={cn(
                    "inline-flex p-3 rounded-2xl mb-6 transition-transform group-hover:scale-110 duration-300",
                    feature.bg,
                  )}
                >
                  <feature.icon className={cn("h-6 w-6", feature.color)} />
                </div>
                <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </Container>
      </section>

      {/* Stats/Social Proof */}
      <section className="py-24 bg-primary/5 border-y border-border/40 overflow-hidden relative">
        <Container className="relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-black mb-2">50k+</div>
              <div className="text-muted-foreground font-medium uppercase tracking-widest text-xs">
                Active Combatants
              </div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black mb-2">1.2M</div>
              <div className="text-muted-foreground font-medium uppercase tracking-widest text-xs">
                Matches Played
              </div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black mb-2">180+</div>
              <div className="text-muted-foreground font-medium uppercase tracking-widest text-xs">
                Countries
              </div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-black mb-2">99.9%</div>
              <div className="text-muted-foreground font-medium uppercase tracking-widest text-xs">
                Uptime
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Footer-lite */}
      <footer className="py-12 border-t border-border/40">
        <Container className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            <span className="font-bold tracking-tighter">CODINGARENA</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <Link
              href="/terms"
              className="hover:text-primary transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hover:text-primary transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/support"
              className="hover:text-primary transition-colors"
            >
              Support
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Button size="icon" variant="ghost" className="rounded-full">
              <Github className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="ghost" className="rounded-full">
              <Globe className="h-5 w-5" />
            </Button>
          </div>
        </Container>
      </footer>
    </div>
  );
}
