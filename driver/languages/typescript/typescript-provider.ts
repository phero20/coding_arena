import fs from "fs/promises";
import path from "path";
import { LanguageProvider } from "../base-provider";
import { DriverOptions, ExecutionPackage } from "../../core/types";
import { TypeScriptTypeMapper } from "./typescript-type-mapper";
import { JUDGE0_LANGUAGE_IDS, MARKERS } from "../../core/constants";

export class TypeScriptProvider extends LanguageProvider {
  readonly language = "typescript";
  readonly judge0Id = JUDGE0_LANGUAGE_IDS.typescript;
  private readonly mapper = new TypeScriptTypeMapper();

  public async generate(options: DriverOptions): Promise<ExecutionPackage> {
    const template = await this.loadTemplate();
    this.mapper.reset();

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

    const fullCode = "// @ts-nocheck\n" + template
      .replace(`// ${MARKERS.USER_CODE}`, options.userCode)
      .replace(`// ${MARKERS.MAIN_LOOP}`, driverLogic);

    return {
      sourceCode: fullCode,
      stdin: stdinLines.join("\n"),
      languageId: this.judge0Id,
    };
  }

  private async loadTemplate(): Promise<string> {
    // Reuse the same logic as JavaScript but from TS parts
    const templatePath = path.join(__dirname, "template.ts");
    const scannerPath = path.join(__dirname, "parts", "scanner.ts");
    const dsPath = path.join(__dirname, "parts", "data_structures.ts");
    const compPath = path.join(__dirname, "parts", "comparator.ts");

    const [template, scanner, ds, comp] = await Promise.all([
      fs.readFile(templatePath, "utf-8"),
      fs.readFile(scannerPath, "utf-8"),
      fs.readFile(dsPath, "utf-8"),
      fs.readFile(compPath, "utf-8"),
    ]);

    const cleanPart = (part: string) => {
      return part
        .replace(/^import\s+.*$/gm, "") // remove all imports
        .replace(/^export\s+/gm, "")     // remove export keywords
        .trim();
    };

    return template
      .replace(/^import\s+.*from\s+"\.\/parts\/.*";$/gm, "") // remove local part imports from template
      .replace(/import\s+\*\s+as\s+fs\s+from\s+"fs";/g, 'declare var require: any;\ndeclare var process: any;\ndeclare var Buffer: any;\nconst fs = require("fs");')
      .replace("// {{PART_SCANNER}}", cleanPart(scanner))
      .replace("// {{PART_DATA_STRUCTURES}}", cleanPart(ds))
      .replace("// {{PART_COMPARATOR}}", cleanPart(comp));
  }
}
