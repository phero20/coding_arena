"use client";

import { useEffect, useState } from "react";
import { Grid3X3, Eye, Zap, Keyboard, HelpCircle } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface SettingsPanelProps {
  editor: any;
}

export function SettingsPanel({ editor }: SettingsPanelProps) {
  const [gridMode, setGridMode] = useState(false);
  const [snapMode, setSnapMode] = useState(false);
  const [handMode, setHandMode] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  const getSnapModeValue = () => {
    if (!editor) return false;
    if (editor.user?.getIsSnapMode) return editor.user.getIsSnapMode();
    if (editor.getIsSnapMode) return editor.getIsSnapMode();
    if (editor.getInstanceState()?.isSnapMode !== undefined) {
      return editor.getInstanceState().isSnapMode;
    }
    return false;
  };

  // Sync initial state from tldraw instance
  useEffect(() => {
    if (!editor) return;

    // Get initial values
    setGridMode(editor.getInstanceState().isGridMode === true);
    setSnapMode(getSnapModeValue());
    setHandMode(editor.getCurrentToolId() === "hand");

    // Listen to editor changes to keep toggles in sync reactively
    const listener = () => {
      setGridMode(editor.getInstanceState().isGridMode === true);
      setSnapMode(getSnapModeValue());
      setHandMode(editor.getCurrentToolId() === "hand");
    };

    editor.on("change", listener);
    return () => {
      editor.off("change", listener);
    };
  }, [editor]);

  const handleToggleGrid = (checked: boolean) => {
    if (!editor) return;
    editor.updateInstanceState({ isGridMode: checked });
    setGridMode(checked);
  };

  const handleToggleSnap = (checked: boolean) => {
    if (!editor) return;
    if (editor.user?.updateUserPreferences) {
      editor.user.updateUserPreferences({ isSnapMode: checked });
    } else if (editor.updateOptions) {
      editor.updateOptions({ isSnapMode: checked });
    } else if (editor.updateInstanceState) {
      editor.updateInstanceState({ isSnapMode: checked });
    }
    setSnapMode(checked);
  };

  const handleToggleHand = (checked: boolean) => {
    if (!editor) return;
    editor.setCurrentTool(checked ? "hand" : "select");
    setHandMode(checked);
  };

  const preferencesShortcuts = [
    { key: "Ctrl + /", desc: "Toggle dark mode" },
    { key: "Ctrl + .", desc: "Toggle focus mode" },
    { key: "Ctrl + '", desc: "Toggle grid" },
  ];

  const toolsShortcuts = [
    { key: "Q", desc: "Toggle tool lock" },
    { key: "Ctrl + U", desc: "Upload media..." },
    { key: "V", desc: "Select tool" },
    { key: "D", desc: "Draw tool" },
    { key: "E", desc: "Eraser tool" },
    { key: "H", desc: "Hand tool" },
    { key: "R", desc: "Rectangle shape" },
    { key: "O", desc: "Ellipse shape" },
    { key: "A", desc: "Arrow link shape" },
    { key: "L", desc: "Line connector" },
    { key: "T", desc: "Text box" },
    { key: "F", desc: "Frame layout" },
    { key: "N", desc: "Sticky note" },
    { key: "K", desc: "Laser pointer" },
    { key: ",", desc: "Pointer down" },
  ];

  const editShortcuts = [
    { key: "Ctrl + Z", desc: "Undo last edit" },
    { key: "Ctrl + Shift + Z", desc: "Redo last edit" },
    { key: "Ctrl + X", desc: "Cut selection" },
    { key: "Ctrl + C", desc: "Copy selection" },
    { key: "Ctrl + V", desc: "Paste selection" },
    { key: "Ctrl + A", desc: "Select all shapes" },
    { key: "Backspace", desc: "Delete selection" },
    { key: "Ctrl + D", desc: "Duplicate shape" },
  ];

  const viewShortcutsList = [
    { key: "Z", desc: "Zoom tool" },
    { key: "Ctrl + =", desc: "Zoom in" },
    { key: "Ctrl + -", desc: "Zoom out" },
    { key: "Shift + 0", desc: "Zoom to 100%" },
    { key: "Shift + 1", desc: "Zoom to fit" },
    { key: "Shift + 2", desc: "Zoom to selection" },
    { key: "Shift + Z", desc: "Quick zoom" },
  ];

  const transformShortcuts = [
    { key: "]", desc: "Bring to front" },
    { key: "Alt + ]", desc: "Bring forward" },
    { key: "Alt + [", desc: "Send backward" },
    { key: "[", desc: "Send to back" },
    { key: "Ctrl + G", desc: "Group shapes" },
    { key: "Ctrl + Shift + G", desc: "Ungroup shapes" },
    { key: "Shift + H", desc: "Flip horizontally" },
    { key: "Shift + V", desc: "Flip vertically" },
    { key: "Alt + W", desc: "Align top" },
    { key: "Alt + V", desc: "Align vertically" },
    { key: "Alt + S", desc: "Align bottom" },
    { key: "Alt + A", desc: "Align left" },
    { key: "Alt + H", desc: "Align horizontally" },
    { key: "Alt + D", desc: "Align right" },
  ];

  const formattingShortcuts = [
    { key: "Ctrl + B", desc: "Bold text format" },
    { key: "Ctrl + I", desc: "Italic text format" },
    { key: "Ctrl + E", desc: "Code syntax block" },
    { key: "Ctrl + Shift + H", desc: "Highlight text block" },
    { key: "Ctrl + Shift + S", desc: "Strikethrough block" },
    { key: "Ctrl + Shift + K", desc: "Hyperlink format" },
    { key: "Ctrl + Alt + 1-6", desc: "Header sizes" },
    { key: "Ctrl + Shift + 7", desc: "Ordered list" },
    { key: "Ctrl + Shift + 8", desc: "Bulleted list" },
  ];

  const shapeActionShortcuts = [
    { key: "Ctrl + Enter", desc: "Adjust shape styles" },
    { key: "Ctrl + Shift + Enter", desc: "Context menu..." },
    { key: "↑ ↓ → ←", desc: "Move shape" },
    { key: "Shift + ↑ ↓ → ←", desc: "Move shape faster" },
    { key: "Shift + >", desc: "Rotate clockwise" },
    { key: "Shift + Alt + >", desc: "Rotate CW (fine)" },
    { key: "Shift + <", desc: "Rotate counterclockwise" },
    { key: "Shift + Alt + <", desc: "Rotate CCW (fine)" },
    { key: "Ctrl + Alt + Shift + =", desc: "Enlarge shape" },
    { key: "Ctrl + Alt + Shift + -", desc: "Shrink shape" },
    { key: "Alt + R", desc: "Repeat shape" },
    { key: "Ctrl + Alt + /", desc: "Keyboard shortcuts..." },
  ];

  const accessibilityShortcuts = [
    { key: "Tab", desc: "Select next shape" },
    { key: "Ctrl + ↑ ↓ → ←", desc: "Select in direction" },
    { key: "Ctrl + Shift + ↑ ↓", desc: "Enter/leave container" },
    { key: "Space + ↑ ↓ → ←", desc: "Pan viewport camera" },
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Settings Header */}
      <div className="px-4 py-3 flex flex-col gap-1 border-b shrink-0 bg-card select-none">
        <span className="text-xs font-semibold leading-tight text-foreground">
          Canvas Settings
        </span>
        <span className="text-[10px] text-muted-foreground mt-0.5">
          Configure board preferences & shortcuts
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Board Preferences */}
        <div className="space-y-3.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground select-none">
            <Eye className="h-3.5 w-3.5" />
            Preferences
          </div>

          <div className="space-y-3">
            {/* Grid Toggle */}
            <div className="flex items-center justify-between gap-4 p-2 rounded border bg-muted/20">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <Grid3X3 className="h-3.5 w-3.5 text-muted-foreground" />
                  Grid Alignment
                </span>
                <span className="text-[10px] text-muted-foreground leading-normal">
                  Show background snapping grids
                </span>
              </div>
              <Switch checked={gridMode} onCheckedChange={handleToggleGrid} />
            </div>

            {/* Snapping Toggle */}
            <div className="flex items-center justify-between gap-4 p-2 rounded border bg-muted/20">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                  Object Snapping
                </span>
                <span className="text-[10px] text-muted-foreground leading-normal">
                  Snap objects to aligned edges
                </span>
              </div>
              <Switch checked={snapMode} onCheckedChange={handleToggleSnap}  />
            </div>

            {/* Hand tool Toggle */}
            <div className="flex items-center justify-between gap-4 p-2 rounded border bg-muted/20">
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold flex items-center gap-1.5">
                  <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                  Hand Tool Mode
                </span>
                <span className="text-[10px] text-muted-foreground leading-normal">
                  Pan around board without selecting
                </span>
              </div>
              <Switch checked={handMode} onCheckedChange={handleToggleHand} />
            </div>
          </div>
        </div>

        <Separator />

        {/* Shortcuts Reference */}
        <div className="space-y-4 select-none">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
            <Keyboard className="h-3.5 w-3.5" />
            Keyboard Shortcuts Reference
          </div>

          <div className="space-y-4">
            {/* Tools Group */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block border-b pb-0.5">
                🎨 Tools
              </span>
              <div className="border rounded bg-muted/10 divide-y overflow-hidden">
                {toolsShortcuts.map((s) => (
                  <div key={s.desc} className="flex items-center justify-between gap-3 p-1.5 text-[10px] hover:bg-muted/30 transition-colors">
                    <span className="text-muted-foreground font-medium">{s.desc}</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[9px] font-bold text-foreground">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Preferences Group */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block border-b pb-0.5">
                ⚙️ Preferences
              </span>
              <div className="border rounded bg-muted/10 divide-y overflow-hidden">
                {preferencesShortcuts.map((s) => (
                  <div key={s.desc} className="flex items-center justify-between gap-3 p-1.5 text-[10px] hover:bg-muted/30 transition-colors">
                    <span className="text-muted-foreground font-medium">{s.desc}</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[9px] font-bold text-foreground">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* View Group */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block border-b pb-0.5">
                🔍 View & Zoom
              </span>
              <div className="border rounded bg-muted/10 divide-y overflow-hidden">
                {viewShortcutsList.map((s) => (
                  <div key={s.desc} className="flex items-center justify-between gap-3 p-1.5 text-[10px] hover:bg-muted/30 transition-colors">
                    <span className="text-muted-foreground font-medium">{s.desc}</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[9px] font-bold text-foreground">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit Group */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block border-b pb-0.5">
                ✏️ Edit & History
              </span>
              <div className="border rounded bg-muted/10 divide-y overflow-hidden">
                {editShortcuts.map((s) => (
                  <div key={s.desc} className="flex items-center justify-between gap-3 p-1.5 text-[10px] hover:bg-muted/30 transition-colors">
                    <span className="text-muted-foreground font-medium">{s.desc}</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[9px] font-bold text-foreground">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Transform Group */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block border-b pb-0.5">
                ⚡ Transform & Align
              </span>
              <div className="border rounded bg-muted/10 divide-y overflow-hidden">
                {transformShortcuts.map((s) => (
                  <div key={s.desc} className="flex items-center justify-between gap-3 p-1.5 text-[10px] hover:bg-muted/30 transition-colors">
                    <span className="text-muted-foreground font-medium">{s.desc}</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[9px] font-bold text-foreground">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Shape Actions Group */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block border-b pb-0.5">
                📦 Shape Actions
              </span>
              <div className="border rounded bg-muted/10 divide-y overflow-hidden">
                {shapeActionShortcuts.map((s) => (
                  <div key={s.desc} className="flex items-center justify-between gap-3 p-1.5 text-[10px] hover:bg-muted/30 transition-colors">
                    <span className="text-muted-foreground font-medium">{s.desc}</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[9px] font-bold text-foreground">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Formatting Group */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block border-b pb-0.5">
                📝 Text Formatting
              </span>
              <div className="border rounded bg-muted/10 divide-y overflow-hidden">
                {formattingShortcuts.map((s) => (
                  <div key={s.desc} className="flex items-center justify-between gap-3 p-1.5 text-[10px] hover:bg-muted/30 transition-colors">
                    <span className="text-muted-foreground font-medium">{s.desc}</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[9px] font-bold text-foreground">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            {/* Accessibility Group */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block border-b pb-0.5">
                ♿ Focus & Camera
              </span>
              <div className="border rounded bg-muted/10 divide-y overflow-hidden">
                {accessibilityShortcuts.map((s) => (
                  <div key={s.desc} className="flex items-center justify-between gap-3 p-1.5 text-[10px] hover:bg-muted/30 transition-colors">
                    <span className="text-muted-foreground font-medium">{s.desc}</span>
                    <kbd className="px-1.5 py-0.5 rounded bg-muted border font-mono text-[9px] font-bold text-foreground">
                      {s.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
