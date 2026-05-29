import type { TestCase } from "../../../types/problems/problem.types";

export function hasInvalidTwoSumExpectedOutput(cases: TestCase[]): boolean {
  for (const testCase of cases) {
    const input = testCase.input;
    const expected = testCase.expected_output;
    if (
      !input ||
      typeof input !== "object" ||
      !Array.isArray((input as Record<string, unknown>).nums) ||
      typeof (input as Record<string, unknown>).target !== "number"
    ) {
      continue;
    }
    if (
      !Array.isArray(expected) ||
      expected.length !== 2 ||
      !Number.isInteger(expected[0]) ||
      !Number.isInteger(expected[1])
    ) {
      return true;
    }
    const nums = (input as { nums: number[]; target: number }).nums;
    const target = (input as { nums: number[]; target: number }).target;
    const i = expected[0] as number;
    const j = expected[1] as number;
    if (
      i < 0 ||
      j < 0 ||
      i >= nums.length ||
      j >= nums.length ||
      i === j ||
      nums[i] + nums[j] !== target
    ) {
      return true;
    }
  }
  return false;
}
