/**
 * Canonical testcase typing + coercion for AI-imported problems.
 * Single source of truth: parse LeetCode-style type strings into a small AST,
 * then coerce/validate values deterministically (JSON-native + legacy string encodings).
 */

import type {
  DriverReadyFunctionSignature,
  FunctionSignature,
  TestCase,
} from "../../types/problems/problem.types";

export type PrimitiveBase =
  | "int"
  | "long"
  | "double"
  | "float"
  | "bool"
  | "string"
  | "char";

export type CanonicalType =
  | { kind: "primitive"; base: PrimitiveBase }
  | { kind: "array"; element: CanonicalType }
  | { kind: "graph"; variant: "listnode" | "treenode" };

const INT_LIKE = new Set([
  "int",
  "integer",
  "long",
  "short",
  "byte",
  "number",
  "int32",
  "int64",
]);

const FLOAT_LIKE = new Set(["double", "float", "number"]);

function normalizeRawType(raw: string): string {
  return raw
    .trim()
    .replace(/\s+/g, "")
    .replace(/Integer/g, "int")
    .replace(/Boolean/g, "boolean")
    .replace(/Character/g, "char");
}

/**
 * Strip outer List<T> / ArrayList<T> / vector<T> / LinkedList<T> wrappers once.
 */
function stripCollectionWrapper(s: string): { inner: string; isList: boolean } {
  const m =
    /^(?:list|arraylist|linkedlist|vector)<(.+)>$/i.exec(s) ||
    /^Array<(.+)>$/i.exec(s);
  if (m) return { inner: m[1], isList: true };
  return { inner: s, isList: false };
}

function parsePrimitive(lower: string): CanonicalType | null {
  const l = lower.toLowerCase();
  if (INT_LIKE.has(l) || l === "bigint") return { kind: "primitive", base: "int" };
  if (FLOAT_LIKE.has(l)) return { kind: "primitive", base: "double" };
  if (l === "bool" || l === "boolean") return { kind: "primitive", base: "bool" };
  if (l === "string" || l === "str") return { kind: "primitive", base: "string" };
  if (l === "char") return { kind: "primitive", base: "char" };
  return null;
}

export function parseLeetcodeTypeString(typeStr: string): CanonicalType {
  let s = normalizeRawType(typeStr);
  if (!s) {
    throw new Error(`Empty type string`);
  }

  const lowerFull = s.toLowerCase();
  if (lowerFull.includes("listnode")) {
    return { kind: "graph", variant: "listnode" };
  }
  if (lowerFull.includes("treenode")) {
    return { kind: "graph", variant: "treenode" };
  }

  let listDepth = 0;
  // Repeated List<...> wrappers => nested list / 2D
  for (;;) {
    const { inner, isList } = stripCollectionWrapper(s);
    if (!isList) break;
    s = inner;
    listDepth++;
  }

  let arraySuffixDepth = 0;
  while (s.endsWith("[]")) {
    arraySuffixDepth++;
    s = s.slice(0, -2);
  }

  const prim = parsePrimitive(s.toLowerCase());
  if (!prim) {
    // Unknown named type (e.g. custom struct) — treat as opaque JSON
    return { kind: "primitive", base: "string" };
  }

  let t: CanonicalType = prim;
  for (let i = 0; i < arraySuffixDepth; i++) {
    t = { kind: "array", element: t };
  }
  for (let i = 0; i < listDepth; i++) {
    t = { kind: "array", element: t };
  }
  return t;
}

function isInt(n: number): boolean {
  return Number.isFinite(n) && Math.floor(n) === n;
}

function coercePrimitive(
  val: unknown,
  base: PrimitiveBase,
  path: string,
): { ok: true; value: unknown } | { ok: false; errors: string[] } {
  if (val === null || val === undefined) {
    return { ok: false, errors: [`${path}: null not allowed for ${base}`] };
  }
  if (base === "bool") {
    if (typeof val === "boolean") return { ok: true, value: val };
    if (typeof val === "string") {
      const l = val.trim().toLowerCase();
      if (l === "true") return { ok: true, value: true };
      if (l === "false") return { ok: true, value: false };
    }
    return { ok: false, errors: [`${path}: expected boolean, got ${typeof val}`] };
  }
  if (base === "string" || base === "char") {
    if (typeof val === "string") {
      if (base === "char" && val.length > 1) {
        return { ok: false, errors: [`${path}: char must be length 0-1 string`] };
      }
      return { ok: true, value: val };
    }
    return { ok: false, errors: [`${path}: expected string, got ${typeof val}`] };
  }
  if (base === "int" || base === "long") {
    if (typeof val === "number") {
      if (!isInt(val)) {
        return { ok: false, errors: [`${path}: expected integer, got ${val}`] };
      }
      return { ok: true, value: val };
    }
    if (typeof val === "string") {
      const t = val.trim().toLowerCase();
      if (t === "null") {
        return { ok: false, errors: [`${path}: null string not valid for int`] };
      }
      const n = Number(t);
      if (!Number.isFinite(n) || !isInt(n)) {
        return { ok: false, errors: [`${path}: invalid int from string "${val}"`] };
      }
      return { ok: true, value: n };
    }
    return { ok: false, errors: [`${path}: expected number for int, got ${typeof val}`] };
  }
  // double / float
  if (typeof val === "number") return { ok: true, value: val };
  if (typeof val === "string") {
    const n = Number(val.trim());
    if (!Number.isFinite(n)) {
      return { ok: false, errors: [`${path}: invalid number from string "${val}"`] };
    }
    return { ok: true, value: n };
  }
  return { ok: false, errors: [`${path}: expected number, got ${typeof val}`] };
}

