import type { DriverOptions } from "../core/types";

export const fixtures: { name: string; opts: DriverOptions; assert: (pkg: { sourceCode: string; stdin: string }) => void }[] = [
  {
    name: "twoSum int[] -> int[]",
    opts: {
      language: "java",
      userCode:
        "class Solution { public int[] twoSum(int[] nums, int target){ return new int[]{0,1}; } }",
      signature: {
        name: "twoSum",
        return_type: "int[]",
        params: [
          { name: "nums", type: "int[]" },
          { name: "target", type: "int" },
        ],
        param_order: ["nums", "target"],
      },
      testCases: [{ input: { nums: [2, 7, 11, 15], target: 9 }, expected_output: [0, 1] }],
    },
    assert: (pkg) => {
      if (!pkg.stdin.includes("4 2 7 11 15 9")) throw new Error("stdin mismatch");
      if (!pkg.sourceCode.includes("FastScanner")) throw new Error("FastScanner missing");
    },
  },
  {
    name: "TreeNode input",
    opts: {
      language: "java",
      userCode: "class Solution { public int maxDepth(TreeNode root){ return 0; } }",
      signature: {
        name: "maxDepth",
        return_type: "int",
        params: [{ name: "root", type: "TreeNode" }],
        param_order: ["root"],
      },
      testCases: [{ input: { root: [3, 9, 20, null, null, 15, 7] }, expected_output: 3 }],
    },
    assert: (pkg) => {
      if (!pkg.stdin.includes("7 3 9 20 null null 15 7")) throw new Error("tree stdin mismatch");
    },
  },
  {
    name: "Map<String,int[]> input",
    opts: {
      language: "java",
      userCode: "import java.util.*; class Solution { public Map<String,int[]> f(Map<String,int[]> m){ return m; } }",
      signature: {
        name: "f",
        return_type: "Map<String,int[]>",
        params: [{ name: "m", type: "Map<String,int[]>" }],
        param_order: ["m"],
      },
      testCases: [{ input: { m: { alpha: [1, 2], beta: [3] } }, expected_output: {} }],
    },
    assert: (pkg) => {
      if (!pkg.stdin.includes("2")) throw new Error("map count missing");
    },
  },
  {
    name: "double tolerance",
    opts: {
      language: "java",
      comparator: { float_epsilon: 1e-4 },
      userCode: "class Solution { public double f(double a){ return a + 0.00001; } }",
      signature: {
        name: "f",
        return_type: "double",
        params: [{ name: "a", type: "double" }],
        param_order: ["a"],
      },
      testCases: [{ input: { a: 1.5 }, expected_output: 1.50001 }],
    },
    assert: (pkg) => {
      if (!pkg.sourceCode.includes("EPS = 0.0001")) throw new Error("eps not injected");
    },
  },
  {
    name: "long[][] array",
    opts: {
      language: "java",
      userCode: "class Solution { public long sum(long[][] g){ return 0L; } }",
      signature: {
        name: "sum",
        return_type: "long",
        params: [{ name: "g", type: "long[][]" }],
        param_order: ["g"],
      },
      testCases: [{ input: { g: [[1, 2], [3, 4]] }, expected_output: 10 }],
    },
    assert: (pkg) => {
      if (!pkg.stdin.includes("2 2 1 2 2 3 4")) throw new Error("matrix stdin");
    },
  },
  {
    name: "boolean[]",
    opts: {
      language: "java",
      userCode: "class Solution { public boolean f(boolean[] a){ return a.length>0; } }",
      signature: {
        name: "f",
        return_type: "boolean",
        params: [{ name: "a", type: "boolean[]" }],
        param_order: ["a"],
      },
      testCases: [{ input: { a: [true, false] }, expected_output: true }],
    },
    assert: (pkg) => {
      if (!pkg.stdin.includes("2 true false")) throw new Error("bool stdin");
    },
  },
  {
    name: "String[] with spaces",
    opts: {
      language: "java",
      userCode: "class Solution { public int f(String[] a){ return a.length; } }",
      signature: {
        name: "f",
        return_type: "int",
        params: [{ name: "a", type: "string[]" }],
        param_order: ["a"],
      },
      testCases: [{ input: { a: ["Hello World", "A  B"] }, expected_output: 2 }],
    },
    assert: (pkg) => {
      // base64 tokens should appear, not raw spaces
      if (pkg.stdin.includes("Hello World")) throw new Error("raw string leaked into stdin");
    },
  },
  {
    name: "nested List<List<int>> empty",
    opts: {
      language: "java",
      userCode: "import java.util.*; class Solution { public int f(List<List<Integer>> a){ return a.size(); } }",
      signature: {
        name: "f",
        return_type: "int",
        params: [{ name: "a", type: "List<List<int>>" }],
        param_order: ["a"],
      },
      testCases: [{ input: { a: [] }, expected_output: 0 }],
    },
    assert: (pkg) => {
      if (!pkg.stdin.includes("0")) throw new Error("empty list stdin");
    },
  },
  {
    name: "null-heavy TreeNode",
    opts: {
      language: "java",
      userCode: "class Solution { public int f(TreeNode r){ return 0; } }",
      signature: {
        name: "f",
        return_type: "int",
        params: [{ name: "r", type: "TreeNode" }],
        param_order: ["r"],
      },
      testCases: [{ input: { r: [1, null, 2, null, 3] }, expected_output: 0 }],
    },
    assert: (pkg) => {
      if (!pkg.stdin.includes("5 1 null 2 null 3")) throw new Error("null tree stdin");
    },
  },
  {
    name: "design problem basic commands",
    opts: {
      language: "java",
      userCode:
        "import java.util.*; class MyDS{ MyDS(int n){} void add(int x){} int get(){return 1;} } class Solution {}",
      signature: {
        class_name: "MyDS",
        constructor_params: [{ name: "n", type: "int" }],
        methods: [
          { name: "add", return_type: "void", params: [{ name: "x", type: "int" }] },
          { name: "get", return_type: "int", params: [] },
        ],
      },
      testCases: [
        {
          input: {
            commands: ["MyDS", "add", "get"],
            arguments: [[2], [9], []],
          },
          expected_output: [null, null, 1],
        },
      ],
    },
    assert: (pkg) => {
      if (!pkg.stdin.includes("TXlEUw==")) throw new Error("cmd not base64");
    },
  },
  // ── NEW: double[][] matrix ──────────────────────────────────────────────
  {
    name: "double[][] matrix input",
    opts: {
      language: "java",
      userCode: "class Solution { public double f(double[][] g){ return g[0][0]; } }",
      signature: {
        name: "f",
        return_type: "double",
        params: [{ name: "g", type: "double[][]" }],
        param_order: ["g"],
      },
      testCases: [{ input: { g: [[1.5, 2.5], [3.5, 4.5]] }, expected_output: 1.5 }],
    },
    assert: (pkg) => {
      // 2 rows x 2 cols encoded as: 2 2 1.5 2.5 2 3.5 4.5
      if (!pkg.stdin.includes("2 2")) throw new Error("double[][] dims missing");
      if (!pkg.stdin.includes("1.5")) throw new Error("double[][] values missing");
    },
  },

  // ── NEW: Map<String, List<int[]>> ──────────────────────────────────────
  {
    name: "Map<String,List<int[]>> complex nested",
    opts: {
      language: "java",
      userCode:
        "import java.util.*; class Solution { public int f(Map<String,List<int[]>> m){ return m.size(); } }",
      signature: {
        name: "f",
        return_type: "int",
        params: [{ name: "m", type: "Map<String,List<int[]>>" }],
        param_order: ["m"],
      },
      testCases: [
        {
          input: { m: { a: [[1, 2], [3]], b: [[4]] } },
          expected_output: 2,
        },
      ],
    },
    assert: (pkg) => {
      // 2 map entries should be encoded
      if (!pkg.stdin.includes("2")) throw new Error("map entry count missing");
      // strings are base64
      if (pkg.stdin.includes(" a ") || pkg.stdin.includes(" b "))
        throw new Error("raw string keys leaked");
    },
  },

  // ── NEW: Design — MinStack ──────────────────────────────────────────────
  {
    name: "design MinStack",
    opts: {
      language: "java",
      userCode: `import java.util.*;
class MinStack {
    Deque<int[]> st = new ArrayDeque<>();
    MinStack() {}
    void push(int val) { int m = st.isEmpty() ? val : Math.min(val, st.peek()[1]); st.push(new int[]{val, m}); }
    void pop() { st.pop(); }
    int top() { return st.peek()[0]; }
    int getMin() { return st.peek()[1]; }
}`,
      signature: {
        class_name: "MinStack",
        constructor_params: [],
        methods: [
          { name: "push",   return_type: "void", params: [{ name: "val", type: "int" }] },
          { name: "pop",    return_type: "void", params: [] },
          { name: "top",    return_type: "int",  params: [] },
          { name: "getMin", return_type: "int",  params: [] },
        ],
      },
      testCases: [
        {
          input: {
            commands:  ["MinStack", "push", "push", "push", "getMin", "pop", "top", "getMin"],
            arguments: [[], [-2], [0], [-3], [], [], [], []],
          },
          expected_output: [null, null, null, null, -3, null, 0, -2],
        },
      ],
    },
    assert: (pkg) => {
      if (!pkg.stdin.includes("TWluU3RhY2s=")) throw new Error("MinStack ctor cmd not base64");
    },
  },

  // ── NEW: Design — Trie (multi-method, string args) ─────────────────────
  {
    name: "design Trie with string args",
    opts: {
      language: "java",
      userCode: `import java.util.*;
class Trie {
    Map<Character,Trie> c = new HashMap<>(); boolean end;
    Trie() {}
    void insert(String w){ Trie n=this; for(char ch:w.toCharArray()){ n.c.putIfAbsent(ch,new Trie()); n=n.c.get(ch); } n.end=true; }
    boolean search(String w){ Trie n=this; for(char ch:w.toCharArray()){ if(!n.c.containsKey(ch)) return false; n=n.c.get(ch); } return n.end; }
    boolean startsWith(String p){ Trie n=this; for(char ch:p.toCharArray()){ if(!n.c.containsKey(ch)) return false; n=n.c.get(ch); } return true; }
}`,
      signature: {
        class_name: "Trie",
        constructor_params: [],
        methods: [
          { name: "insert",     return_type: "void",    params: [{ name: "word",   type: "string" }] },
          { name: "search",     return_type: "boolean", params: [{ name: "word",   type: "string" }] },
          { name: "startsWith", return_type: "boolean", params: [{ name: "prefix", type: "string" }] },
        ],
      },
      testCases: [
        {
          input: {
            commands:  ["Trie", "insert", "search", "search", "startsWith", "insert", "search"],
            arguments: [[], ["apple"], ["apple"], ["app"], ["app"], ["app"], ["app"]],
          },
          expected_output: [null, null, true, false, true, null, true],
        },
      ],
    },
    assert: (pkg) => {
      // string args must be base64 encoded
      if (pkg.stdin.includes(" apple ") || pkg.stdin.includes(" app "))
        throw new Error("raw string args leaked");
    },
  },
];
