import { create } from "zustand";
import { persist } from "zustand/middleware";
import { COMPILER_LANGUAGES } from "@/constants/compiler-languages";

interface CompilerState {
  language: string;
  codeCache: Record<string, string>;
  stdinCache: Record<string, string>;
  setLanguage: (lang: string) => void;
  setCode: (lang: string, code: string) => void;
  setStdin: (lang: string, stdin: string) => void;
}

const DEFAULT_LANG = COMPILER_LANGUAGES[0];

export const useCompilerStore = create<CompilerState>()(
  persist(
    (set) => ({
      language: DEFAULT_LANG.id,
      codeCache: {},
      stdinCache: {},
      setLanguage: (lang) => set({ language: lang }),
      setCode: (lang, code) =>
        set((state) => ({
          codeCache: { ...state.codeCache, [lang]: code },
        })),
      setStdin: (lang, stdin) =>
        set((state) => ({
          stdinCache: { ...state.stdinCache, [lang]: stdin },
        })),
    }),
    {
      name: "compiler-workspace-storage",
    }
  )
);
