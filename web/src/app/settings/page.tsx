"use client";

import React from "react";
import { Container } from "@/components/shared/Container";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { Settings, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const SettingsPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background pt-20 pb-12">
      <Container className="max-w-7xl">
        <div className="mb-10 space-y-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10  border border-border transition-all"
              onClick={() => router.back()}
              title="Go Back"
            >
              <ChevronLeft size={20} className="text-muted-foreground" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                <Settings size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  Settings
                </h1>
                <p className="text-[11px] text-muted-foreground uppercase font-black tracking-widest opacity-70">
                  Tactical Environment & Preferences
                </p>
              </div>
            </div>
          </div>
          <div className="h-px w-full bg-border/40" />
        </div>

        <SettingsTabs />
      </Container>
    </div>
  );
};

export default SettingsPage;
