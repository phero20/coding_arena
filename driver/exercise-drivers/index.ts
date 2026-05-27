/**
 * exercises-driver/index.ts
 *
 * Public API for the exercism exercise judge system.
 *
 * Usage from the API service:
 *
 *   import { combine, getParser, getTrackConfig, isJudge0Supported } from "@slavecode/driver/exercises-driver";
 *
 *   // 1. Check if the track is supported by Judge0
 *   if (!isJudge0Supported(trackSlug)) {
 *     // Route to AI judge
 *   }
 *
 *   // 2. Combine user code + test code into a Judge0-ready package
 *   const { sourceCode, languageId } = combine({
 *     trackSlug,
 *     exerciseSlug,
 *     userCode,
 *     testCode,   // from your stored exercise JSON
 *   });
 *
 *   // 3. Send to Judge0 (using your existing Judge0Service)
 *   const judge0Result = await judge0Service.createAndPoll({ sourceCode, languageId });
 *
 *   // 4. Parse the result
 *   const trackConfig = getTrackConfig(trackSlug)!;
 *   const parser = getParser(trackConfig.testRunner);
 *   const result = parser(judge0Result.stdout ?? "");
 *
 *   // result.passed, result.totalTests, result.failures, etc.
 */

export { combine } from "./combiner";
export { getTrackConfig, isJudge0Supported, SUPPORTED_TRACKS } from "./language-map";
export { getParser, PARSER_REGISTRY } from "./parsers/index";
export type {
  CombineOptions,
  CombineResult,
  ExerciseRunResult,
  TestFailure,
  ExerciseOutputParser,
  ExerciseCombiner,
} from "./types";
export type { TrackConfig, TestRunner } from "./language-map";
