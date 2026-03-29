import { useEffect, useMemo } from "react";
import type { Problem } from "@/types/api";
import { useEditorStore } from "@/store/use-editor-store";

export const useProblemEditor = (problem: Problem) => {
  const snippetLanguages = useMemo(
    () => Object.keys(problem.code_snippets || {}),
    [problem.code_snippets],
  );

  const defaultLanguage = snippetLanguages[0] || "javascript";

  const session = useEditorStore((state) => state.sessions[problem.problem_id]);
  const initSession = useEditorStore((state) => state.initSession);
  const updateLanguage = useEditorStore((state) => state.updateLanguage);
  const updateCode = useEditorStore((state) => state.updateCode);
  const resetToDefault = useEditorStore((state) => state.resetToDefault);

  // Initialize session once per problem with ALL available snippets
  useEffect(() => {
    if (!session) {
      const initialCodes: Record<string, string> = {};
      Object.entries(problem.code_snippets || {}).forEach(([lang, snippet]) => {
        if (snippet) initialCodes[lang] = snippet;
      });
      // Fallback if no snippets provided
      if (Object.keys(initialCodes).length === 0) {
        initialCodes[defaultLanguage] = "// Start coding here...";
      }
      initSession(problem.problem_id, defaultLanguage, initialCodes);
    }
  }, [
    session,
    initSession,
    problem.problem_id,
    problem.code_snippets,
    defaultLanguage,
  ]);

  const language = session?.activeLanguage ?? defaultLanguage;
  const code =
    session?.codes?.[language] ??
    problem.code_snippets?.[language] ??
    "// No snippet available";

  const languageOptions = useMemo(
    () =>
      snippetLanguages.map((key) => ({
        id: key,
        label: key.toUpperCase(),
      })),
    [snippetLanguages],
  );

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
    updateLanguage(problem.problem_id, next);
  };

  const setCode = (next: string) =>
    updateCode(problem.problem_id, language, next);

  const resetCode = () => {
    const defaultSnippet =
      problem.code_snippets?.[language] || "// Start coding here...";
    resetToDefault(problem.problem_id, language, defaultSnippet);
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
