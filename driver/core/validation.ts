import {
  ClassSignature,
  DriverOptions,
  FunctionSignature,
  TestCase,
} from "./types";

function assert(cond: unknown, msg: string): void {
  if (!cond) throw new Error(`Driver validation failed: ${msg}`);
}

function validateFunctionTestCase(tc: TestCase, sig: FunctionSignature, idx: number): void {
  assert(tc && typeof tc === "object", `testCases[${idx}] must be object`);
  assert(tc.input && typeof tc.input === "object", `testCases[${idx}].input must be object`);

  const ordered = sig.param_order?.length ? sig.param_order : sig.params.map((p) => p.name);
  assert(
    ordered.length === sig.params.length,
    "signature.param_order must match params length",
  );

  for (const p of sig.params) {
    assert(
      Object.prototype.hasOwnProperty.call(tc.input, p.name),
      `testCases[${idx}].input missing param "${p.name}"`,
    );
  }
}

function validateClassTestCase(tc: TestCase, sig: ClassSignature, idx: number): void {
  const input = tc.input as any;
  assert(input && typeof input === "object", `testCases[${idx}].input must be object`);
  assert(Array.isArray(input.commands), `testCases[${idx}].input.commands must be array`);
  assert(Array.isArray(input.arguments), `testCases[${idx}].input.arguments must be array`);
  assert(
    input.commands.length === input.arguments.length,
    `testCases[${idx}] commands/arguments length mismatch`,
  );
  assert(
    input.commands[0] === sig.class_name,
    `testCases[${idx}] first command must be constructor ${sig.class_name}`,
  );

  for (let i = 0; i < input.commands.length; i++) {
    const cmd = input.commands[i];
    if (i === 0) continue;
    const exists = sig.methods.some((m) => m.name === cmd);
    assert(
      exists,
      `testCases[${idx}] unknown class command "${cmd}" at index ${i}`,
    );
  }
}

export function validateDriverOptions(opts: DriverOptions): void {
  assert(opts.userCode && opts.userCode.trim().length > 0, "userCode is required");
  assert(Array.isArray(opts.testCases) && opts.testCases.length > 0, "testCases cannot be empty");

  const isClass = "class_name" in opts.signature;
  if (isClass) {
    const sig = opts.signature as ClassSignature;
    assert(sig.class_name && sig.class_name.length > 0, "class_name is required");
    assert(Array.isArray(sig.methods), "class signature methods must be array");
    opts.testCases.forEach((tc, i) => validateClassTestCase(tc, sig, i));
    return;
  }

  const sig = opts.signature as FunctionSignature;
  assert(sig.name && sig.name.length > 0, "function signature name is required");
  assert(sig.return_type && sig.return_type.length > 0, "function return_type is required");
  assert(Array.isArray(sig.params), "function signature params must be array");
  opts.testCases.forEach((tc, i) => validateFunctionTestCase(tc, sig, i));
}

