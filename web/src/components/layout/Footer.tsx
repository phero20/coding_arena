"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "../shared/Container";
import Image from "next/image";
import { shouldHide, shouldHidefooter } from "./shouldHide";

export const Footer = () => {
  const pathname = usePathname();


  if (shouldHide(pathname) || shouldHidefooter(pathname)) return null;

  return (
    <footer className="w-full border-t border-border bg-background py-10 md:py-16">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Description */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <Image src="/logo.png" alt="SlaveCode Logo" width={32} height={32} className="rounded-md" />
              <span className="font-bold text-xl tracking-tight text-foreground group-hover:text-primary transition-colors">
                SlaveCode
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              The ultimate coding arena to practice, compete, and master your skills in modern programming languages.
            </p>
          </div>

          {/* Links: Learn & Practicee */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Learn & Practice</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/academy/tracks" className="hover:text-primary transition-colors">Academy</Link></li>
              <li><Link href="/problems" className="hover:text-primary transition-colors">Problems</Link></li>
              <li><Link href="/roadmap" className="hover:text-primary transition-colors">Roadmap</Link></li>
              <li><Link href="/systemdesign-workspace" className="hover:text-primary transition-colors">System Design</Link></li>
            </ul>
          </div>

          {/* Links: Compete & Tools */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Compete & Tools</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/arena" className="hover:text-primary transition-colors">Arena</Link></li>
              <li><Link href="/contests" className="hover:text-primary transition-colors">Contests</Link></li>
              <li><Link href="/compilers" className="hover:text-primary transition-colors">Compilers</Link></li>
            </ul>
          </div>

          {/* Links: Legal & Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Legal & Support</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link href="mailto:support@slavecode.com" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SlaveCode. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-primary transition-colors font-medium">Twitter</Link>
            <Link href="#" className="hover:text-primary transition-colors font-medium">GitHub</Link>
            <Link href="#" className="hover:text-primary transition-colors font-medium">Discord</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
};
