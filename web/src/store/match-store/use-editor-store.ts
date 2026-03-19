import { create } from "zustand";

interface EditorSession {
  activeLanguage: string;
  codes: Record<string, string>; // language_id -> code
}

interface EditorPreferences {
  wordWrap: boolean;
}

interface EditorState {
  sessions: Record<string, EditorSession>;
  preferences: EditorPreferences;
  isRunning: boolean;
  initSession: (
    problemId: string,
    initialLanguage: string,
    initialCodes: Record<string, string>,
  ) => void;
  updateLanguage: (problemId: string, language: string) => void;
  updateCode: (problemId: string, language: string, code: string) => void;
  resetToDefault: (
    problemId: string,
    language: string,
    defaultCode: string,
  ) => void;
  toggleWordWrap: () => void;
  reset: () => void;
  setIsRunning: (isRunning: boolean) => void;
}

export const useEditorStore = create<EditorState>()((set) => ({
  sessions: {},
  preferences: {
    wordWrap: true,
  },
  isRunning: false,

  initSession: (problemId, initialLanguage, initialCodes) =>
    set((state) => {
      if (state.sessions[problemId]) return state;
      return {
        sessions: {
          ...state.sessions,
          [problemId]: {
            activeLanguage: initialLanguage,
            codes: initialCodes,
          },
        },
      };
    }),

  updateLanguage: (problemId, language) =>
    set((state) => {
      const current = state.sessions[problemId];
      if (!current) return state;
      return {
        sessions: {
          ...state.sessions,
          [problemId]: {
            ...current,
            activeLanguage: language,
          },
        },
      };
    }),

  updateCode: (problemId, language, code) =>
    set((state) => {
      const current = state.sessions[problemId];
      if (!current) return state;
      return {
        sessions: {
          ...state.sessions,
          [problemId]: {
            ...current,
            codes: {
              ...current.codes,
              [language]: code,
            },
          },
        },
      };
    }),

  resetToDefault: (problemId, language, defaultCode) =>
    set((state) => {
      const current = state.sessions[problemId];
      if (!current) return state;
      return {
        sessions: {
          ...state.sessions,
          [problemId]: {
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

  setIsRunning: (isRunning: boolean) =>
    set(() => ({
      isRunning,
    })),

  reset: () =>
    set(() => ({
      sessions: {},
      isRunning: false,
    })),
}));
