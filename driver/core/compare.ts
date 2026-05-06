import { TypeNode, parseType } from "./type-ast";

export interface CompareOptions {
  floatEpsilon?: number;
  unorderedArrays?: boolean;
}

function isNumber(x: unknown): x is number {
  return typeof x === "number" && Number.isFinite(x);
}

function stableStringify(value: any): string {
  if (value === null || value === undefined) return "null";
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (typeof value === "object") {
    const keys = Object.keys(value).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

export function deepEqualTyped(
  expected: any,
  actual: any,
  type: TypeNode,
  opts: CompareOptions = {},
): boolean {
  const eps = opts.floatEpsilon ?? 1e-6;

  if (type.kind === "primitive") {
    if (type.primitive === "double" || type.primitive === "float") {
      if (isNumber(expected) && isNumber(actual)) return Math.abs(expected - actual) <= eps;
    }
    return stableStringify(expected) === stableStringify(actual);
  }

  if (type.kind === "node") {
    // Compare on canonical serialized array form (list or level-order array)
    return stableStringify(expected) === stableStringify(actual);
  }

  if (type.kind === "array" || type.kind === "list" || type.kind === "set") {
    if (!Array.isArray(expected) || !Array.isArray(actual)) return false;
    if (opts.unorderedArrays || type.kind === "set") {
      const a = expected.map((x) => stableStringify(x)).sort();
      const b = actual.map((x) => stableStringify(x)).sort();
      return a.length === b.length && a.every((v, i) => v === b[i]);
    }
    if (expected.length !== actual.length) return false;
    for (let i = 0; i < expected.length; i++) {
      if (!deepEqualTyped(expected[i], actual[i], type.element, opts)) return false;
    }
    return true;
  }

  if (type.kind === "map") {
    // Compare by canonical stable stringify to ignore insertion ordering
    return stableStringify(expected) === stableStringify(actual);
  }

  return stableStringify(expected) === stableStringify(actual);
}

export function deepEqualByTypeString(
  expected: any,
  actual: any,
  typeString: string,
  opts: CompareOptions = {},
): boolean {
  return deepEqualTyped(expected, actual, parseType(typeString), opts);
}

