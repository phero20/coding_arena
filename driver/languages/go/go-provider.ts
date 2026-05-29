import fs from "fs/promises";
import path from "path";
import { LanguageProvider } from "../base-provider";
import { DriverOptions, ExecutionPackage } from "../../core/types";
import { GoTypeMapper } from "./go-type-mapper";
import { JUDGE0_LANGUAGE_IDS, MARKERS } from "../../core/constants";

export class GoProvider extends LanguageProvider {
  readonly language = "go";
  readonly judge0Id = JUDGE0_LANGUAGE_IDS.go;
  private readonly mapper = new GoTypeMapper();

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

    const userImports: string[] = [];
    const restOfUserCode: string[] = [];
    let inUserImportBlock = false;

    for (const line of options.userCode.split("\n")) {
      const trimmed = line.trim();
      if (trimmed === "import (") {
        inUserImportBlock = true;
        continue;
      }
      if (inUserImportBlock && trimmed === ")") {
        inUserImportBlock = false;
        continue;
      }
      if (inUserImportBlock) {
        if (trimmed) userImports.push(trimmed);
        continue;
      }
      if (trimmed.startsWith("import ")) {
        userImports.push(trimmed.substring(7).trim());
        continue;
      }
      restOfUserCode.push(line);
    }

    const fullCode = template
      .replace("// {{USER_IMPORTS}}", userImports.map(i => `\t${i}`).join("\n"))
      .replace("// {{PART_DATA_STRUCTURES}}", parts.ds)
      .replace("// {{PART_SCANNER}}", parts.scanner)
      .replace("// {{PART_COMPARATOR}}", parts.comparator)
      .replace(MARKERS.USER_CODE, restOfUserCode.join("\n"))
      .replace(MARKERS.MAIN_LOOP, driverLogic);

    return {
      sourceCode: fullCode,
      stdin: stdinLines.join("\n"),
      languageId: this.judge0Id,
    };
  }

  private async loadTemplateAndParts(): Promise<{ template: string, parts: any }> {
    const templatePath = path.join(__dirname, "template.go");
    const scannerPath = path.join(__dirname, "parts", "scanner.go");
    const dsPath = path.join(__dirname, "parts", "data_structures.go");
    const compPath = path.join(__dirname, "parts", "comparator.go");

    const [template, scanner, ds, comp] = await Promise.all([
      fs.readFile(templatePath, "utf-8"),
      fs.readFile(scannerPath, "utf-8"),
      fs.readFile(dsPath, "utf-8"),
      fs.readFile(compPath, "utf-8"),
    ]);

    // Strip "package main" and imports from parts to inline them cleanly
    const stripBoilerplate = (code: string) => {
      const lines = code.split("\n");
      const result: string[] = [];
      let inImport = false;

      for (const line of lines) {
        if (line.startsWith("package ")) continue;
        if (line.startsWith("import ") && !line.includes("(")) continue; // single-line import

        if (line.trim() === "import (") {
          inImport = true;
          continue;
        }
        if (inImport && line.trim() === ")") {
          inImport = false;
          continue;
        }
        if (inImport) continue;

        result.push(line);
      }
      return result.join("\n");
    };

    return { 
        template,
        parts: {
            ds: stripBoilerplate(ds),
            scanner: stripBoilerplate(scanner),
            comparator: stripBoilerplate(comp)
        }
    };
  }
}
