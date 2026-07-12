"use client";

import { useState } from "react";
import { useExecuteMutation } from "@/services/mutations/compiler.mutations";
import { COMPILER_LANGUAGES, getLangConfig } from "@/constants/compiler-languages";
import type { CompilerExecuteResponse } from "@/types/compiler";
import { toast } from "sonner";
import { useCompilerStore } from "@/store/use-compiler-store";

export function useCompilerWorkspace() {
  const { language, codeCache, stdinCache, setLanguage, setCode, setStdin } = useCompilerStore();
  const [result, setResult] = useState<CompilerExecuteResponse | null>(null);

  const executeMutation = useExecuteMutation();

  const langConfig = getLangConfig(language);
  const currentCode = codeCache[language] ?? langConfig.defaultCode;
  const currentStdin = stdinCache[language] ?? "";

  function handleLanguageChange(newId: string) {
    setLanguage(newId);
  }

  function handleSetCode(newCode: string) {
    setCode(language, newCode);
  }

  function handleSetStdin(newStdin: string) {
    setStdin(language, newStdin);
  }

  function handleResetCode() {
    setCode(language, langConfig.defaultCode);
  }

  async function handleRun() {
    try {
      const res = await executeMutation.mutateAsync({ compiler: language, code: currentCode, stdin: currentStdin });
      setResult(res);
    } catch (err: any) {
      toast.error(err.message ?? "Execution failed");
    }
  }

  return {
    languages: COMPILER_LANGUAGES.map(l => ({ id: l.id, name: l.name })),
    language,
    code: currentCode,
    stdin: currentStdin,
    result,
    isExecuting: executeMutation.isPending,
    setLanguage: handleLanguageChange,
    setCode: handleSetCode,
    setStdin: handleSetStdin,
    resetCode: handleResetCode,
    runCode: handleRun,
  };
}
