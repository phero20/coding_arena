"use client";

import { useMemo } from "react";

export function useMonacoConfig(wordWrap: boolean = false) {
  const options = useMemo(() => ({
    minimap: { enabled: false },
    fontSize: 14,
    lineNumbers: "on" as const,
    roundedSelection: true,
    scrollBeyondLastLine: false,
    readOnly: false,
    automaticLayout: true,
    fontFamily: "var(--font-mono)",
    padding: { top: 16 },
    cursorSmoothCaretAnimation: "on" as const,
    cursorBlinking: "smooth" as const,
    smoothScrolling: true,
    wordWrap: wordWrap ? ("on" as const) : ("off" as const),
    wrappingIndent: "indent" as const,
  }), [wordWrap]);

  return options;
}
