import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface EditorSession {
  activeLanguage: string;
  codes: Record<string, string>; // language_id -> code
  matchId?: string; // Optional match context for arena
}

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

interface EditorState {
  sessions: Record<string, EditorSession>;
  preferences: EditorPreferences;
  isRunning: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  
  initSession: (
    sessionId: string,
    initialLanguage: string,
    initialCodes: Record<string, string>,
    matchId?: string,
  ) => void;
  
  updateLanguage: (sessionId: string, language: string) => void;
  updateCode: (sessionId: string, language: string, code: string) => void;
  clearSession: (sessionId: string) => void;
  resetToDefault: (
    sessionId: string,
    language: string,
    defaultCode: string,
  ) => void;
  toggleWordWrap: () => void;
  setPreference: <K extends keyof EditorPreferences>(key: K, value: EditorPreferences[K]) => void;
  setIsRunning: (isRunning: boolean) => void;
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      sessions: {},
      preferences: {
        wordWrap: true,
        fontSize: 14,
        tabSize: 2,
        minimap: false,
        lineNumbers: "on",
        fontLigatures: true,
        cursorStyle: "line",
        cursorBlinking: "smooth",
        bracketPairColorization: true,
        renderWhitespace: "none",
        smoothScrolling: true,
        lineHeight: 22,
        autoClosingBrackets: "always",
      },
      isRunning: false,
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),

      // ... (initSession, updateLanguage, updateCode, clearSession, resetToDefault remain same)
      initSession: (sessionId, initialLanguage, initialCodes, matchId) =>
        set((state) => {
          const existing = state.sessions[sessionId];
          const isArena = sessionId.startsWith("arena:");
          const matchChanged = isArena && existing && existing.matchId !== matchId;

          if (!existing || matchChanged) {
            return {
              sessions: {
                ...state.sessions,
                [sessionId]: {
                  activeLanguage: initialLanguage,
                  codes: initialCodes,
                  matchId: matchId,
                },
              },
            };
          }
          return state;
        }),

      updateLanguage: (sessionId, language) =>
        set((state) => {
          const current = state.sessions[sessionId];
          if (!current) return state;
          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...current,
                activeLanguage: language,
              },
            },
          };
        }),

      updateCode: (sessionId, language, code) =>
        set((state) => {
          const current = state.sessions[sessionId];
          if (!current) return state;
          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...current,
                codes: {
                  ...current.codes,
                  [language]: code,
                },
              },
            },
          };
        }),

      clearSession: (sessionId) =>
        set((state) => {
          const { [sessionId]: _, ...remainingSessions } = state.sessions;
          return { sessions: remainingSessions };
        }),

      resetToDefault: (sessionId, language, defaultCode) =>
        set((state) => {
          const current = state.sessions[sessionId];
          if (!current) return state;
          return {
            sessions: {
              ...state.sessions,
              [sessionId]: {
                ...current,
                codes: {
                  ...current.codes,
                  [language]: defaultCode,
                },
              },
            },
          };
        }),

      toggleWordWrap: () =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            wordWrap: !state.preferences.wordWrap,
          },
        })),

      setPreference: (key, value) =>
        set((state) => ({
          preferences: {
            ...state.preferences,
            [key]: value,
          },
        })),

      setIsRunning: (isRunning: boolean) =>
        set(() => ({
          isRunning,
        })),
    }),
    {
      name: "coding-arena-editor-v2",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sessions: state.sessions,
        preferences: state.preferences,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

