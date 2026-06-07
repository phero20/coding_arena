"use client";

import { useTheme } from "next-themes";
import { Check, Palette } from "lucide-react";
import { cn } from "@/lib/utils";


const THEMES = [
  {
    id: "dark",
    name: "Lime Dark",
    description: "The original tactical look with lime accents.",
    accent: "#14532d",
    bg: "#020617",
    secondary: "#1e293b",
  },
  {
    id: "theme-neutral",
    name: "Neutral Zinc",
    description: "High-contrast monochrome for deep focus.",
    accent: "#404040",
    bg: "#0a0a0a",
    secondary: "#262626",
  },
  {
    id: "theme-bubble-gum",
    name: "Bubble Gum",
    description: "Vibrant neo-brutalism with pink & yellow.",
    accent: "#c67b96",
    bg: "#12242e",
    secondary: "#1a1a1a",
  },
  {
    id: "theme-twitter",
    name: "Twitter",
    description: "Classic high-contrast dark with blue accents.",
    accent: "rgb(28, 156, 240)",
    bg: "rgb(0, 0, 0)",
    secondary: "rgb(23, 24, 28)",
  },
  {
    id: "theme-claude",
    name: "Claude",
    description: "Warm earthy tones with orange accents.",
    accent: "rgb(217, 119, 87)",
    bg: "rgb(38, 38, 36)",
    secondary: "rgb(44, 44, 43)",
  },
  {
    id: "theme-astro-vista",
    name: "Astro Vista",
    description: "Deep grey space vibes with sunset orange accents.",
    accent: "rgb(223, 96, 53)",
    bg: "rgb(26, 26, 26)",
    secondary: "rgb(32, 32, 32)",
  },
  {
    id: "theme-chalk",
    name: "Chalk",
    description: "Deep slate blue with chalk white accents.",
    accent: "rgb(215, 223, 229)",
    bg: "rgb(20, 29, 43)",
    secondary: "rgb(26, 37, 51)",
  },
  {
    id: "theme-sandstone",
    name: "Sandstone",
    description: "Warm charcoal with gold-ochre accents.",
    accent: "rgb(196, 151, 42)",
    bg: "rgb(26, 26, 25)",
    secondary: "rgb(27, 27, 25)",
  },
  {
    id: "theme-cyber-yellow",
    name: "Cyber Yellow",
    description: "Midnight black with high-voltage yellow accents.",
    accent: "rgb(255, 216, 31)",
    bg: "rgb(9, 9, 9)",
    secondary: "rgb(18, 18, 18)",
  },
  {
    id: "theme-meridian",
    name: "Meridian",
    description: "A tactical dark theme with refreshing cyan accents.",
    accent: "rgb(107, 141, 184)",
    bg: "rgb(20, 23, 28)",
    secondary: "rgb(28, 32, 39)",
  },
  {
    id: "theme-discord",
    name: "Discord",
    description: "The classic Discord dark mode theme.",
    accent: "rgb(88, 101, 242)",
    bg: "rgb(26, 26, 30)",
    secondary: "rgb(36, 36, 41)",
  },
  {
    id: "theme-royal-gold",
    name: "Royal Gold",
    description: "A majestic deep blue and vibrant gold theme.",
    accent: "rgb(255, 224, 102)",
    bg: "rgb(24, 26, 36)",
    secondary: "rgb(35, 36, 58)",
  },
];

const ThemePreview = ({
  accent,
  bg,
  secondary,
  active,
}: {
  accent: string;
  bg: string;
  secondary: string;
  active: boolean;
}) => (
  <div
    className={cn(
      "relative w-full aspect-video rounded-lg overflow-hidden border transition-all duration-500",
      active ? "border-primary/50 shadow-lg" : "border-border/40",
    )}
    style={{ backgroundColor: bg }}
  >
    {/* Mock Header */}
    <div
      className="h-3 w-full border-b border-white/5 flex items-center px-1.5 gap-1"
      style={{ backgroundColor: secondary }}
    >
      <div className="size-1 rounded-full bg-white/10" />
      <div className="size-1 rounded-full bg-white/10" />
      <div className="size-1 rounded-full bg-white/10" />
    </div>

    <div className="flex h-full">
      {/* Mock Sidebar */}
      <div
        className="w-6 h-full border-r border-white/5 p-1 space-y-1"
        style={{ backgroundColor: secondary }}
      >
        <div className="h-1 w-full rounded-sm bg-white/5" />
        <div className="h-1 w-3/4 rounded-sm bg-white/5" />
        <div className="h-1 w-full rounded-sm bg-white/5" />
        <div
          className="mt-4 size-2 rounded-full mx-auto"
          style={{ backgroundColor: accent, opacity: 0.4 }}
        />
      </div>

      {/* Mock Content / Code */}
      <div className="flex-1 p-2 space-y-1.5">
        <div className="flex items-center gap-1.5 mb-2">
          <div
            className="h-1.5 w-12 rounded-full"
            style={{ backgroundColor: accent, opacity: 0.8 }}
          />
          <div className="h-1.5 w-6 rounded-full bg-white/5" />
        </div>
        <div className="space-y-1">
          <div className="h-1 w-full rounded-full bg-white/5" />
          <div className="h-1 w-[90%] rounded-full bg-white/5" />
          <div className="h-1 w-[95%] rounded-full bg-white/5" />
          <div className="flex gap-1">
            <div
              className="h-1 w-4 rounded-full"
              style={{ backgroundColor: accent, opacity: 0.6 }}
            />
            <div className="h-1 w-12 rounded-full bg-white/5" />
          </div>
          <div className="h-1 w-[85%] rounded-full bg-white/5" />
        </div>
      </div>
    </div>

    {/* Selection Overlay */}
    {active && (
      <div className="absolute inset-0 bg-primary/5 flex items-center justify-center backdrop-blur-[1px] animate-in fade-in duration-300">
        <div className="bg-primary text-primary-foreground p-1 rounded-full shadow-xl scale-110">
          <Check size={14} strokeWidth={4} />
        </div>
      </div>
    )}
  </div>
);

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
    <div className="max-w-4xl space-y-10">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Palette className="text-primary size-5" />
          <h3 className="text-md font-bold text-foreground">Theme Selection</h3>
        </div>
        <p className="text-xs text-muted-foreground">
          Choose a tactical skin that suits your coding environment.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {THEMES.map((t) => (
          <div
            key={t.id}
            className="group cursor-pointer space-y-3"
            onClick={() => handleSetTheme(t.id)}
          >
            <ThemePreview
              accent={t.accent}
              bg={t.bg}
              secondary={t.secondary}
              active={theme === t.id}
            />

            <div className="px-1">
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "text-xs font-bold transition-colors uppercase tracking-widest",
                    theme === t.id ? "text-primary" : "text-foreground/70",
                  )}
                >
                  {t.name}
                </span>

              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-1">
                {t.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
