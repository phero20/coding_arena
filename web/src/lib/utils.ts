import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSolveTime(ms?: number): string {
  if (ms === undefined || ms === null) return "--:--";
  
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
}

export function mapLanguageAlias(lang: string): string {
  if (!lang) return "javascript";
  switch (lang.toLowerCase()) {
    case "python3":
    case "python":
    case "py":
      return "python";
    case "cpp":
    case "c++":
      return "cpp";
    case "c":
      return "c";
    case "csharp":
    case "cs":
      return "csharp";
    case "golang":
    case "go":
      return "go";
    case "javascript":
    case "js":
      return "javascript";
    case "typescript":
    case "ts":
      return "typescript";
    case "java":
      return "java";
    case "php":
      return "php";
    case "swift":
      return "swift";
    case "kotlin":
    case "kt":
      return "kotlin";
    case "dart":
      return "dart";
    case "ruby":
    case "rb":
      return "ruby";
    case "rust":
    case "rs":
      return "rust";
    case "scala":
      return "scala";

    case "elixir":
      return "elixir";
    case "clojure":
      return "clojure";
    case "haskell":
      return "fsharp";
    case "lua":
      return "lua";
    case "bash":
    case "sh":
      return "shell";
    case "perl":
      return "perl";
    case "r":
      return "r";
    case "sql":
    case "sqlite":
    case "oracle":
    case "oraclesql":
    case "plsql":
    case "mssql":
    case "tsql":
      return "sql";
    case "postgresql":
    case "postgres":
    case "pgsql":
      return "pgsql";
    case "mysql":
    case "mariadb":
      return "mysql";
    case "assembly":
    case "nasm":
      return "ini";
    case "cobol":
      return "sql";
    case "fsharp":
    case "fs":
      return "fsharp";
    case "groovy":
      return "java";
    case "ocaml":
      return "fsharp";
    case "pascal":
      return "pascal";
    case "prolog":
      return "ruby";
    case "vb":
    case "vbnc":
      return "vb";
    case "racket":
      return "scheme";
    default:
      return "javascript";
  }
}

