/**
 * parsers/index.ts
 *
 * Registry that maps TestRunner → parser function.
 * Import this and call getParser(testRunner) to get the right parser.
 */

import type { ExerciseOutputParser } from "../types";
import type { TestRunner } from "../language-map";

import { parsePytest } from "./pytest.parser";
import { parseJest } from "./jest.parser";
import { parseJUnit } from "./junit.parser";
import { parseGoTest } from "./gotest.parser";
import { parseCargo } from "./cargo.parser";
import { parseRSpec } from "./rspec.parser";
import { parseDotnet } from "./dotnet.parser";
import { parseUnity } from "./unity.parser";
import { parseCatch2 } from "./catch2.parser";
import { parseBash } from "./bash.parser";

const PARSER_REGISTRY: Record<TestRunner, ExerciseOutputParser> = {
  pytest: parsePytest,
  jest: parseJest,
  junit: parseJUnit,
  gotest: parseGoTest,
  cargo: parseCargo,
  rspec: parseRSpec,
  dotnet: parseDotnet,
  unity: parseUnity,
  catch2: parseCatch2,
  bash: parseBash,
};

/**
 * Returns the parser function for a given test runner.
 *
 * @example
 * const parser = getParser("pytest");
 * const result = parser(judge0Stdout);
 */
export function getParser(testRunner: TestRunner): ExerciseOutputParser {
  const parser = PARSER_REGISTRY[testRunner];
  if (!parser) {
    throw new Error(
      `No parser registered for test runner "${testRunner}". ` +
        `Add it to PARSER_REGISTRY in parsers/index.ts.`,
    );
  }
  return parser;
}

export { PARSER_REGISTRY };
