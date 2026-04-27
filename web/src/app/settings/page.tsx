import React from "react";
import { Container } from "@/components/shared/Container";
import { SettingsTabs } from "@/components/settings/SettingsTabs";
import { Settings } from "lucide-react";

const SettingsPage = () => {
  return (
    <div className="min-h-screen bg-background pt-24 pb-12">
      <Container className="max-w-4xl">
        <div className="mb-10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
              <Settings size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-foreground">
                Settings
              </h1>
              <p className="text-muted-foreground">
                Configure your tactical environment and account preferences.
              </p>
            </div>
          </div>
          <div className="h-px w-full bg-gradient-to-r from-border via-border/50 to-transparent" />
        </div>

        <SettingsTabs />
      </Container>
    </div>
  );
};

export default SettingsPage;
