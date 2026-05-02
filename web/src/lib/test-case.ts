/**
 * Formats a raw value into a string with appropriate quoting for display.
 */
export const formatValue = (v: any): string => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "boolean") return String(v);
  if (typeof v === "number") return String(v);
  if (Array.isArray(v)) {
    return `[${v.map(formatValue).join(",")}]`;
  }
  if (typeof v === "object") {
    return JSON.stringify(v);
  }
  
  // For strings, handle quotes
  const t = String(v).trim();
  if (t.length === 1 && !isNaN(Number(t)) === false) return `'${t}'`;
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  )
    return t;
  return `"${t}"`;
};

/**
 * Transforms test case input/output into a professional display format.
 * - If input is an object: formats as "key1 = val1, key2 = val2"
 * - If input is a string: uses legacy heuristic parsing
 */
export const beautifyTestCaseInput = (raw: any): string => {
  if (!raw) return "";

  // New Structured Format (Object)
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return Object.entries(raw)
      .map(([key, val]) => `${key} = ${formatValue(val)}`)
      .join(", ");
  }

  // Fallback/Output Format (Array or primitive)
  if (Array.isArray(raw) || typeof raw !== "string") {
    return formatValue(raw);
  }

  // Legacy String Heuristic
  const lines = raw
    .trim()
    .split("\n")
    .map((l: string) => l.trim())
    .filter(Boolean);
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const current = lines[i];
    const next = lines[i + 1];

    if (next && /^\d+$/.test(current)) {
      const len = parseInt(current, 10);
      const parts = next.split(/\s+/).filter(Boolean);
      if (parts.length === len) {
        result.push(`[${parts.map(formatValue).join(",")}]`);
        i++;
        continue;
      }
    }

    const parts = current.split(/\s+/).filter(Boolean);
    if (parts.length > 1) {
      result.push(`[${parts.map(formatValue).join(",")}]`);
    } else {
      result.push(formatValue(current));
    }
  }

  return result.join(", ");
};
