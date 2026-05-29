import fs from "fs/promises";
import path from "path";
import { LanguageProvider } from "../base-provider";
import { DriverOptions, ExecutionPackage } from "../../core/types";
import { CSharpTypeMapper } from "./csharp-type-mapper";
import { JUDGE0_LANGUAGE_IDS, MARKERS } from "../../core/constants";

export class CSharpProvider extends LanguageProvider {
  readonly language = "csharp";
  readonly judge0Id = JUDGE0_LANGUAGE_IDS.csharp;
  private readonly mapper = new CSharpTypeMapper();

  public async generate(options: DriverOptions): Promise<ExecutionPackage> {
    const { template, usings } = await this.loadTemplateAndParts();
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

    // Extract any additional usings from user code
    const userUsings = options.userCode.match(/^using\s+.*;/gm) || [];
    userUsings.forEach(u => usings.add(u.trim()));
    
    const cleanUserCode = options.userCode.replace(/^using\s+.*;[\r\n]*/gm, "").trim();

    const fullCode = Array.from(usings).join("\n") + "\n\n" + template
      .replace(MARKERS.USER_CODE, cleanUserCode)
      .replace(MARKERS.MAIN_LOOP, driverLogic);

    return {
      sourceCode: fullCode,
      stdin: stdinLines.join("\n"),
      languageId: this.judge0Id,
    };
  }

  private async loadTemplateAndParts(): Promise<{ template: string, usings: Set<string> }> {
    const templatePath = path.join(__dirname, "template.cs");
    const scannerPath = path.join(__dirname, "parts", "scanner.cs");
    const dsPath = path.join(__dirname, "parts", "data_structures.cs");
    const compPath = path.join(__dirname, "parts", "comparator.cs");

    const [templateRaw, scannerRaw, dsRaw, compRaw] = await Promise.all([
      fs.readFile(templatePath, "utf-8"),
      fs.readFile(scannerPath, "utf-8"),
      fs.readFile(dsPath, "utf-8"),
      fs.readFile(compPath, "utf-8"),
    ]);

    const usings = new Set<string>();
    const extractUsings = (code: string) => {
      const matches = code.match(/^using\s+.*;/gm) || [];
      matches.forEach(m => usings.add(m.trim()));
      return code.replace(/^using\s+.*;[\r\n]*/gm, "").trim();
    };

    const template = extractUsings(templateRaw)
      .replace("// {{PART_SCANNER}}", extractUsings(scannerRaw))
      .replace("// {{PART_DATA_STRUCTURES}}", extractUsings(dsRaw))
      .replace("// {{PART_COMPARATOR}}", extractUsings(compRaw));

    return { template, usings };
  }
}
