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
  enforcedLanguage?: string,
  matchId?: string | null,
  isArena = false,
) {
  // 1. Generate Contextual Session ID
  const sessionId = useMemo(() => {
    if (isArena && matchId) return `arena:${matchId}`;
    return `practice:${problem.problem_id}`;
  }, [isArena, matchId, problem.problem_id]);

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

    const snippetLanguages = Object.keys(problem.code_snippets || {});
    const initialLanguage = enforcedLanguage || snippetLanguages[0] || "javascript";
    
    // Only set boilerplate if the session is brand new
    if (!session || (isArena && matchId && session.matchId !== matchId)) {
      const initialCodes: Record<string, string> = {};
      Object.entries(problem.code_snippets || {}).forEach(([lang, snippet]) => {
        if (snippet) initialCodes[lang] = snippet;
      });
      // Fallback if no snippets provided
      if (Object.keys(initialCodes).length === 0) {
        initialCodes[initialLanguage] = "// Start coding here...";
      }
      
      initSession(sessionId, initialLanguage, initialCodes, matchId || undefined);
    }
  }, [sessionId, _hasHydrated, enforcedLanguage, problem, initSession, session, isArena, matchId]);

  // 3. Derived Helpers
  const currentLanguage = session?.activeLanguage || (enforcedLanguage || Object.keys(problem.code_snippets || {})[0] || "javascript");
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
        label: key.toUpperCase(),
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


