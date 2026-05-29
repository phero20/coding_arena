"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
<<<<<<< HEAD
=======
import Image from "next/image";
>>>>>>> prod-deploy
import { usePathname } from "next/navigation";
import { Container } from "@/components/shared/Container";
import { cn } from "@/lib/utils";
import { NavLinks, navItems } from "./NavLinks";
import { NavbarActions } from "./NavbarActions";
import { MobileMenu } from "./MobileMenu";
<<<<<<< HEAD
=======
import { UserSearch } from "./UserSearch";
import { shouldHide } from "./shouldHide";
>>>>>>> prod-deploy

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
<<<<<<< HEAD
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
=======
    const handleScroll = () => setScrolled(window.scrollY > 20);
>>>>>>> prod-deploy
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

<<<<<<< HEAD
  // List of paths where the Navbar should be hidden
  const HIDDEN_NAVBAR_PATHS = ["/problem/", "/arena/match", "/compiler"];

  const shouldHideNavbar = HIDDEN_NAVBAR_PATHS.some((path) =>
    pathname.startsWith(path),
  );

  if (shouldHideNavbar) return null;

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "py-3 bg-background/80 border-b border-border/40 backdrop-blur-xl"
          : "py-5 bg-transparent border-b border-transparent",
      )}
    >
      <Container className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight">
            SlaveCode<span className="text-primary">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavLinks />
          <div className="h-4 w-[1px] bg-border/50 mx-2" />
          <NavbarActions />
        </div>

        {/* Mobile Menu & Toggle */}
        <MobileMenu navItems={navItems} pathname={pathname} />
      </Container>
    </nav>
=======


  if (shouldHide(pathname)) return null;

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-background",
          scrolled
            ? "py-2  border-b border-border"
            : "py-3 border-b border-transparent",
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
>>>>>>> prod-deploy
  );
};
