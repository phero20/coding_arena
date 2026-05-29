<<<<<<< HEAD
import React from 'react';

const SettingsPage = () => {
  return (
    <div className='flex min-h-screen items-center justify-center bg-black text-white p-4 font-sans'>
      <div className='text-center space-y-4'>
        <h1 className='text-5xl font-extrabold tracking-tighter sm:text-7xl bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent'>
          SettingsPage
        </h1>
        <p className='text-lg text-gray-400'>
          Dynamic Route: /settings
        </p>
        <div className='mt-8 h-1 w-24 bg-blue-500 mx-auto rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]'></div>
      </div>
=======
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
            
            <div className="flex items-center gap-3 text-primary">

                <Settings size={40} />
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

        <React.Suspense fallback={<div className="h-100 w-full bg-muted/20 rounded-xl" />}>
          <SettingsTabs />
        </React.Suspense>
      </Container>
>>>>>>> prod-deploy
    </div>
  );
};

export default SettingsPage;
