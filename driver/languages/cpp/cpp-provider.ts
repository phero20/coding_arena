import path from "path";
import fs from "fs/promises";
import { LanguageProvider } from "../base-provider";
import { DriverOptions, ExecutionPackage } from "../../core/types";
import { JUDGE0_LANGUAGE_IDS } from "../../core/constants";
import { CppTypeMapper } from "./cpp-type-mapper";
import { validateDriverOptions } from "../../core/validation";

const PARTS_DIR = path.join(__dirname, "parts");

async function loadTemplate(): Promise<string> {
  const readPart = async (p: string) => {
    try {
      return await fs.readFile(p, "utf-8");
    } catch (e: any) {
      throw new Error(`C++ template part missing: ${p}`);
    }
  };
  
  const [skeleton, scanner, dataStructures, comparator] = await Promise.all([
    readPart(path.join(__dirname, "template.cpp")),
    readPart(path.join(PARTS_DIR, "scanner.cpp")),
    readPart(path.join(PARTS_DIR, "data_structures.cpp")),
    readPart(path.join(PARTS_DIR, "comparator.cpp")),
  ]);

  return skeleton
    .replace("// {{PART_SCANNER}}", scanner.trim())
    .replace("// {{PART_DATA_STRUCTURES}}", dataStructures.trim())
    .replace("// {{PART_COMPARATOR}}", comparator.trim());
}

export class CppProvider extends LanguageProvider {
  readonly language = "cpp";
  readonly judge0Id = JUDGE0_LANGUAGE_IDS.cpp;

  private readonly mapper = new CppTypeMapper();

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
      driverLogic = this.mapper.generateExecutionBlock(sig);
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
        .replace("// {{DRIVER_LOGIC_PLACEHOLDER}}", driverLogic)
        .replace("// {{USER_CODE}}", options.userCode);

    // Smart Sanitization for C++
    if (options.userCode.includes("struct ListNode") || options.userCode.includes("class ListNode")) {
      sourceCode = sourceCode.replace(/struct ListNode \{[\s\S]*?\};/, "/* ListNode overridden by user */");
      sourceCode = sourceCode.replace(/ListNode\* build_list\([\s\S]*?return head;[\s\S]*?\}/, "/* build_list removed */");
    }
    if (options.userCode.includes("struct TreeNode") || options.userCode.includes("class TreeNode")) {
      sourceCode = sourceCode.replace(/struct TreeNode \{[\s\S]*?\};/, "/* TreeNode overridden by user */");
      sourceCode = sourceCode.replace(/TreeNode\* build_tree\([\s\S]*?return root;[\s\S]*?\}/, "/* build_tree removed */");
    }

    return {
      sourceCode,
      stdin: stdinLines.join("\n"),
      languageId: this.judge0Id,
    };
  }
}
