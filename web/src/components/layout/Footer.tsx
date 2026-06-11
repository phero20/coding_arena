"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "../shared/Container";
import Image from "next/image";
import { shouldHide, shouldHidefooter } from "./shouldHide";
import { Bug } from "lucide-react";

const footerLinks = [
  {
    title: "Learn & Practice",
    links: [
      { label: "Academy", href: "/academy/tracks" },
      { label: "Problems", href: "/problems" },
      { label: "Roadmap", href: "/roadmap" },
      { label: "System Design", href: "/systemdesign-workspace" },
    ],
  },
  {
    title: "Compete & Tools",
    links: [
      { label: "Arena", href: "/arena" },
      { label: "Contests", href: "/contests" },
      { label: "Compilers", href: "/compilers" },
    ],
  },
  {
    title: "Legal & Support",
    links: [
      { label: "Report an Issue", href: "/report-bug", icon: <Bug className="w-4 h-4 text-difficulty-medium" /> },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Contact Us", href: "mailto:slavecode.codes@gmail.com" },
    ],
  },
];

export const Footer = () => {
  const pathname = usePathname();

  if (shouldHide(pathname) || shouldHidefooter(pathname)) return null;

  return (
    <footer className="w-full border-t border-border bg-background py-10 md:py-16">
      <Container className="">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand & Description */}
          <div className="md:col-span-2 space-y-3">
           <Link href="/" className="flex items-center group">
            <Image
              src="/logos/logo.png"
              alt="SlaveCode Logo"
              width={50}
              height={40}
              className="object-contain -mr-1"
            />
            <span className="text-xl font-bold tracking-tight">
              SlaveCode<span className="text-primary">.</span>
            </span>
          </Link>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Standardize your coding journey. From basic academy courses and
              guided roadmaps to advanced system design, company interview prep,
              and real-time coding arenas. The all-in-one platform to master
              algorithms and prove your engineering excellence.
            </p>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4 className="font-semibold mb-4 text-foreground">
                {section.title}
              </h4>
              <ul className="space-y-3 text-sm text-muted-foreground">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      title={link.label}
                      className={`hover:text-primary transition-colors ${
                        link.icon ? "flex items-center gap-2" : ""
                      }`}
                    >
                      {link.icon && link.icon}
                      {link.icon ? <span>{link.label}</span> : link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} SlaveCode. All rights reserved.</p>
          <div className="flex gap-6">
            {/* <Link href="#" title="Twitter" className="hover:text-primary transition-colors font-medium">Twitter</Link>
            <Link href="#" title="GitHub" className="hover:text-primary transition-colors font-medium">GitHub</Link>
            <Link href="#" title="Discord" className="hover:text-primary transition-colors font-medium">Discord</Link> */}
          </div>
        </div>
      </Container>
    </footer>
  );
};
