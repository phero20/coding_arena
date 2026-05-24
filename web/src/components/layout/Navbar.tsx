"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Container } from "@/components/shared/Container";
import { cn } from "@/lib/utils";
import { NavLinks, navItems } from "./NavLinks";
import { NavbarActions } from "./NavbarActions";
import { MobileMenu } from "./MobileMenu";
import { UserSearch } from "./UserSearch";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const shouldHideNavbar =
    pathname.startsWith("/problems/") ||
    pathname.startsWith("/arena/match") ||
    pathname.startsWith("/compilers") ||
    /^\/systemdesign-workspace\/[^/]+\/diagram\//.test(pathname);

  if (shouldHideNavbar) return null;

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-background",
          scrolled
            ? "py-2  border-b border-border shadow-sm"
            : "py-4 border-b border-transparent",
        )}
      >
        <Container className="flex items-center justify-between">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center group">
            <Image
              src="/logo.png"
              alt="SlaveCode Logo"
              width={50}
              height={40}
              className="object-contain -mr-1"
            />
            <span className="text-xl font-black tracking-tighter">
              SLAVECODE<span className="text-primary">.</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <NavLinks />
            <div className="h-4 w-px bg-border/50" />
            <UserSearch />
            <NavbarActions />
          </div>

          {/* Mobile Profile/Menu Trigger */}
          <div className="lg:hidden flex items-center gap-2">
            <MobileMenu navItems={navItems} pathname={pathname} />
          </div>
        </Container>
      </nav>
    </>
  );
};
