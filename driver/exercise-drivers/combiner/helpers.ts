import { CombineOptions } from "../types";

/** Strip lines matching a regex pattern */
export function stripLines(code: string, pattern: RegExp): string {
  return code
    .split("\n")
    .filter((line) => !pattern.test(line))
    .join("\n");
}

/** Ensure a single trailing newline */
export function ensureNewline(code: string): string {
  return code.trimEnd() + "\n";
}
