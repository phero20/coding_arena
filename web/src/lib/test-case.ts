/**
 * Formats a raw value into a string with appropriate quoting for display.
 */
export const formatValue = (v: any): string => {
  if (v === null || v === undefined) return "null";

  if (typeof v === "boolean") return String(v);
  if (typeof v === "number") return String(v);
  if (typeof v === "bigint") return v.toString();

  if (Array.isArray(v)) return `[${v.map(formatValue).join(",")}]`;

  if (typeof v === "object") {
    try {
      return JSON.stringify(v);
    } catch {
      return "[Unserializable Object]";
    }
  }

  // Strings (do NOT trim; spaces can be meaningful)
  const t = String(v);

  // Already quoted strings: keep as-is
  if (
    (t.startsWith('"') && t.endsWith('"') && t.length >= 2) ||
    (t.startsWith("'") && t.endsWith("'") && t.length >= 2)
  ) {
    return t;
  }

  // Single character: display like a char literal
  if (t.length === 1) return `'${t}'`;

  // Default: JSON-style string quoting
  return JSON.stringify(t);
};

function safeJsonParse(raw: string): unknown | undefined {
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function looksLikeJson(raw: string): boolean {
  const s = raw.trim();
  if (!s) return false;
  const starts = s[0];
  const ends = s[s.length - 1];
  return (
    (starts === "{" && ends === "}") ||
    (starts === "[" && ends === "]") ||
    (starts === '"' && ends === '"')
  );
}

/**
 * Transforms test case input/output into a professional display format.
 * - If input is an object: formats as "key1 = val1, key2 = val2"
 * - If input is a string: uses legacy heuristic parsing
 */
export const beautifyTestCaseInput = (raw: any): string => {
  if (raw === null || raw === undefined) return "";

  let parsed = raw;
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (looksLikeJson(trimmed)) {
      const maybe = safeJsonParse(trimmed);
      if (maybe !== undefined) parsed = maybe;
    }
  }

  if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
    return Object.entries(parsed)
      .map(([key, val]) => `${key} = ${formatValue(val)}`)
      .join("\n");
  }

  if (Array.isArray(parsed) || typeof parsed !== "string") {
    return formatValue(parsed);
  }

  const lines = raw
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

  return result.join("\n");
};
