import { useEffect, useMemo, useCallback } from "react";
import { useEditorStore } from "@/store/use-editor-store";
import { Problem } from "@/types/api";
import { useShallow } from "zustand/react/shallow";

/**
 * Enhanced hook to manage editor state across both Practice and Arena modes.
 * Uses sessionId-based isolation to prevent cross-mode code leakage.
 */
export function useProblemEditor(
  problem: Problem,
  sessionId: string, // Industry Standard: Explicit identity provided by parent
  enforcedLanguage?: string,
  matchId?: string | null, // Still needed for initSession metadata
) {
  // 1. Contextual Verification
  // With explicit sessionId, we no longer "guess" the context inside the hook.
  // This physically prevents practice-to-arena leakage.

  const {
    sessions,
    preferences,
    initSession,
    updateLanguage,
    updateCode: updateStoreCode,
    resetToDefault,
    toggleWordWrap,
    setIsRunning,
    isRunning,
    _hasHydrated,
  } = useEditorStore(
    useShallow((state) => ({
      sessions: state.sessions,
      preferences: state.preferences,
      initSession: state.initSession,
      updateLanguage: state.updateLanguage,
      updateCode: state.updateCode,
      resetToDefault: state.resetToDefault,
      toggleWordWrap: state.toggleWordWrap,
      setIsRunning: state.setIsRunning,
      isRunning: state.isRunning,
      _hasHydrated: state._hasHydrated,
    })),
  );

  const session = sessions[sessionId];

  // 2. Initialize Session
  useEffect(() => {
    if (!_hasHydrated) return;

    // Industry Standard: If the session is marked as 'loading', we REFUSE to initialize.
    // This prevents creating a session with a 'default' language before the mandate arrives.
    if (sessionId.includes(":loading:")) return;

    // With the parent 'key' and ID reset, this will run fresh on every context change.
    if (!session) {
      const snippetLanguages = Object.keys(problem.code_snippets || {});
      const initialLanguage = enforcedLanguage || snippetLanguages[0] || "javascript";
      
      const initialCodes: Record<string, string> = {};
      Object.entries(problem.code_snippets || {}).forEach(([lang, snippet]) => {
        if (snippet) initialCodes[lang] = snippet;
      });

      if (Object.keys(initialCodes).length === 0) {
        initialCodes[initialLanguage] = "// Start coding here...";
      }
      
      // Industrial-Standard Fix: Reset global 'isRunning' state on session switch
      // This prevents stuck states from blocking callbacks in different modes.
      setIsRunning(false);
      initSession(sessionId, initialLanguage, initialCodes, matchId || undefined);
    }
  }, [sessionId, _hasHydrated, enforcedLanguage, problem, initSession, session, matchId, setIsRunning]);

  // 3. Derived States (Strictly State-Driven)
  // Industry Standard: If session is ready, use it. No more render-time "priorities"
  // that cause typing lag or empty snippet submissions.
  const currentLanguage = session?.activeLanguage || (enforcedLanguage || "javascript");
  const currentCode = session?.codes[currentLanguage] || "";

  const handleLanguageChange = useCallback((lang: string) => {
    updateLanguage(sessionId, lang);
  }, [sessionId, updateLanguage]);

  const handleCodeChange = useCallback((code: string) => {
    updateStoreCode(sessionId, currentLanguage, code);
  }, [sessionId, currentLanguage, updateStoreCode]);

  const handleReset = useCallback(() => {
    const defaultSnippet = problem.code_snippets?.[currentLanguage] || "// Start coding here...";
    resetToDefault(sessionId, currentLanguage, defaultSnippet);
  }, [sessionId, currentLanguage, problem.code_snippets, resetToDefault]);

  const languageOptions = useMemo(
    () =>
      Object.keys(problem.code_snippets || {}).map((key) => ({
        id: key,
        name: key.toUpperCase(),
      })),
    [problem.code_snippets],
  );

  const monacoLanguage = useMemo(() => {
    switch (currentLanguage) {
      case "python3":
      case "python":
        return "python";
      case "cpp":
        return "cpp";
      case "csharp":
        return "csharp";
      case "golang":
      case "go":
        return "go";
      case "javascript":
        return "javascript";
      case "typescript":
        return "typescript";
      case "java":
        return "java";
      case "php":
        return "php";
      case "swift":
        return "swift";
      case "kotlin":
        return "kotlin";
      case "dart":
        return "dart";
      case "ruby":
        return "ruby";
      case "rust":
        return "rust";
      case "scala":
        return "scala";
      default:
        return "javascript";
    }
  }, [currentLanguage]);

  return {
    language: currentLanguage,
    code: currentCode,
    monacoLanguage,
    languageOptions,
    preferences,
    isRunning,
    isHydrated: _hasHydrated,
    setLanguage: handleLanguageChange,
    setCode: handleCodeChange,
    resetCode: handleReset,
    toggleWordWrap,
    setIsRunning,
  };
}


