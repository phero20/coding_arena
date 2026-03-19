import { useEffect, useMemo } from "react";
import type { Problem } from "@/types/api";
import { useEditorStore } from "@/store/match-store/use-editor-store";
import { ArenaWSMessage } from "@/services/arena.service";
import { useDebounce } from "use-debounce";

export const useProblemEditor = (
  problem: Problem, 
  enforcedLanguage?: string, 
  roomId?: string,
  sendMessage?: (type: ArenaWSMessage["type"], payload?: any) => void
) => {
  const storeKey = roomId || problem.problem_id;
  
  const snippetLanguages = useMemo(
    () => Object.keys(problem.code_snippets || {}),
    [problem.code_snippets],
  );

  const defaultLanguage = enforcedLanguage || snippetLanguages[0] || "java";

  const session = useEditorStore((state) => state.sessions[storeKey]);
  const initSession = useEditorStore((state) => state.initSession);
  const updateLanguage = useEditorStore((state) => state.updateLanguage);
  const updateCode = useEditorStore((state) => state.updateCode);
  const resetToDefault = useEditorStore((state) => state.resetToDefault);

  // Initialize session once per problem with ALL available snippets
  useEffect(() => {
    if (!session) {
      const initialCodes: Record<string, string> = {};
      
      if (enforcedLanguage) {
        initialCodes[enforcedLanguage] = problem.code_snippets?.[enforcedLanguage] || "// Start coding here...";
      } else {
        Object.entries(problem.code_snippets || {}).forEach(([lang, snippet]) => {
          if (snippet) initialCodes[lang] = snippet;
        });
        // Fallback if no snippets provided
        if (Object.keys(initialCodes).length === 0) {
          initialCodes[defaultLanguage] = "// Start coding here...";
        }
      }
      initSession(storeKey, defaultLanguage, initialCodes);
    }
  }, [
    session,
    initSession,
    storeKey,
    problem.code_snippets,
    defaultLanguage,
  ]);

  const language = session?.activeLanguage ?? defaultLanguage;
  const code =
    session?.codes?.[language] ??
    problem.code_snippets?.[language] ??
    "// No snippet available";

  const languageOptions = useMemo(() => {
    if (enforcedLanguage) {
      return [{ id: enforcedLanguage, label: enforcedLanguage.toUpperCase() }];
    }
    return snippetLanguages.map((key) => ({
      id: key,
      label: key.toUpperCase(),
    }));
  }, [snippetLanguages, enforcedLanguage]);

  const monacoLanguage = useMemo(() => {
    switch (language) {
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
  }, [language]);

  const setLanguage = (next: string) => {
    if (enforcedLanguage) return; // Cannot change if enforced
    updateLanguage(storeKey, next);
  };

  const setCode = (next: string) =>
    updateCode(storeKey, language, next);

  const resetCode = () => {
    const defaultSnippet =
      problem.code_snippets?.[language] || "// Start coding here...";
    resetToDefault(storeKey, language, defaultSnippet);
  };

  return {
    language,
    code,
    monacoLanguage,
    languageOptions,
    setLanguage,
    setCode,
    resetCode,
  };
};

