/**
 * Core type definitions for the Judge Driver system.
 * Shared between the Driver module and the API.
 */

export interface FunctionParam {
  name: string;
  type: string;
}

export interface FunctionSignature {
  name: string;
  return_type: string;
  params: FunctionParam[];
  param_order: string[];
}

export interface TestCase {
  input: Record<string, any>;
  expected_output: any;
  is_sample?: boolean;
}

export interface DriverOptions {
  language: string;
  userCode: string;
  signature: FunctionSignature;
  testCases: TestCase[];
}

export interface ExecutionPackage {
  sourceCode: string;
  stdin: string;
  languageId: number;
}
