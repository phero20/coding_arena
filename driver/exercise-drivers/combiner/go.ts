import { CombineOptions } from "../types";
import { ensureNewline } from "./helpers";

/**
 * Go (go test)
 *
 * Both files must share the same package name in the combined output.
 * Handles the external test package pattern: if the test uses `package foo_test`,
 * we strip the `_test` suffix so both files are in the same package.
 *
 * Imports are collected from both files, deduplicated, and placed at the top.
 */

/** Extract the package name from the first `package X` line. */
function extractPackageName(code: string): string | null {
  const match = code.match(/^\s*package\s+(\S+)/m);
  return match ? match[1].trim() : null;
}

/** Collect all import paths from a Go source file (handles both single and block imports). */
function collectImports(code: string): string[] {
  const imports: string[] = [];

  // Single-line: import "path"  or  import alias "path"
  const singlePattern = /^\s*import\s+(?:\w+\s+)?("(?:[^"\\]|\\.)*")/gm;
  let m: RegExpExecArray | null;
  while ((m = singlePattern.exec(code)) !== null) {
    imports.push(m[1].trim());
  }

  // Block: import ( ... )
  const blockPattern = /^\s*import\s*\(([\s\S]*?)\)/gm;
  while ((m = blockPattern.exec(code)) !== null) {
    const block = m[1];
    // Each line inside the block: optional alias + "path"
    const linePattern = /^\s*(?:\w+\s+)?("(?:[^"\\]|\\.)*")/gm;
    let lm: RegExpExecArray | null;
    while ((lm = linePattern.exec(block)) !== null) {
      imports.push(lm[1].trim());
    }
  }

  return imports;
}

/** Strip all package and import declarations from Go source. */
function stripPackageAndImports(code: string): string {
  // Remove single-line import statements
  let result = code.replace(/^\s*import\s+(?:\w+\s+)?("(?:[^"\\]|\\.)*")\s*\n?/gm, "");
  // Remove import blocks
  result = result.replace(/^\s*import\s*\([\s\S]*?\)\s*\n?/gm, "");
  // Remove package declaration
  result = result.replace(/^\s*package\s+\S+\s*\n?/m, "");
  return result;
}

export function combineGo(opts: CombineOptions): string {
  const { userCode, testCode } = opts;

  // Determine package names
  const solutionPkg = extractPackageName(userCode) ?? "main";
  const rawTestPkg = extractPackageName(testCode) ?? solutionPkg;

  // Strip _test suffix from external test packages so both files share one package
  const testPkg = rawTestPkg.endsWith("_test")
    ? rawTestPkg.slice(0, -"_test".length)
    : rawTestPkg;

  // Use the solution's package name (they should match after stripping _test)
  const packageName = solutionPkg;

  // Collect and deduplicate imports from both files
  const allImports = [...new Set([
    ...collectImports(userCode),
    ...collectImports(testCode),
  ])];

  // Build the import block
  const importBlock =
    allImports.length > 0
      ? `import (\n${allImports.map((p) => `\t${p}`).join("\n")}\n)`
      : "";

  // Strip package + imports from both bodies
  const solutionBody = stripPackageAndImports(userCode).trim();
  const testBody = stripPackageAndImports(testCode).trim();

  const parts: string[] = [`package ${packageName}`];
  if (importBlock) parts.push("", importBlock);
  parts.push("", "// === Solution ===", ensureNewline(solutionBody));
  parts.push("// === Tests ===", ensureNewline(testBody));

  return parts.join("\n");
}
