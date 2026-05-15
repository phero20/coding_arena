"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TabsContent } from "@/components/ui/tabs";
import {
  User,
  Code,
  Github,
  Linkedin,
  ShieldCheck,
  Settings,
  Loader2,
  Code2,
} from "lucide-react";
import { useUpdateProfileMutation } from "@/hooks/queries/use-profile.mutations";
import { useClerk } from "@clerk/nextjs";

import { useProfileSettingsForm } from "@/hooks/profile/use-profile-settings-form";

interface ProfileSettingsTabProps {
  currentUsername: string;
  githubUsername?: string | null;
  linkedinUsername?: string | null;
  leetcodeUsername?: string | null;
  value?: string;
}

export function ProfileSettingsTab({
  currentUsername,
  githubUsername,
  linkedinUsername,
  leetcodeUsername,
  value = "settings",
}: ProfileSettingsTabProps) {
  const { openUserProfile } = useClerk();

  const { values, isDirty, isLoading, handleChange, handleSave } =
    useProfileSettingsForm({
      currentUsername,
      initialValues: {
        githubUsername,
        linkedinUsername,
        leetcodeUsername,
      },
    });

  return (
    <TabsContent
      value={value}
      className="mt-0 focus-visible:ring-0 animate-in fade-in slide-in-from-bottom-4 duration-500"
    >
      <div className="space-y-6">
        <Card className="bg-card border-border/50 overflow-hidden">
          <div className="p-6 border-b border-border/50 bg-muted/20">
            <div className="flex items-center gap-3">
                <User className="text-primary" size={24} />
              <div>
                <h3 className="text-base font-bold uppercase tracking-tight">
                  Public Profile
                </h3>
                <p className="text-xs text-muted-foreground">
                  Manage your social identity.
                </p>
              </div>
            </div>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label
                    htmlFor="leetcode"
                    className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider text-muted-foreground"
                  >
                    <Code2 size={12} /> LeetCode Username
                  </Label>
                  <Input
                    id="leetcode"
                    placeholder="Your LeetCode ID"
                    value={values.leetcodeUsername}
                    onChange={(e) =>
                      handleChange("leetcodeUsername", e.target.value)
                    }
                    className="bg-muted/50 border-border/50 focus-visible:ring-primary/50 "
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="github"
                    className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider text-muted-foreground"
                  >
                    <Github size={12} /> GitHub Username
                  </Label>
                  <Input
                    id="github"
                    placeholder="Your GitHub ID"
                    value={values.githubUsername}
                    onChange={(e) =>
                      handleChange("githubUsername", e.target.value)
                    }
                    className="bg-muted/50 border-border/50 focus-visible:ring-primary/50"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="linkedin"
                    className="flex items-center gap-2 font-bold text-[10px] uppercase tracking-wider text-muted-foreground"
                  >
                    <Linkedin size={12} /> LinkedIn Username
                  </Label>
                  <Input
                    id="linkedin"
                    placeholder="Your LinkedIn Profile ID"
                    value={values.linkedinUsername}
                    onChange={(e) =>
                      handleChange("linkedinUsername", e.target.value)
                    }
                    className="bg-muted/50 border-border/50 focus-visible:ring-primary/50"
                  />
                </div>
              </div>

              <div className="flex justify-start pt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="px-8"
                  disabled={!isDirty || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50 overflow-hidden">
          <div className="p-6 border-b border-border/50 bg-muted/20">
            <div className="flex items-center gap-3">
                <ShieldCheck className="text-primary" size={24} />
              <div>
                <h3 className="text-base font-bold uppercase tracking-tight">
                  Account Security
                </h3>
                <p className="text-xs text-muted-foreground">
                  Manage your identity, security, and authentication methods.
                </p>
              </div>
            </div>
          </div>
          <CardContent className="p-4 space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-4 border border-border/50 rounded-xl bg-muted/5">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  Update your username, email, and password through our secure
                  auth provider.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="font-bold uppercase text-[10px] tracking-widest gap-2 p-4"
                onClick={() => openUserProfile()}
              >
                <Settings size={14} />
                Manage Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  );
}
