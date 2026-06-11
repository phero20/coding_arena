"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Container } from "@/components/shared/Container";
import { cn } from "@/lib/utils";
import { NavLinks, navItems } from "./NavLinks";
import { NavbarActions } from "./NavbarActions";
import { MobileMenu } from "./MobileMenu";
import { UserSearch } from "./UserSearch";
import { shouldHide } from "./shouldHide";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);



  if (shouldHide(pathname)) return null;

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-100",
          pathname === "/" && !scrolled && !isMobileMenuOpen ? "bg-transparent" : "bg-background",
          scrolled
            ? "py-2  border-b border-border"
            : "py-3 border-b border-transparent",
        )}
      >
        <Container className="mx-auto flex px-2 items-center justify-between">
          {/* Brand Logo */}
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

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center gap-2 2xl:gap-5">
            <NavLinks />
            <div className="h-4 w-px bg-border/50" />
            <UserSearch />
            <NavbarActions />
          </div>

          {/* Mobile Profile/Menu Trigger */}
          <div className="xl:hidden flex items-center gap-2">
            <MobileMenu 
              navItems={navItems} 
              pathname={pathname} 
              isOpen={isMobileMenuOpen} 
              setIsOpen={setIsMobileMenuOpen} 
            />
          </div>
        </Container>
      </nav>
    </>
  );
};
