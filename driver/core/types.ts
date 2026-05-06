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
  inplace_param_index?: number;
  inplace_param_indices?: number[];
  testcase_serialization_version?: string;
}

export interface MethodSignature {
  name: string;
  return_type: string;
  params: FunctionParam[];
}

export interface ClassSignature {
  class_name: string;
  constructor_params: FunctionParam[];
  methods: MethodSignature[];
}

export interface TestCase {
  input: Record<string, any>;
  expected_output: any;
  is_sample?: boolean;
}

export interface DriverOptions {
  language: string;
  userCode: string;
  signature: FunctionSignature | ClassSignature;
  testCases: TestCase[];
  comparator?: {
    float_epsilon?: number;
    unordered_arrays?: boolean;
  };
  diagnostics?: {
    verbose?: boolean;
  };
}

export interface ExecutionPackage {
  sourceCode: string;
  stdin: string;
  languageId: number;
}
