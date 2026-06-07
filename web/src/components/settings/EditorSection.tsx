"use client";

import React from "react";
import {
  Card,
  CardContent,
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



import { useEditorStore } from "@/store/use-editor-store";
import { Switch } from "@/components/ui/switch";
import { 
  Code2, 
  Type, 
  Keyboard, 
  Space, 
  RefreshCw, 
  Terminal, 
  MousePointer2, 
  Sparkles, 
  Brackets, 
  Eye, 
  MoveVertical,
  Zap,
  MousePointer,
  ListOrdered
} from "lucide-react";
import { Separator } from "@/components/ui/separator";

export const EditorSection = () => {
  const { preferences, setPreference, toggleWordWrap } = useEditorStore();

  // Defensive defaults for legacy localStorage data
  const fontSize = preferences?.fontSize ?? 14;
  const tabSize = preferences?.tabSize ?? 2;
  const wordWrap = preferences?.wordWrap ?? true;
  const lineNumbers = preferences?.lineNumbers ?? "on";
  const minimap = preferences?.minimap ?? false;
  const fontLigatures = preferences?.fontLigatures ?? true;
  const cursorStyle = preferences?.cursorStyle ?? "line";
  const cursorBlinking = preferences?.cursorBlinking ?? "smooth";
  const bracketPairColorization = preferences?.bracketPairColorization ?? true;
  const renderWhitespace = preferences?.renderWhitespace ?? "none";
  const smoothScrolling = preferences?.smoothScrolling ?? true;
  const lineHeight = preferences?.lineHeight ?? 22;
  const autoClosingBrackets = preferences?.autoClosingBrackets ?? "always";

  const SettingRow = ({ 
    icon: Icon, 
    label, 
    description, 
    children 
  }: { 
    icon: any, 
    label: string, 
    description: string, 
    children: React.ReactNode 
  }) => (
    <div className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
      <div className="flex items-start gap-4 max-w-[70%]">
        <div className="p-2 rounded-md bg-primary/5 text-primary/70 shrink-0 mt-0.5">
          <Icon size={16} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-foreground leading-none">{label}</h4>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{description}</p>
        </div>
      </div>
      <div className="shrink-0 ml-4">
        {children}
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl space-y-8 pb-10">
      {/* Category: Typography & Spacing */}
      <Card className="border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
          <div className="flex items-center gap-2">
            <Type size={16} className="text-primary" />
            <CardTitle className="text-sm font-black uppercase tracking-widest">Typography & Spacing</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-0">
          <SettingRow 
            icon={Type} 
            label="Font Size" 
            description="Adjust the size of the editor text in pixels for optimal clarity."
          >
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={fontSize}
                onChange={(e) => setPreference("fontSize", parseInt(e.target.value) || 14)}
                min={8}
                max={32}
                className="bg-background/50 border-border/60 focus-visible:ring-primary/30 w-[80px] h-8 text-xs font-bold"
              />
              <span className="text-[10px] text-muted-foreground uppercase font-black opacity-40">PX</span>
            </div>
          </SettingRow>
          
          <Separator className="bg-border/20" />
          
          <SettingRow 
            icon={MoveVertical} 
            label="Line Height" 
            description="Control the vertical space between lines of code (Standard: 22px)."
          >
            <Input
              type="number"
              value={lineHeight}
              onChange={(e) => setPreference("lineHeight", parseInt(e.target.value) || 22)}
              min={12}
              max={50}
              className="bg-background/50 border-border/60 focus-visible:ring-primary/30 w-[80px] h-8 text-xs font-bold"
            />
          </SettingRow>

          <Separator className="bg-border/20" />

          <SettingRow 
            icon={Space} 
            label="Tab Size" 
            description="Specify how many spaces each tab character should represent."
          >
            <Select value={tabSize.toString()} onValueChange={(v) => setPreference("tabSize", parseInt(v))}>
              <SelectTrigger className="w-[120px] bg-background/50 border-border/60 h-8 text-xs font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/40">
                <SelectItem value="2">2 Spaces</SelectItem>
                <SelectItem value="4">4 Spaces</SelectItem>
                <SelectItem value="8">8 Spaces</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          <Separator className="bg-border/20" />

          <SettingRow 
            icon={Keyboard} 
            label="Font Ligatures" 
            description="Enable stylistic symbol combinations (like => or ===) in compatible fonts."
          >
            <Switch checked={fontLigatures} onCheckedChange={(v) => setPreference("fontLigatures", v)} />
          </SettingRow>
        </CardContent>
      </Card>

      {/* Category: Cursor & Animation */}
      <Card className="border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
          <div className="flex items-center gap-2">
            <MousePointer2 size={16} className="text-primary" />
            <CardTitle className="text-sm font-black uppercase tracking-widest">Cursor & Animation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-0">
          <SettingRow 
            icon={MousePointer} 
            label="Cursor Style" 
            description="Choose the visual appearance of the editor insertion point."
          >
            <Select value={cursorStyle} onValueChange={(v: any) => setPreference("cursorStyle", v)}>
              <SelectTrigger className="w-[140px] bg-background/50 border-border/60 h-8 text-xs font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/40">
                <SelectItem value="line">Line (Default)</SelectItem>
                <SelectItem value="block">Block (Tactical)</SelectItem>
                <SelectItem value="underline">Underline</SelectItem>
                <SelectItem value="line-thin">Line Thin</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          <Separator className="bg-border/20" />

          <SettingRow 
            icon={Sparkles} 
            label="Cursor Blinking" 
            description="Customize the animation behavior of the cursor for better focus."
          >
            <Select value={cursorBlinking} onValueChange={(v: any) => setPreference("cursorBlinking", v)}>
              <SelectTrigger className="w-[140px] bg-background/50 border-border/60 h-8 text-xs font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/40">
                <SelectItem value="smooth">Smooth (Premium)</SelectItem>
                <SelectItem value="blink">Standard Blink</SelectItem>
                <SelectItem value="solid">No Animation</SelectItem>
                <SelectItem value="expand">Expand (Wide)</SelectItem>
                <SelectItem value="phase">Phase (Pulse)</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>

          <Separator className="bg-border/20" />

          <SettingRow 
            icon={RefreshCw} 
            label="Smooth Scrolling" 
            description="Enable inertial physics when navigating through long source files."
          >
            <Switch checked={smoothScrolling} onCheckedChange={(v) => setPreference("smoothScrolling", v)} />
          </SettingRow>
        </CardContent>
      </Card>

      {/* Category: Visual Architecture */}
      <Card className="border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-primary" />
            <CardTitle className="text-sm font-black uppercase tracking-widest">Visual Architecture</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-0">
          <SettingRow 
            icon={ListOrdered} 
            label="Line Numbers" 
            description="Toggle the vertical line counter on the left side of the editor."
          >
            <Switch checked={lineNumbers === "on"} onCheckedChange={(v) => setPreference("lineNumbers", v ? "on" : "off")} />
          </SettingRow>

          <Separator className="bg-border/20" />

          <SettingRow 
            icon={Terminal} 
            label="Minimap" 
            description="Display a high-level visual overview of the entire file on the right."
          >
            <Switch checked={minimap} onCheckedChange={(v) => setPreference("minimap", v)} />
          </SettingRow>

          <Separator className="bg-border/20" />

          <SettingRow 
            icon={RefreshCw} 
            label="Word Wrap" 
            description="Automatically break long lines to fit within the editor viewport."
          >
            <Switch checked={wordWrap} onCheckedChange={toggleWordWrap} />
          </SettingRow>

          <Separator className="bg-border/20" />

          <SettingRow 
            icon={Eye} 
            label="Render Whitespace" 
            description="Visualize hidden characters like spaces and tabs for precise formatting."
          >
            <Select value={renderWhitespace} onValueChange={(v: any) => setPreference("renderWhitespace", v)}>
              <SelectTrigger className="w-[140px] bg-background/50 border-border/60 h-8 text-xs font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/40">
                <SelectItem value="none">Hidden</SelectItem>
                <SelectItem value="boundary">Boundaries</SelectItem>
                <SelectItem value="all">All Visible</SelectItem>
                <SelectItem value="trailing">Trailing Only</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </CardContent>
      </Card>

      {/* Category: Editor Intelligence */}
      <Card className="border-border/40 bg-card/30 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/40 py-4">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-primary" />
            <CardTitle className="text-sm font-black uppercase tracking-widest">Editor Intelligence</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-0">
          <SettingRow 
            icon={Brackets} 
            label="Bracket Colorization" 
            description="Automatically color-match bracket pairs for better structural visibility."
          >
            <Switch checked={bracketPairColorization} onCheckedChange={(v) => setPreference("bracketPairColorization", v)} />
          </SettingRow>

          <Separator className="bg-border/20" />

          <SettingRow 
            icon={Code2} 
            label="Auto Closing" 
            description="Automatically insert matching brackets and quotes as you type."
          >
            <Select value={autoClosingBrackets} onValueChange={(v: any) => setPreference("autoClosingBrackets", v)}>
              <SelectTrigger className="w-[160px] bg-background/50 border-border/60 h-8 text-xs font-bold">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/40">
                <SelectItem value="always">Always Enable</SelectItem>
                <SelectItem value="languageDefined">Language Default</SelectItem>
                <SelectItem value="beforeWhitespace">Before White Space</SelectItem>
                <SelectItem value="never">Manual Only</SelectItem>
              </SelectContent>
            </Select>
          </SettingRow>
        </CardContent>
      </Card>
    </div>
  );
};
