"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppearanceSection } from "./AppearanceSection";
import { EditorSection } from "./EditorSection";
import { ProfileSection } from "./ProfileSection";
import { Paintbrush, Code, User } from "lucide-react";

export const SettingsTabs = () => {
  return (
    <Tabs defaultValue="appearance" className="w-full">
      <TabsList className="grid w-full grid-cols-3 bg-muted/30 border border-border p-1 h-auto mb-8">
        <TabsTrigger 
          value="appearance" 
          className="flex items-center gap-2 py-3 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
        >
          <Paintbrush size={16} />
          <span className="hidden sm:inline">Appearance</span>
        </TabsTrigger>
        <TabsTrigger 
          value="editor" 
          className="flex items-center gap-2 py-3 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
        >
          <Code size={16} />
          <span className="hidden sm:inline">Editor</span>
        </TabsTrigger>
        <TabsTrigger 
          value="profile" 
          className="flex items-center gap-2 py-3 data-[state=active]:bg-card data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
        >
          <User size={16} />
          <span className="hidden sm:inline">Profile</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="appearance" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <AppearanceSection />
      </TabsContent>
      
      <TabsContent value="editor" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <EditorSection />
      </TabsContent>
      
      <ProfileSection />
    </Tabs>
  );
};
