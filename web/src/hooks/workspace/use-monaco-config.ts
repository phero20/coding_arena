"use client";

import { useMemo } from "react";

interface EditorPreferences {
  wordWrap: boolean;
  fontSize: number;
  tabSize: number;
  minimap: boolean;
  lineNumbers: "on" | "off";
  fontLigatures: boolean;
  cursorStyle:
    | "line"
    | "block"
    | "underline"
    | "line-thin"
    | "block-outline"
    | "underline-thin";
  cursorBlinking: "blink" | "smooth" | "phase" | "expand" | "solid";
  bracketPairColorization: boolean;
  renderWhitespace: "none" | "boundary" | "selection" | "trailing" | "all";
  smoothScrolling: boolean;
  lineHeight: number;
  autoClosingBrackets:
    | "always"
    | "languageDefined"
    | "beforeWhitespace"
    | "never";
}

export function useMonacoConfig(preferences: EditorPreferences) {
  const options = useMemo(
    () => ({
      minimap: { enabled: preferences.minimap },
      fontSize: preferences.fontSize,
      tabSize: preferences.tabSize,
      lineNumbers: preferences.lineNumbers as any,
      roundedSelection: true,
      scrollBeyondLastLine: false,
      readOnly: false,
      automaticLayout: true,
      fontFamily: "var(--font-mono)",
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
    }),
    [preferences],
  );

  return options;
}
