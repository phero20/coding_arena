"use client";

import React from "react";
import { useTheme } from "next-themes";
import { Check, Zap, Terminal, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const THEMES = [
  {
    id: "dark",
    name: "Lime Dark",
    description: "The original tactical look with lime accents.",
    icon: Zap,
    color: "rgb(175, 243, 62)",
  },
  {
    id: "theme-neutral",
    name: "Neutral Zinc",
    description: "High-contrast monochrome for deep focus.",
    icon: Terminal,
    color: "rgb(229, 229, 229)",
  },
  {
    id: "theme-bubble-gum",
    name: "Bubble Gum",
    description: "Vibrant neo-brutalism with pink & yellow.",
    icon: Palette,
    color: "rgb(251, 226, 167)",
  },
];

export const AppearanceSection = () => {
  const { theme, setTheme } = useTheme();

  const handleSetTheme = (newTheme: string) => {
    if (!(document as any).startViewTransition) {
      setTheme(newTheme);
      return;
    }

    document.documentElement.classList.add("transitioning-theme");
    const transition = (document as any).startViewTransition(() => {
      setTheme(newTheme);
    });

    transition.finished.finally(() => {
      document.documentElement.classList.remove("transitioning-theme");
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Theme Selection</h3>
        <p className="text-sm text-muted-foreground">
          Choose a tactical skin that suits your coding environment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {THEMES.map((t) => (
          <Card
            key={t.id}
            className={cn(
              "relative cursor-pointer border-2 transition-all duration-300 hover:border-primary/50 overflow-hidden group",
              theme === t.id ? "border-primary bg-primary/5 shadow-[0_0_20px_rgba(var(--primary),0.1)]" : "border-border bg-card/40"
            )}
            onClick={() => handleSetTheme(t.id)}
          >
            <div 
              className="absolute top-0 right-0 w-16 h-16 opacity-10 group-hover:opacity-20 transition-opacity translate-x-4 -translate-y-4"
              style={{ color: t.color }}
            >
              <t.icon size={64} />
            </div>

            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <t.icon size={16} style={{ color: t.color }} />
                {t.name}
              </CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                {t.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-4 h-4 rounded-full bg-background border border-border" />
                  <div className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: t.color }} />
                  <div className="w-4 h-4 rounded-full bg-muted border border-border" />
                </div>
                {theme === t.id && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground animate-in zoom-in duration-300">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
