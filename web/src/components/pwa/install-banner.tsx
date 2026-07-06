"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { X, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker to satisfy PWA criteria
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registered successfully with scope:", registration.scope);
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error);
        });
    }

    // 2. Listen for the native PWA install prompt event
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile automatically
      e.preventDefault();

      // Check cooldown
      const dismissedDate = localStorage.getItem('pwa_banner_dismissed_date');
      const today = new Date().toDateString();
      if (dismissedDate === today) {
        // Already dismissed today, don't show banner again until tomorrow
        return;
      }

      // Stash the event so it can be triggered later when the user clicks our button.
      setDeferredPrompt(e);
      // Show our custom React banner
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Auto-hide the banner after 30 seconds if the user ignores it
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (showBanner) {
      timeoutId = setTimeout(() => {
        setShowBanner(false);
      }, 20000); // 30 seconds
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [showBanner]);

  const handleInstallClick = async () => {
    setShowBanner(false);
    if (!deferredPrompt) return;

    // Trigger the native OS install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the native prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    // Save today's date in local storage
    const today = new Date().toDateString();
    localStorage.setItem('pwa_banner_dismissed_date', today);
    
    // User dismissed our custom banner
    setShowBanner(false);
  };

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed top-20 z-[100] w-[calc(100%-2rem)] max-w-md left-1/2 -translate-x-1/2 md:left-auto md:right-6 md:translate-x-0 "
        >
          <Card className="">
            <CardContent className="p-3 flex items-center gap-4">
              <Download className="w-6 h-6 text-primary" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">Install SlaveCode</h3>
                <p className="text-sm text-muted-foreground truncate">Get the full app experience on your device</p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleInstallClick} className="font-semibold">
                  Install
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground" onClick={handleDismiss}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