/**
 * Parse 1D row from comma-separated string.
 */
function splitCsvRow(row: string): string[] {
  return row
    .split(",")
    .map((x) => x.trim())
    .filter((x) => x.length > 0);
}

function coerceArray(
  val: unknown,
  element: CanonicalType,
  path: string,
): { ok: true; value: unknown[] } | { ok: false; errors: string[] } {
  if (Array.isArray(val)) {
    const out: unknown[] = [];
    for (let i = 0; i < val.length; i++) {
      const r = coerceValueForType(val[i], element, `${path}[${i}]`);
      if (!r.ok) return r;
      out.push(r.value);
    }
    return { ok: true, value: out };
  }

  if (typeof val === "string") {
    // 2D+: semicolon-separated rows, comma inside row
    if (element.kind === "array") {
      const rows = val.split(";").map((r) => r.trim()).filter(Boolean);
      const out: unknown[] = [];
      for (let i = 0; i < rows.length; i++) {
        const parts = splitCsvRow(rows[i]);
        const rowOut: unknown[] = [];
        for (let j = 0; j < parts.length; j++) {
          const r = coerceValueForType(
            parts[j],
            element.element,
            `${path}[${i}][${j}]`,
          );
          if (!r.ok) return r;
          rowOut.push(r.value);
        }
        out.push(rowOut);
      }
      return { ok: true, value: out };
    }
    // 1D: comma-separated (legacy AI / LeetCode text)
    const parts = splitCsvRow(val);
    const out: unknown[] = [];
    for (let i = 0; i < parts.length; i++) {
      const r = coerceValueForType(parts[i], element, `${path}[${i}]`);
      if (!r.ok) return r;
      out.push(r.value);
    }
    return { ok: true, value: out };
  }

  return {
    ok: false,
    errors: [`${path}: expected array or encoded string, got ${typeof val}`],
  };
}

function coerceGraph(
  val: unknown,
  variant: "listnode" | "treenode",
  path: string,
): { ok: true; value: unknown } | { ok: false; errors: string[] } {
  // LeetCode-style serialization: ListNode <=> number[], TreeNode <=> (number|null)[]
  if (Array.isArray(val)) {
    if (variant === "listnode") {
      const out: unknown[] = [];
      for (let i = 0; i < val.length; i++) {
        const r = coerceValueForType(val[i], { kind: "primitive", base: "int" }, `${path}[${i}]`);
        if (!r.ok) return r;
        out.push(r.value);
      }
      return { ok: true, value: out };
    }
    const out: unknown[] = [];
    for (let i = 0; i < val.length; i++) {
      const v = val[i];
      if (v === null || v === "null") {
        out.push(null);
        continue;
      }
      const r = coerceValueForType(v, { kind: "primitive", base: "int" }, `${path}[${i}]`);
      if (!r.ok) return r;
      out.push(r.value);
    }
    return { ok: true, value: out };
  }

  if (typeof val === "string") {
    if (variant === "treenode") {
      const parts = val.split(",").map((s) => s.trim());
      const out: unknown[] = [];
      for (let i = 0; i < parts.length; i++) {
        const tok = parts[i];
        if (!tok) continue;
        if (tok.toLowerCase() === "null") {
          out.push(null);
          continue;
        }
        const r = coercePrimitive(tok, "int", `${path}[${i}]`);
        if (!r.ok) return r;
        out.push(r.value);
      }
      return { ok: true, value: out };
    }
    return coerceArray(val, { kind: "array", element: { kind: "primitive", base: "int" } }, path);
  }

  return {
    ok: false,
    errors: [`${path}: ListNode/TreeNode expects JSON array or CSV string, got ${typeof val}`],
  };
}

