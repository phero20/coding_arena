"use client";

import Link from "next/link";
import { Rocket, Github, Twitter, Youtube, Globe, Mail } from "lucide-react";
import { Container } from "@/components/shared/Container";
import { PUBLIC_CONFIG } from "@/config/public.config";
import { Button } from "@/components/ui/button";

export const LandingFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Platform",
      links: [
        { label: "Compiler", href: "/compiler" },
        { label: "The Arena", href: "/arena" },
        { label: "Challenges", href: "/problem" },
        { label: "Leaderboard", href: "/leaderboard" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "#" },
        { label: "Community", href: "#" },
        { label: "Support", href: "#" },
        { label: "API", href: "#" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Us", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Brand", href: "#" },
        { label: "Contact", href: "#" },
      ],
    },
  ];

  return (
    <footer className="relative border-t border-border/40 bg-background/50 backdrop-blur-sm pt-20 pb-10 overflow-hidden">
      {/* Decorative Blur */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-10 md:gap-12 mb-20">
          {/* Brand Section */}
          <div className="col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex items-center justify-center size-8 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Rocket className="size-4 text-primary group-hover:rotate-12 transition-transform duration-500" />
              </div>
              <span className="text-sm font-black uppercase tracking-[0.2em] text-foreground">
                {PUBLIC_CONFIG.SITE_NAME}
              </span>
            </Link>
            <p className="text-xs font-medium text-muted-foreground leading-relaxed max-w-sm">
              The ultimate high-fidelity technical arena. Build, compete, and 
              dominate in a world-class coding environment designed for the elite.
            </p>
            <div className="flex items-center gap-3">
              <a href={PUBLIC_CONFIG.REPO_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="icon" className="size-8 rounded-lg border-border/40 bg-card/50 hover:bg-primary/10 hover:text-primary transition-all">
                  <Github className="size-3.5" />
                </Button>
              </a>
              <Button variant="outline" size="icon" className="size-8 rounded-lg border-border/40 bg-card/50 hover:bg-primary/10 hover:text-primary transition-all">
                <Twitter className="size-3.5" />
              </Button>
              <Button variant="outline" size="icon" className="size-8 rounded-lg border-border/40 bg-card/50 hover:bg-primary/10 hover:text-primary transition-all">
                <Mail className="size-3.5" />
              </Button>
            </div>
          </div>

          {/* Links Sections */}
          {footerSections.map((section) => (
            <div key={section.title} className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
                {section.title}
              </h4>
              <ul className="space-y-4">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[11px] font-bold text-muted-foreground/70 hover:text-primary transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1 h-px bg-primary/0 group-hover:bg-primary transition-all duration-300" />
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-10 border-t border-border/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
            <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">
              © {currentYear} {PUBLIC_CONFIG.SITE_NAME}
            </span>
            <Link href="#" className="text-[10px] font-bold text-muted-foreground/40 hover:text-muted-foreground uppercase tracking-widest transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="text-[10px] font-bold text-muted-foreground/40 hover:text-muted-foreground uppercase tracking-widest transition-colors">
              Terms of Service
            </Link>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border/40 bg-card/50">
            <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              System Operational
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
};
