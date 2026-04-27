"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code2, Type, Keyboard, Space } from "lucide-react";

export const EditorSection = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Editor Preferences</h3>
        <p className="text-sm text-muted-foreground">
          Fine-tune your coding environment for maximum efficiency.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Keybindings */}
        <Card className="border-border bg-card/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Keyboard size={16} className="text-primary" />
              Keybindings
            </CardTitle>
            <CardDescription className="text-xs">
              Choose your preferred editor interaction model.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select defaultValue="standard">
              <SelectTrigger className="w-full bg-background/50 border-border">
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="standard">Standard (VS Code)</SelectItem>
                <SelectItem value="vim">Vim Mode</SelectItem>
                <SelectItem value="emacs">Emacs Mode</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Font Size */}
        <Card className="border-border bg-card/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Type size={16} className="text-primary" />
              Font Size (px)
            </CardTitle>
            <CardDescription className="text-xs">
              Adjust the editor text size for better readability.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="number"
                defaultValue={14}
                min={8}
                max={32}
                className="bg-background/50 border-border focus-visible:ring-primary/30"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tab Size */}
        <Card className="border-border bg-card/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Space size={16} className="text-primary" />
              Tab Size
            </CardTitle>
            <CardDescription className="text-xs">
              Define the number of spaces for indentation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select defaultValue="2">
              <SelectTrigger className="w-full bg-background/50 border-border">
                <SelectValue placeholder="Spaces" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="2">2 Spaces</SelectItem>
                <SelectItem value="4">4 Spaces</SelectItem>
                <SelectItem value="8">8 Spaces</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Auto Close Brackets */}
        <Card className="border-border bg-card/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Code2 size={16} className="text-primary" />
              IntelliSense
            </CardTitle>
            <CardDescription className="text-xs">
              Enable smart completions and bracket pairing.
            </CardDescription>
          </CardHeader>
          <CardContent>
             <Select defaultValue="on">
              <SelectTrigger className="w-full bg-background/50 border-border">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="on">Enabled (Fastest)</SelectItem>
                <SelectItem value="limited">Limited</SelectItem>
                <SelectItem value="off">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
