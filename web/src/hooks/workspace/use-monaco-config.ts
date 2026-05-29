"use client";

import { useMemo } from "react";

<<<<<<< HEAD
export function useMonacoConfig(wordWrap: boolean = false) {
  const options = useMemo(() => ({
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: "on" as const,
=======
interface EditorPreferences {
  wordWrap: boolean;
  fontSize: number;
  tabSize: number;
  minimap: boolean;
  lineNumbers: "on" | "off";
  fontLigatures: boolean;
  cursorStyle: "line" | "block" | "underline" | "line-thin" | "block-outline" | "underline-thin";
  cursorBlinking: "blink" | "smooth" | "phase" | "expand" | "solid";
  bracketPairColorization: boolean;
  renderWhitespace: "none" | "boundary" | "selection" | "trailing" | "all";
  smoothScrolling: boolean;
  lineHeight: number;
  autoClosingBrackets: "always" | "languageDefined" | "beforeWhitespace" | "never";
}

export function useMonacoConfig(preferences: EditorPreferences) {
  const options = useMemo(() => ({
    minimap: { enabled: preferences.minimap },
    fontSize: preferences.fontSize,
    tabSize: preferences.tabSize,
    lineNumbers: preferences.lineNumbers as any,
>>>>>>> prod-deploy
    roundedSelection: true,
    scrollBeyondLastLine: false,
    readOnly: false,
    automaticLayout: true,
    fontFamily: "var(--font-mono)",
<<<<<<< HEAD
    padding: { top: 16 },
    cursorSmoothCaretAnimation: "on" as const,
    cursorBlinking: "smooth" as const,
    smoothScrolling: true,
    wordWrap: wordWrap ? ("on" as const) : ("off" as const),
    wrappingIndent: "indent" as const,
  }), [wordWrap]);
=======
    fontLigatures: preferences.fontLigatures,
    padding: { top: 16 },
    cursorStyle: preferences.cursorStyle as any,
    cursorBlinking: preferences.cursorBlinking as any,
    cursorSmoothCaretAnimation: "on" as const,
    smoothScrolling: preferences.smoothScrolling,
    lineHeight: preferences.lineHeight,
    renderWhitespace: preferences.renderWhitespace as any,
    "bracketPairColorization.enabled": preferences.bracketPairColorization,
    autoClosingBrackets: preferences.autoClosingBrackets as any,
    wordWrap: preferences.wordWrap ? ("on" as const) : ("off" as const),
    wrappingIndent: "indent" as const,
  }), [preferences]);
>>>>>>> prod-deploy

  return options;
}
