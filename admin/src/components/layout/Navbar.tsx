"use client";

import { SignInButton, useUser, useClerk } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
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
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Check on mount
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav 
      className={cn(
        "flex items-center justify-between px-6 transition-all duration-200 sticky top-0 z-50",
        pathname === "/" && !scrolled && !mobileMenuOpen ? "bg-transparent" : "bg-background",
        scrolled
          ? "py-4 border-b border-border shadow-sm"
          : "py-6 border-b border-transparent"
      )}
    >
      <div className="flex items-center gap-2 md:gap-4">
        {/* Mobile Menu Trigger */}
        <div className="lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 p-0 -ml-2">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="top" className="w-full pt-16 pb-8 max-h-[85vh] overflow-y-auto">
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

        <Link href="/" className="flex items-center">
          <Image
            src="/logos/logo.png"
            alt="SlaveCode Admin Logo"
            width={40}
            height={40}
            className="object-contain"
          />
          <span className="text-xl font-bold tracking-tight text-foreground">
            SlaveCode<span className="text-primary">.</span>Admin
          </span>
        </Link>
      </div>

      <div className="hidden lg:flex items-center flex-1 justify-center px-6">
        <NavLinks />
      </div>
      
      <div className="flex items-center gap-4">
        {isLoaded && !isSignedIn && (
          <SignInButton mode="modal">
            <Button size="sm" variant="default">
              <LogIn className="size-4 mr-2" />
              Sign in
            </Button>
          </SignInButton>
        )}

        {isLoaded && isSignedIn && (
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none">
              <Avatar className="h-9 w-9 border border-primary/20 hover:border-primary transition-colors cursor-pointer">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                <AvatarFallback className="bg-primary/10 text-primary uppercase font-bold text-xs">
                  {user?.fullName?.slice(0, 2) || "AD"}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 mt-1">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1.5">
                  <p className="text-sm font-medium leading-none">{user?.fullName || "Administrator"}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.primaryEmailAddress?.emailAddress}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive cursor-pointer focus:bg-destructive/10 focus:text-destructive"
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
