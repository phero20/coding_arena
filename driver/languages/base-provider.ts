import { DriverOptions, ExecutionPackage } from "../core/types";

/**
 * Abstract base class for language-specific driver generators.
 * Every language (Java, Python, etc.) must implement this.
 */
export abstract class LanguageProvider {
  abstract language: string;
  abstract judge0Id: number;

  /**
   * Generates the complete source code and stdin for a submission.
   */
  abstract generate(options: DriverOptions): Promise<ExecutionPackage>;

  /**
   * Serializes test cases into a JSONL (JSON Lines) string.
   */
  protected serializeTestCases(testCases: any[]): string {
    return testCases.map(tc => JSON.stringify(tc.input)).join("\n");
  }
}
