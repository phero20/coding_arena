/**
 * Formats a raw value into a string with appropriate quoting.
 * Numbers and booleans are preserved.
 * Single characters are wrapped in single quotes.
 * Strings are wrapped in double quotes.
 */
export const formatValue = (v: string): string => {
  const t = v.trim();
  if (/^(true|false)$/i.test(t)) return t.toLowerCase();
  if (!isNaN(Number(t)) && t !== "") return t;
  if (t.length === 1) return `'${t}'`;
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  )
    return t;
  return `"${t}"`;
};

/**
 * Heuristically parses raw competitive programming input into a LeetCode-style display.
 * - Detects length-prefixed arrays and transforms them into [val1,val2,...valN].
 * - Brackets space-separated collections.
 * - Joins multiple arguments with a comma.
 */
export const beautifyTestCaseInput = (raw: string): string => {
  const lines = raw
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const current = lines[i];
    const next = lines[i + 1];

    // Heuristic: Length-prefixed array (N \n val1 val2 ... valN)
    if (next && /^\d+$/.test(current)) {
      const len = parseInt(current, 10);
      const parts = next.split(/\s+/).filter(Boolean);
      if (parts.length === len) {
        result.push(`[${parts.map(formatValue).join(",")}]`);
        i++;
        continue;
      }
    }

    // Heuristic: Space-separated collection
    const parts = current.split(/\s+/).filter(Boolean);
    if (parts.length > 1) {
      result.push(`[${parts.map(formatValue).join(",")}]`);
    } else {
      result.push(formatValue(current));
    }
  }

  return result.join(", ");
};
