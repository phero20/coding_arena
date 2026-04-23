"use client";

import { useState, useRef } from "react";
import { useExecuteMutation } from "@/services/mutations/compiler.mutations";
import { COMPILER_LANGUAGES, getLangConfig } from "@/constants/compiler-languages";
import type { CompilerExecuteResponse } from "@/types/compiler";
import { toast } from "sonner";

const DEFAULT_LANG = COMPILER_LANGUAGES[0]; // Python

export function useCompilerWorkspace() {
  const [language, setLanguage] = useState<string>(DEFAULT_LANG.id);
  const [code, setCode]         = useState(DEFAULT_LANG.defaultCode);
  const [stdin, setStdin]       = useState("");
  const [result, setResult]     = useState<CompilerExecuteResponse | null>(null);

  // In-memory per-language caches (session only — resets on page refresh)
  const codeCache  = useRef<Record<string, string>>({});
  const stdinCache = useRef<Record<string, string>>({});

  const executeMutation = useExecuteMutation();

  function handleLanguageChange(newId: string) {
    // Snapshot current lang's code & stdin before switching
    codeCache.current[language]  = code;
    stdinCache.current[language] = stdin;

    const lang = getLangConfig(newId);
    setLanguage(lang.id);
    setCode(codeCache.current[lang.id]   ?? lang.defaultCode);
    setStdin(stdinCache.current[lang.id] ?? "");
  }

  async function handleRun() {
    try {
      const res = await executeMutation.mutateAsync({ compiler: language, code, stdin });
      setResult(res);
    } catch (err: any) {
      toast.error(err.message ?? "Execution failed");
    }
  }

  return {
    languages: COMPILER_LANGUAGES.map(l => ({ id: l.id, name: l.name })),
    language,
    code,
    stdin,
    result,
    isExecuting: executeMutation.isPending,
    setLanguage: handleLanguageChange,
    setCode,
    setStdin,
    runCode: handleRun,
  };
}
