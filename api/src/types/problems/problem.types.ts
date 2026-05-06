export interface Example {
  example_num: number;
  example_text: string;
  images: string[];
}

export interface CodeSnippets {
  python?: string;
  cpp?: string;
  java?: string;
  javascript?: string;
  typescript?: string;
  go?: string;
  rust?: string;
  [language: string]: string | undefined;
}

export interface FunctionParameter {
  name: string;
  type: string;
}

export interface FunctionSignature {
  name: string;
  return_type: string;
  params: FunctionParameter[];
  /** Set after canonical import; optional on raw dataset rows. */
  param_order?: string[];
  inplace_param_index?: number;
  /** Wire format for testcase values after canonical coercion. */
  testcase_serialization_version?: string;
}

export interface MethodSignature {
  name: string;
  return_type: string;
  params: FunctionParameter[];
}

export interface ClassSignature {
  class_name: string;
  constructor_params: FunctionParameter[];
  methods: MethodSignature[];
}

export interface JudgingPolicy {
  comparator_mode?: 'strict' | 'problem_specific';
  multi_answer?: boolean;
  validation_policy?: string;
  output_order?: 'strict' | 'any_order';
  audit_hints?: string[];
}

/** Signature returned by enrichSignatureForDriver (always has driver metadata). */
export type DriverReadyFunctionSignature = FunctionSignature & {
  param_order: string[];
  testcase_serialization_version: string;
};

export interface Problem {
  title: string;
  problem_id: string; // Keeping snake_case as requested
  frontend_id?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  problem_slug: string;
  topics: string[];
  description: string;
  examples: Example[];
  constraints: string[];
  follow_ups: string[];
  hints: string[];
  code_snippets: CodeSnippets;
  problem_type: 'function' | 'class' | 'interactive';
  function_signature?: FunctionSignature;
  class_signature?: ClassSignature;
  judging_policy?: JudgingPolicy;
  solutions?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateOrUpdateProblemInput {
  title: string;
  problem_id: string;
  frontend_id?: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  problem_slug: string;
  topics?: string[];
  description: string;
  examples?: Example[];
  constraints?: string[];
  follow_ups?: string[];
  hints?: string[];
  code_snippets?: CodeSnippets;
  problem_type?: 'function' | 'class' | 'interactive';
  function_signature?: FunctionSignature;
  class_signature?: ClassSignature;
  judging_policy?: JudgingPolicy;
  solutions?: string;
}

export type ProblemTestType = 'public' | 'hidden' | 'stress' | 'ai_eval';

export interface TestCase {
  input: any; // Now supports structured JSON objects
  expected_output: any; // Now supports structured JSON arrays/objects
  timeout_ms?: number;
  memory_limit_mb?: number;
  weight?: number;
  is_sample?: boolean;
  determinism_check?: 'unique' | 'multi_valid';
  comparator_mode?: 'strict' | 'problem_specific';
  comparator_notes?: string;
}

export interface ProblemTest {
  problem_id: string;
  type: ProblemTestType;
  cases: TestCase[];
  createdAt: Date;
  updatedAt: Date;
}
