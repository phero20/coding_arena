import path from "path";
import fs from "fs/promises";
import { LanguageProvider } from "../base-provider";
import { DriverOptions, ExecutionPackage } from "../../core/types";
import { JUDGE0_LANGUAGE_IDS } from "../../core/constants";
import { JavaTypeMapper } from "./java-type-mapper";

/**
 * Java implementation of the Driver Provider.
 */
export class JavaProvider extends LanguageProvider {
  readonly language = "java";
  readonly judge0Id = JUDGE0_LANGUAGE_IDS.java;

  private readonly mapper = new JavaTypeMapper();

  async generate(options: DriverOptions): Promise<ExecutionPackage> {
    const templatePath = path.join(__dirname, "template.java");
    const template = await fs.readFile(templatePath, "utf-8");

    // 1. Generate the dynamic parts via the mapper
    const extractionLines = options.signature.params
      .map(p => `                ${this.mapper.generateExtractionLine(p)}`)
      .join("\n");
    
    const executionBlock = this.mapper.generateExecutionBlock(options.signature);
    
    // 2. Stitch everything together
    const sourceCode = template
      .replace("// {{DRIVER_LOGIC_PLACEHOLDER}}", `${extractionLines}\n${executionBlock}`)
      .replace("{{USER_CODE}}", options.userCode);

    // 3. Serialize inputs into the "Flat-Line" protocol
    const stdinLines = [
      options.testCases.length.toString(),
      ...options.testCases.map(tc => this.mapper.flattenInput(tc.input, options.signature))
    ];

    return {
      sourceCode,
      stdin: stdinLines.join("\n"),
      languageId: this.judge0Id
    };
  }
}
