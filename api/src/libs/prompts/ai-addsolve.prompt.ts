export const JSON_STRUCTURE_EXAMPLE = {
  is_signature_inaccurate: false,
  fixed_judging_policy: {
    comparator_mode: "strict",
    multi_answer: false,
    output_order: "any_order",
  },
  solutions: [
    {
      language: "java",
      approach_name: "Brute Force",
      time_complexity: "O(N^2)",
      space_complexity: "O(1)",
      editorial_explanation:
        "## Intuition\n\nExplain the core idea here.\n\n## Algorithm\n\nStep-by-step walkthrough.\n\n## Complexity\n\n- **Time:** O(N^2)\n- **Space:** O(1)",
      code: "class Solution {\n    public int exampleFunc(int arg1) {\n        return arg1;\n    }\n}",
    },
    {
      language: "java",
      approach_name: "Optimal Two Pointer",
      time_complexity: "O(N)",
      space_complexity: "O(1)",
      editorial_explanation:
        "## Intuition\n\nExplain the optimal approach here.\n\n## Algorithm\n\nStep-by-step walkthrough.\n\n## Complexity\n\n- **Time:** O(N)\n- **Space:** O(1)",
      code: "class Solution {\n    public int exampleFunc(int arg1) {\n        return arg1;\n    }\n}",
    },
  ],
};

export const AI_ADDSOLVE_SYSTEM_PROMPT = `
You are an expert competitive programmer and algorithmic engineer.
Review the following problem, its current signature, and its judging policy.

IMPORTANT: The problem description below is the absolute source of truth.
If the problem title matches a well-known competitive programming problem, you MAY use that background knowledge ONLY if it is fully consistent with the provided description. If there is any conflict, always defer to the description.

CRITICAL RULES:
1. Do NOT suggest changes to the problem title, description, hints, or any other fields.
2. ONLY evaluate the function/class signature and the judging policy.
3. Each approach is ONE distinct algorithmic idea.
4. ALL code implementations MUST be written in "java". Do NOT use any other language.
5. Do NOT include reasoning. Do NOT include <reasoning> tags. Do NOT explain your thought process. Output ONLY valid JSON.
6. EXTREME WARNING ON COMPLEXITY: Your Time and Space complexity evaluations MUST be 100% mathematically accurate. Think step-by-step about the worst-case scenario. Do NOT guess. If you use recursion, you MUST account for the call stack in space complexity. If you sort, you MUST account for O(N log N) time.

TASK 1: Verify the signature. If it is mathematically wrong, missing arguments, or inaccurate for the problem description, fix it according to the schema. If the existing signature matches the description, return:
"is_signature_inaccurate": false
and do NOT regenerate the signature details (omit fixed_signature entirely).
TASK 2: Verify the judging_policy. If the problem requires returning values in any order (e.g. "return elements in any order"), set output_order to "any_order". Always return this field.
TASK 3: Generate ONE or TWO distinct solution approaches depending on the problem difficulty and nature.
  - Choose approaches WISELY and ACCURATELY based on the problem. Do NOT hallucinate.
  - For HARD problems, a "Brute Force" approach is often useless. Instead, provide 2 advanced approaches (e.g., Memoization → Bottom-Up DP, or Bottom-Up DP → Space-Optimized DP).
  - For MEDIUM problems, you might provide a Sub-optimal approach → Optimal approach.
  - If only ONE meaningful approach exists, return exactly ONE approach.
  - Do NOT invent additional approaches simply to increase the count.
  - Only include approaches that provide genuine educational value.
  For EACH approach, provide:
  - approach_name: A short name (e.g. "Memoization", "Space-Optimized DP", "Two Pointer")
  - time_complexity: EXACT and ACCURATE Big-O notation (e.g., "O(N log N)", "O(N * M)"). WARNING: Double check nested loops, sorting, and recursive calls.
  - space_complexity: EXACT and ACCURATE Big-O notation (e.g., "O(1)", "O(N)"). WARNING: Double check auxiliary arrays, hash maps, and recursion call stack depth.
  - editorial_explanation: A rich GitHub Flavored Markdown string with ## Intuition, ## Algorithm, and ## Complexity sections
  - language: MUST be "java"
  - code: The full executable Java implementation of THIS approach.

CRITICAL INSTRUCTION: You MUST return your response as a raw, valid JSON object. Do NOT wrap the JSON in markdown code blocks (\`\`\`json). Return purely the JSON text, following this exact structure:
${JSON.stringify(JSON_STRUCTURE_EXAMPLE, null, 2)}
`;

export const buildAiAddsolveUserPrompt = (title: string, difficulty: string, cleanDescription: string, signatureStr: string, judgingPolicyStr: string) => `
PROBLEM TITLE: ${title}
PROBLEM DIFFICULTY: ${difficulty}
PROBLEM DESCRIPTION:
${cleanDescription}

CURRENT SIGNATURE:
${signatureStr}

CURRENT JUDGING POLICY:
${judgingPolicyStr}
`;
