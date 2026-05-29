import path from "path";
import fs from "fs/promises";
import { LanguageProvider } from "../base-provider";
import { DriverOptions, ExecutionPackage } from "../../core/types";
import { JUDGE0_LANGUAGE_IDS } from "../../core/constants";
import { CTypeMapper } from "./c-type-mapper";
import { validateDriverOptions } from "../../core/validation";

const PARTS_DIR = path.join(__dirname, "parts");

async function loadTemplate(): Promise<string> {
  const readPart = async (p: string) => {
    try {
      return await fs.readFile(p, "utf-8");
    } catch (e: any) {
      throw new Error(`C template part missing: ${p}`);
    }
  };
  
  const [skeleton, scanner, dataStructures, comparator] = await Promise.all([
    readPart(path.join(__dirname, "template.c")),
    readPart(path.join(PARTS_DIR, "scanner.c")),
    readPart(path.join(PARTS_DIR, "data_structures.c")),
    readPart(path.join(PARTS_DIR, "comparator.c")),
  ]);

  return skeleton
    .replace("// {{PART_SCANNER}}", scanner.trim())
    .replace("// {{PART_DATA_STRUCTURES}}", dataStructures.trim())
    .replace("// {{PART_COMPARATOR}}", comparator.trim());
}

export class CProvider extends LanguageProvider {
  readonly language = "c";
  readonly judge0Id = JUDGE0_LANGUAGE_IDS.c;

  private readonly mapper = new CTypeMapper();

  async generate(options: DriverOptions): Promise<ExecutionPackage> {
    validateDriverOptions(options);
    this.mapper.reset();

    const template = await loadTemplate();
    const isClassProblem = "class_name" in options.signature;

    const sig = options.signature as any;
    const driverLogic = isClassProblem 
        ? this.mapper.generateClassExecutionBlock(sig)
        : this.mapper.generateExecutionBlock(sig);
        
    const stdinLines = [
        options.testCases.length.toString(),
        ...options.testCases.map((tc) =>
            isClassProblem 
                ? this.mapper.flattenClassInput(tc.input, sig, tc.expected_output as any[])
                : this.mapper.flattenInput(
                    { ...tc.input, expected_output: tc.expected_output },
                    sig,
                ),
        ),
    ];

    const sourceCode = template
        .replace("// {{DRIVER_LOGIC_PLACEHOLDER}}", driverLogic)
        .replace("// {{USER_CODE}}", options.userCode);

    return {
      sourceCode,
      stdin: stdinLines.join("\n"),
      languageId: this.judge0Id,
    };
  }
}
