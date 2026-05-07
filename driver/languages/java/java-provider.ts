import path from "path";
import fs from "fs/promises";
import { LanguageProvider } from "../base-provider";
import { DriverOptions, ExecutionPackage } from "../../core/types";
import { JUDGE0_LANGUAGE_IDS } from "../../core/constants";
import { JavaTypeMapper } from "./java-type-mapper";
import { validateDriverOptions } from "../../core/validation";

const PARTS_DIR = path.join(__dirname, "parts");

/** Load the 5 partial template files and stitch them into the skeleton. */
async function loadTemplate(): Promise<string> {
  const readPart = async (p: string) => {
    try {
      return await fs.readFile(p, "utf-8");
    } catch (e: any) {
      throw new Error(`Java template part missing/unreadable: ${p} (${e?.message ?? e})`);
    }
  };
  const [skeleton, dataStructures, fastScanner, serializer, comparator, builders] =
    await Promise.all([
      readPart(path.join(__dirname, "template.java")),
      readPart(path.join(PARTS_DIR, "data-structures.java")),
      readPart(path.join(PARTS_DIR, "fast-scanner.java")),
      readPart(path.join(PARTS_DIR, "serializer.java")),
      readPart(path.join(PARTS_DIR, "comparator.java")),
      readPart(path.join(PARTS_DIR, "builders.java")),
    ]);

  return skeleton
    .replace("{{PART_DATA_STRUCTURES}}", dataStructures.trim())
    .replace("{{PART_FAST_SCANNER}}", fastScanner.trim())
    .replace("{{PART_SERIALIZER}}", serializer.trim())
    .replace("{{PART_COMPARATOR}}", comparator.trim())
    .replace("{{PART_BUILDERS}}", builders.trim());
}

/**
 * Java implementation of the Driver Provider.
 */
export class JavaProvider extends LanguageProvider {
  readonly language = "java";
  readonly judge0Id = JUDGE0_LANGUAGE_IDS.java;

  private readonly mapper = new JavaTypeMapper();

  async generate(options: DriverOptions): Promise<ExecutionPackage> {
    validateDriverOptions(options);
    this.mapper.reset(); // Fix #3: reset varCounter so mapper can be safely reused

    const template = await loadTemplate();

    const isClassProblem = "class_name" in options.signature;

    let driverLogic = "";
    let stdinLines: string[] = [];

    if (isClassProblem) {
      const sig = options.signature as any; // Cast to ClassSignature
      driverLogic = this.mapper.generateClassExecutionBlock(sig);
      stdinLines = [
        options.testCases.length.toString(),
        ...options.testCases.map((tc) =>
          this.mapper.flattenClassInput(tc.input, sig, tc.expected_output),
        ),
      ];
    } else {
      const sig = options.signature as any; // Cast to FunctionSignature
      const extractionLines = sig.params
        .map((p: any) => this.mapper.generateExtractionLine(p))
        .join("\n");
      const executionBlock = this.mapper.generateExecutionBlock(sig);
      driverLogic = `${extractionLines}\n${executionBlock}`;
      stdinLines = [
        options.testCases.length.toString(),
        ...options.testCases.map((tc) =>
          this.mapper.flattenInput(
            { ...tc.input, expected_output: tc.expected_output },
            sig,
          ),
        ),
      ];
    }

    // 2. Stitch everything together
    // Extract imports from userCode and move them to the top
    const importRegex = /^import\s+.*;/gm;
    const userImports = options.userCode.match(importRegex) || [];
    let cleanUserCode = options.userCode.replace(importRegex, "").trim();

    // Strip 'public' from class declarations to prevent compilation errors in a single-file environment
    cleanUserCode = cleanUserCode.replace(/\bpublic\s+(final\s+|abstract\s+)?class\b/g, "$1class");

    let sourceCode = template
      .replace(/^\s*static\s+final\s+double\s+EPS\s+=\s+1e-6;/m, `    static final double EPS = ${options.comparator?.float_epsilon ?? 1e-6};`)
      .replace(/^\s*static\s+final\s+boolean\s+UNORDERED\s+=\s+false;/m, `    static final boolean UNORDERED = ${options.comparator?.unordered_arrays ? "true" : "false"};`)
      .replace(/^\s*\/\/\s*\{\{DRIVER_LOGIC_PLACEHOLDER\}\}/m, driverLogic)
      .replace("{{USER_CODE}}", cleanUserCode);

    // Add user imports after the template's default imports
    if (userImports.length > 0) {
      sourceCode = userImports.join("\n") + "\n" + sourceCode;
    }

    if (isClassProblem) {
      // Classes don't need the default "Solution solution = new Solution();" line
      sourceCode = sourceCode.replace(/^\s*Solution\s+solution\s+=\s+new\s+Solution\(\);/m, (match) => "// " + match.trim());
    }

    // Fix Duplicate Class conflict: If user provides their own ListNode or TreeNode, comment out the platform defaults
    if (cleanUserCode.includes("class ListNode")) {
      sourceCode = sourceCode.replace(/class ListNode\s*\{[\s\S]*?\}\s*\}/, "// ListNode overridden by user");
      // Also remove builders that depend on the default ListNode
      sourceCode = sourceCode.replace(/private static ListNode buildList\s*\([\s\S]*?\n    \}/, "// buildList removed (ListNode overridden)");
    }
    if (cleanUserCode.includes("class TreeNode")) {
      sourceCode = sourceCode.replace(/class TreeNode\s*\{[\s\S]*?\}\s*\}/, "// TreeNode overridden by user");
      // Also remove builders that depend on the default TreeNode
      sourceCode = sourceCode.replace(/private static TreeNode buildTree\s*\([\s\S]*?\n    \}/, "// buildTree removed (TreeNode overridden)");
    }

    return {
      sourceCode,
      stdin: stdinLines.join("\n"),
      languageId: this.judge0Id,
    };
  }
}
