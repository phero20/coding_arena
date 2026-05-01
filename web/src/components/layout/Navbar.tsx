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
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // List of paths where the Navbar should be hidden
  const HIDDEN_NAVBAR_PATHS = ["/problems/", "/arena/match", "/compilers"];

  const shouldHideNavbar = HIDDEN_NAVBAR_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  if (shouldHideNavbar) return null;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "py-2 bg-background border-b border-border"
          : "py-3 bg-background border-b border-transparent",
      )}
    >
      <Container className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="SlaveCode Logo"
            width={52}
            height={40}
            className="object-contain -mr-2"
          />
          <span className="text-xl font-bold tracking-tight">
            SlaveCode<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Actions Container */}
        <div className="flex items-center gap-2 md:gap-4">
          {/* Desktop Only Links */}
          <div className="hidden md:flex items-center gap-6 mr-2">
            <NavLinks />
            <div className="h-4 w-px bg-border/50 mx-2" />
          </div>

          {/* Search: Desktop Only */}
          <div className="hidden md:block">
            <UserSearch />
          </div>

          {/* Desktop Only Actions */}
          <div className="hidden md:block">
            <NavbarActions />
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <MobileMenu navItems={navItems} pathname={pathname} />
          </div>
        </div>
      </Container>
    </nav>
  );
};
