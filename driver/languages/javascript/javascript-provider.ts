import fs from "fs/promises";
import path from "path";
import { LanguageProvider } from "../base-provider";
import { DriverOptions, ExecutionPackage } from "../../core/types";
import { JavaScriptTypeMapper } from "./javascript-type-mapper";
import { JUDGE0_LANGUAGE_IDS, MARKERS } from "../../core/constants";

export class JavaScriptProvider extends LanguageProvider {
  readonly language = "javascript";
  readonly judge0Id = JUDGE0_LANGUAGE_IDS.javascript;
  private readonly mapper = new JavaScriptTypeMapper();

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

    const fullCode = template
      .replace(MARKERS.USER_CODE, options.userCode)
      .replace(MARKERS.MAIN_LOOP, driverLogic);

    return {
      sourceCode: fullCode,
      stdin: stdinLines.join("\n"),
      languageId: this.judge0Id,
    };
  }

  private async loadTemplate(): Promise<string> {
    const templatePath = path.join(__dirname, "template.js");
    const scannerPath = path.join(__dirname, "parts", "scanner.js");
    const dsPath = path.join(__dirname, "parts", "data_structures.js");
    const compPath = path.join(__dirname, "parts", "comparator.js");

    const [template, scanner, ds, comp] = await Promise.all([
      fs.readFile(templatePath, "utf-8"),
      fs.readFile(scannerPath, "utf-8"),
      fs.readFile(dsPath, "utf-8"),
      fs.readFile(compPath, "utf-8"),
    ]);

    return template
      .replace("// {{PART_SCANNER}}", scanner)
      .replace("// {{PART_DATA_STRUCTURES}}", ds)
      .replace("// {{PART_COMPARATOR}}", comp);
  }
}
