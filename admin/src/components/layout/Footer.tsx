import Link from "next/link";
import Image from "next/image";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background py-8 mt-auto z-10 relative">
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Image
            src="/logos/logo.png"
            alt="SlaveCode Admin Logo"
            width={24}
            height={24}
            className="opacity-50 grayscale"
          />
          <span className="text-sm font-medium">
            &copy; {currentYear} SlaveCode Admin. All rights reserved.
          </span>
        </div>
        
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy
          </Link>
          <Link href="/report-bug" className="hover:text-foreground transition-colors">
            Report Bug
          </Link>
        </div>
      </div>
    </footer>
  );
}