export function coerceValueForType(
  val: unknown,
  type: CanonicalType,
  path: string,
): { ok: true; value: unknown } | { ok: false; errors: string[] } {
  switch (type.kind) {
    case "primitive":
      return coercePrimitive(val, type.base, path);
    case "array": {
      const a = coerceArray(val, type.element, path);
      if (!a.ok) return a;
      return { ok: true, value: a.value };
    }
    case "graph":
      return coerceGraph(val, type.variant, path);
    default:
      return { ok: true, value: val };
  }
}

export interface RawTestCase {
  input?: Record<string, unknown>;
  expected_output?: unknown;
  timeout_ms?: number;
  memory_limit_mb?: number;
  weight?: number;
  is_sample?: boolean;
  determinism_check?: "unique" | "multi_valid";
  comparator_mode?: "strict" | "problem_specific";
  comparator_notes?: string;
}

function mergeErrors(
  acc: string[],
  next: { ok: false; errors: string[] } | undefined,
): void {
  if (next && !next.ok) acc.push(...next.errors);
}

/**
 * Normalize one testcase: coerce input keys + expected_output to canonical JSON shapes.
 */
export function normalizeTestCase(
  raw: RawTestCase,
  index: number,
  bucket: "public" | "hidden",
  signature: FunctionSignature,
): { ok: true; case: RawTestCase } | { ok: false; errors: string[] } {
  const errors: string[] = [];
  const prefix = `${bucket}[${index}]`;

  if (!signature?.params?.length) {
    return { ok: false, errors: [`${prefix}: missing function_signature.params`] };
  }

  const inputObj = raw.input;
  if (!inputObj || typeof inputObj !== "object" || Array.isArray(inputObj)) {
    return { ok: false, errors: [`${prefix}: input must be a JSON object`] };
  }

  const expandedInput: Record<string, unknown> = {};

  for (const param of signature.params) {
    const key = param.name;
    if (!(key in inputObj)) {
      errors.push(`${prefix}.input: missing key "${key}" (required by signature)`);
      continue;
    }
    let canon: CanonicalType;
    try {
      canon = parseLeetcodeTypeString(param.type);
    } catch (e: any) {
      errors.push(`${prefix}.input.${key}: bad type "${param.type}": ${e?.message ?? e}`);
      continue;
    }
    const r = coerceValueForType(inputObj[key], canon, `${prefix}.input.${key}`);
    if (r.ok) expandedInput[key] = r.value;
    else mergeErrors(errors, r);
  }

  let outCanon: CanonicalType;
  try {
    outCanon = parseLeetcodeTypeString(signature.return_type);
  } catch (e: any) {
    errors.push(`${prefix}: bad return_type "${signature.return_type}": ${e?.message ?? e}`);
    return { ok: false, errors };
  }

  const outR = coerceValueForType(
    raw.expected_output,
    outCanon,
    `${prefix}.expected_output`,
  );
  if (!outR.ok) mergeErrors(errors, outR);

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    case: {
      ...raw,
      input: expandedInput,
      expected_output: outR.ok ? outR.value : raw.expected_output,
    },
  };
}

export function normalizeTestSuite(
  publicCases: RawTestCase[],
  hiddenCases: RawTestCase[],
  signature: FunctionSignature,
): { publicTests: TestCase[]; hiddenTests: TestCase[] } {
  const allErrors: string[] = [];

  const pub: TestCase[] = [];
  publicCases.forEach((t, i) => {
    const r = normalizeTestCase(t, i, "public", signature);
    if (r.ok) pub.push(r.case as TestCase);
    else allErrors.push(...r.errors);
  });

  const hid: TestCase[] = [];
  hiddenCases.forEach((t, i) => {
    const r = normalizeTestCase(t, i, "hidden", signature);
    if (r.ok) hid.push(r.case as TestCase);
    else allErrors.push(...r.errors);
  });

  if (allErrors.length > 0) {
    const msg = allErrors.slice(0, 25).join("\n");
    const more =
      allErrors.length > 25 ? `\n... and ${allErrors.length - 25} more` : "";
    throw new Error(`Testcase validation failed:\n${msg}${more}`);
  }

  if (pub.length === 0 || hid.length === 0) {
    throw new Error(
      "After validation, public or hidden test list is empty (AI must return both).",
    );
  }

  return { publicTests: pub, hiddenTests: hid };
}

export function enrichSignatureForDriver(
  signature: FunctionSignature,
): DriverReadyFunctionSignature {
  const maybeVersion = signature.testcase_serialization_version;
  const version =
    typeof maybeVersion === "string" && maybeVersion.length > 0
      ? maybeVersion
      : "canonical_json_v1";

  return {
    name: signature.name,
    return_type: signature.return_type,
    params: signature.params,
    param_order: signature.params.map((p) => p.name),
    testcase_serialization_version: version,
  };
}
