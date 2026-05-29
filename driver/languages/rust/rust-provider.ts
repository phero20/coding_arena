import fs from "fs/promises";
import path from "path";
import { LanguageProvider } from "../base-provider";
import { DriverOptions, ExecutionPackage } from "../../core/types";
import { RustTypeMapper } from "./rust-type-mapper";
import { JUDGE0_LANGUAGE_IDS, MARKERS } from "../../core/constants";

export class RustProvider extends LanguageProvider {
  readonly language = "rust";
  readonly judge0Id = JUDGE0_LANGUAGE_IDS.rust;
  private readonly mapper = new RustTypeMapper();

  public async generate(options: DriverOptions): Promise<ExecutionPackage> {
    const { template, parts } = await this.loadTemplateAndParts();
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

    // Rust usually doesn't have top-level "usings" like C#, 
    // but we might need to handle mod/use if we want to be fancy.
    // For now, we'll just prepend them to the user code if they are missing.
    
    const fullCode = template
      .replace("// {{PART_MODULES}}", parts)
      .replace(MARKERS.USER_CODE, options.userCode)
      .replace(MARKERS.MAIN_LOOP, driverLogic);

    return {
      sourceCode: fullCode,
      stdin: stdinLines.join("\n"),
      languageId: this.judge0Id,
    };
  }

  private async loadTemplateAndParts(): Promise<{ template: string, parts: string }> {
    const templatePath = path.join(__dirname, "template.rs");
    const scannerPath = path.join(__dirname, "parts", "scanner.rs");
    const dsPath = path.join(__dirname, "parts", "data_structures.rs");
    const compPath = path.join(__dirname, "parts", "comparator.rs");

    const [template, scanner, ds, comp] = await Promise.all([
      fs.readFile(templatePath, "utf-8"),
      fs.readFile(scannerPath, "utf-8"),
      fs.readFile(dsPath, "utf-8"),
      fs.readFile(compPath, "utf-8"),
    ]);

    // In Rust, we'll embed the parts as inline modules to keep it a single file for Judge0
    const parts = `
mod parts {
    pub mod data_structures {
        ${ds}
    }
    pub mod scanner {
        ${scanner.replace("super::data_structures", "super::data_structures")}
    }
    pub mod comparator {
        ${comp.replace("super::data_structures", "super::data_structures")}
    }
}
`.trim();

    return { 
        template,
        parts 
    };
  }
}
