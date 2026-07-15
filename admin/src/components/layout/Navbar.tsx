"use client";

import { SignInButton, useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LogIn, LogOut, Menu } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { NavLinks, navItems } from "./NavLinks";

export function Navbar() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const pathname = usePathname();
  
  // Keep track of scroll position for the show/hide effect
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine if page has been scrolled down
      setScrolled(currentScrollY > 10);

      // Show/Hide behavior (Bonus feature)
      // Only hide the navbar if scrolled past 100px to avoid jumpiness at the very top
      if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
        setVisible(false);
      } else {
        setVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check on mount
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={cn(
        // Floating Layout & Animation
        "sticky top-2 z-50 mx-2 mt-2 rounded-2xl",
        "flex items-center justify-between transition-all duration-300 ease-in-out",
        "px-4 md:px-8 xl:px-12",
        
        // Hide/Show dynamic transforms
        visible ? "translate-y-0 opacity-100" : "-translate-y-24 opacity-0 pointer-events-none",
        
        // Glassmorphism Background Selection
        pathname === "/" && !scrolled && !mobileMenuOpen
          ? "bg-transparent border-transparent"
          : "bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60",
        
        // Interactive Padding, Border, & Shadow depending on scroll state
        scrolled
          ? "py-3 border border-border/50 shadow-lg"
          : "py-5 border border-transparent"
      )}
    >
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Menu Trigger */}
        <div className="lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-9 w-9 p-0 -ml-2 rounded-full hover:bg-primary/10 transition-colors"
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="w-full pt-16 pb-8 max-h-[85vh] overflow-y-auto rounded-b-2xl border-b border-border/50">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
              <div className="flex flex-col gap-6 px-2">
                {navItems.map((item) => (
                  <div key={item.name} className="flex flex-col gap-2">
                    {item.subpages ? (
                      <>
                        <span className="font-bold text-lg text-foreground px-2">{item.name}</span>
                        <div className="flex flex-col border-l-2 border-muted/50 ml-3 pl-4 gap-2 mt-1">
                          {item.subpages.map((sub) => {
                            const isSubActive = pathname === sub.href;
                            return (
                              <Link
                                key={sub.name}
                                href={sub.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                  "py-1.5 text-base transition-colors",
                                  isSubActive ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
                                )}
                              >
                                {sub.name}
                              </Link>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={cn(
                          "px-2 py-1.5 text-lg font-bold transition-colors",
                          pathname === item.href ? "text-primary" : "text-foreground"
                        )}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Premium Interactive Logo */}
        <Link 
          href="/" 
          className="group flex items-center gap-2 transition-transform duration-300 hover:scale-[1.02]"
        >
          <Image
            src="/logos/logo.png"
            alt="SlaveCode Admin Logo"
            width={40}
            height={40}
            className="object-contain transition-transform duration-300 group-hover:rotate-3"
          />
          <span className="text-xl font-extrabold tracking-tight text-foreground">
            SlaveCode<span className="text-primary">.</span>Admin
          </span>
        </Link>
      </div>

      <div className="hidden lg:flex items-center flex-1 justify-center px-6">
        <NavLinks />
      </div>
      
      <div className="flex items-center gap-4">
        {/* Modern Sign In Button */}
        {isLoaded && !isSignedIn && (
          <SignInButton mode="modal">
            <Button 
              size="sm" 
              variant="default"
              className="rounded-full px-5 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <LogIn className="size-4 mr-2" />
              Sign in
            </Button>
          </SignInButton>
        )}

        {/* Modern Animated Avatar & Dropdown */}
        {isLoaded && isSignedIn && (
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <Avatar className="h-10 w-10 ring-2 ring-primary/10 hover:ring-primary/30 transition-all duration-300 cursor-pointer">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                <AvatarFallback className="bg-primary/10 text-primary uppercase font-bold text-xs">
                  {user?.fullName?.slice(0, 2) || "AD"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl border border-border/50 shadow-lg">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1.5">
                  <p className="text-sm font-semibold leading-none">{user?.fullName || "Administrator"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive rounded-lg m-1"
                onClick={() => signOut({ redirectUrl: "/" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </nav>
  );
}
