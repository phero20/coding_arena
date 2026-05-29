import path from "path";
import fs from "fs/promises";
import { LanguageProvider } from "../base-provider";
import { DriverOptions, ExecutionPackage } from "../../core/types";
import { JUDGE0_LANGUAGE_IDS } from "../../core/constants";
import { PythonTypeMapper } from "./python-type-mapper";
import { validateDriverOptions } from "../../core/validation";

const PARTS_DIR = path.join(__dirname, "parts");

async function loadTemplate(): Promise<string> {
  const readPart = async (p: string) => {
    try {
      return await fs.readFile(p, "utf-8");
    } catch (e: any) {
      throw new Error(`Python template part missing: ${p}`);
    }
  };
  
  const [skeleton, scanner, dataStructures, comparator] = await Promise.all([
    readPart(path.join(__dirname, "template.py")),
    readPart(path.join(PARTS_DIR, "scanner.py")),
    readPart(path.join(PARTS_DIR, "data_structures.py")),
    readPart(path.join(PARTS_DIR, "comparator.py")),
  ]);

  return skeleton
    .replace("# {{PART_SCANNER}}", scanner.trim())
    .replace("# {{PART_DATA_STRUCTURES}}", dataStructures.trim())
    .replace("# {{PART_COMPARATOR}}", comparator.trim());
}

export class PythonProvider extends LanguageProvider {
  readonly language = "python";
  readonly judge0Id = JUDGE0_LANGUAGE_IDS.python;

  private readonly mapper = new PythonTypeMapper();

  async generate(options: DriverOptions): Promise<ExecutionPackage> {
    validateDriverOptions(options);
    this.mapper.reset();

    const template = await loadTemplate();
    const isClassProblem = "class_name" in options.signature;

    let driverLogic = "";
    let stdinLines: string[] = [];

    if (isClassProblem) {
      const sig = options.signature as any;
      driverLogic = this.mapper.generateClassExecutionBlock(sig);
      stdinLines = [
        options.testCases.length.toString(),
        ...options.testCases.map((tc) =>
          this.mapper.flattenClassInput(tc.input, sig, tc.expected_output),
        ),
      ];
    } else {
      const sig = options.signature as any;
      const extractionLines = sig.params.length > 0 
        ? "            " + sig.params
            .map((p: any) => this.mapper.generateExtractionLine(p))
            .join("\n            ")
        : "";
      const executionBlock = this.mapper.generateExecutionBlock(sig);
      driverLogic = extractionLines ? `${extractionLines}\n${executionBlock}` : executionBlock;
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

    let sourceCode = template
        .replace("EPS = 1e-6", `EPS = ${options.comparator?.float_epsilon ?? 1e-6}`)
        .replace("UNORDERED = False", `UNORDERED = ${options.comparator?.unordered_arrays ? "True" : "False"}`)
        .replace("# {{DRIVER_LOGIC_PLACEHOLDER}}", driverLogic)
        .replace("# {{USER_CODE}}", options.userCode);

    // Fix Conflict: If user provides their own ListNode or TreeNode, disable the platform defaults and helpers
    if (options.userCode.includes("class ListNode")) {
      sourceCode = sourceCode.replace(/class ListNode:[\s\S]*?self\.next = next/, "# ListNode overridden by user");
      sourceCode = sourceCode.replace(/def build_list\([\s\S]*?return head/, "# build_list removed (ListNode overridden)");
    }
    if (options.userCode.includes("class TreeNode")) {
      sourceCode = sourceCode.replace(/class TreeNode:[\s\S]*?self\.right = right/, "# TreeNode overridden by user");
      sourceCode = sourceCode.replace(/def build_tree\([\s\S]*?return root/, "# build_tree removed (TreeNode overridden)");
    }

    return {
      sourceCode,
      stdin: stdinLines.join("\n"),
      languageId: this.judge0Id,
    };
  }
}
