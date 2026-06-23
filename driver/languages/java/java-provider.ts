import path from "path";
import fs from "fs/promises";
import { LanguageProvider } from "../base-provider";
import { DriverOptions, ExecutionPackage } from "../../core/types";
import { JUDGE0_LANGUAGE_IDS } from "../../core/constants";
import { JavaTypeMapper } from "./java-type-mapper";
import { validateDriverOptions } from "../../core/validation";

const PARTS_DIR = path.join(__dirname, "parts");

/** Load the 5 partial template files and stitch them into the skeleton. */
async function loadTemplate(): Promise<string> {
  const readPart = async (p: string) => {
    try {
      return await fs.readFile(p, "utf-8");
    } catch (e: any) {
      throw new Error(`Java template part missing/unreadable: ${p} (${e?.message ?? e})`);
    }
  };
  const [skeleton, dataStructures, fastScanner, serializer, comparator, builders] =
    await Promise.all([
      readPart(path.join(__dirname, "template.java")),
      readPart(path.join(PARTS_DIR, "data-structures.java")),
      readPart(path.join(PARTS_DIR, "fast-scanner.java")),
      readPart(path.join(PARTS_DIR, "serializer.java")),
      readPart(path.join(PARTS_DIR, "comparator.java")),
      readPart(path.join(PARTS_DIR, "builders.java")),
    ]);

  return skeleton
    .replace("{{PART_DATA_STRUCTURES}}", dataStructures.trim())
    .replace("{{PART_FAST_SCANNER}}", fastScanner.trim())
    .replace("{{PART_SERIALIZER}}", serializer.trim())
    .replace("{{PART_COMPARATOR}}", comparator.trim())
    .replace("{{PART_BUILDERS}}", builders.trim());
}

/**
 * Java implementation of the Driver Provider.
 */
export class JavaProvider extends LanguageProvider {
  readonly language = "java";
  readonly judge0Id = JUDGE0_LANGUAGE_IDS.java;

  private readonly mapper = new JavaTypeMapper();

  async generate(options: DriverOptions): Promise<ExecutionPackage> {
    validateDriverOptions(options);
    this.mapper.reset(); // Fix #3: reset varCounter so mapper can be safely reused

    let inferredNode = "RandomListNode"; // Default fallback
    const userCode = options.userCode || "";
    if (userCode.includes("Node random;") || userCode.includes(".random")) {
      inferredNode = "RandomListNode";
    } else if (userCode.includes("List<Node> neighbors;") || userCode.includes(".neighbors")) {
      inferredNode = "GraphNode";
    } else if (userCode.includes("List<Node> children;") || userCode.includes(".children")) {
      inferredNode = "NaryTreeNode";
    } else if (userCode.includes("Node child;") || userCode.includes("Node prev;")) {
      inferredNode = "DoublyLinkedListNode";
    }

    let signature = JSON.parse(JSON.stringify(options.signature));
    
    // Carefully replace "Node" or "node" with the inferredNode in return_type and param types
    if (signature.return_type && signature.return_type.toLowerCase() === "node") {
      signature.return_type = inferredNode;
    }
    if (signature.params) {
      signature.params.forEach((p: any) => {
        if (p.type && p.type.toLowerCase() === "node") {
          p.type = inferredNode;
        }
      });
    }
    
    let sigStr = JSON.stringify(signature);

    const template = await loadTemplate();

    const isClassProblem = "class_name" in signature;

    let driverLogic = "";
    let stdinLines: string[] = [];

    if (isClassProblem) {
      const sig = signature as any; // Cast to ClassSignature
      driverLogic = this.mapper.generateClassExecutionBlock(sig);
      stdinLines = [
        options.testCases.length.toString(),
        ...options.testCases.map((tc) =>
          this.mapper.flattenClassInput(tc.input, sig, tc.expected_output),
        ),
      ];
    } else {
      const sig = signature as any; // Cast to FunctionSignature
      const extractionLines = sig.params
        .map((p: any) => this.mapper.generateExtractionLine(p))
        .join("\n");
      const executionBlock = this.mapper.generateExecutionBlock(sig);
      driverLogic = `${extractionLines}\n${executionBlock}`;
      stdinLines = [
        options.testCases.length.toString(),
        ...options.testCases.map((tc) =>
          this.mapper.flattenInput(
            { ...tc.input, expected_output: tc.expected_output },
            sig,
          ),
        ),
      ];
    }

    // 2. Stitch everything together
    // Extract imports from userCode and move them to the top
    const importRegex = /^import\s+.*;/gm;
    const userImports = options.userCode.match(importRegex) || [];
    let cleanUserCode = options.userCode.replace(importRegex, "").trim();

    // Strip 'public' from class declarations to prevent compilation errors in a single-file environment
    cleanUserCode = cleanUserCode.replace(/\bpublic\s+(final\s+|abstract\s+)?class\b/g, "$1class");

    let sourceCode = template
      .replace(/^\s*static\s+final\s+double\s+EPS\s+=\s+1e-6;/m, `    static final double EPS = ${options.comparator?.float_epsilon ?? 1e-6};`)
      .replace(/^\s*static\s+final\s+boolean\s+UNORDERED\s+=\s+false;/m, `    static final boolean UNORDERED = ${options.comparator?.unordered_arrays ? "true" : "false"};`)
      .replace(/^\s*\/\/\s*\{\{DRIVER_LOGIC_PLACEHOLDER\}\}/m, driverLogic)
      .replace("{{USER_CODE}}", cleanUserCode);

    // Add user imports after the template's default imports
    if (userImports.length > 0) {
      sourceCode = userImports.join("\n") + "\n" + sourceCode;
    }

    if (isClassProblem) {
      // Classes don't need the default "Solution solution = new Solution();" line
      sourceCode = sourceCode.replace(/^\s*Solution\s+solution\s+=\s+new\s+Solution\(\);/m, (match) => "// " + match.trim());
    }

    const targetClass = isClassProblem ? (signature as any).class_name : "Solution";
    sourceCode = sourceCode.replace(/\{\{TARGET_CLASS\}\}/g, targetClass);

    // Dynamically inject platform data structures only if the problem actually requires them
    if (!sigStr.includes("ListNode")) {
      sourceCode = sourceCode.replace(/\/\* \[\[LIST_NODE_START\]\] \*\/[\s\S]*?\/\* \[\[LIST_NODE_END\]\] \*\//g, "");
      sourceCode = sourceCode.replace(/\/\* \[\[BUILD_LIST_START\]\] \*\/[\s\S]*?\/\* \[\[BUILD_LIST_END\]\] \*\//g, "");
    }
    if (!sigStr.includes("TreeNode")) {
      sourceCode = sourceCode.replace(/\/\* \[\[TREE_NODE_START\]\] \*\/[\s\S]*?\/\* \[\[TREE_NODE_END\]\] \*\//g, "");
      sourceCode = sourceCode.replace(/\/\* \[\[BUILD_TREE_START\]\] \*\/[\s\S]*?\/\* \[\[BUILD_TREE_END\]\] \*\//g, "");
    }
    if (!sigStr.includes("RandomListNode") && !sigStr.includes(`"Node"`) && !driverLogic.includes("buildRandomList")) {
      sourceCode = sourceCode.replace(/\/\* \[\[RANDOM_LIST_NODE_START\]\] \*\/[\s\S]*?\/\* \[\[RANDOM_LIST_NODE_END\]\] \*\//g, "");
      sourceCode = sourceCode.replace(/\/\* \[\[BUILD_RANDOM_LIST_START\]\] \*\/[\s\S]*?\/\* \[\[BUILD_RANDOM_LIST_END\]\] \*\//g, "");
    }
    if (!sigStr.includes("GraphNode") && !driverLogic.includes("buildGraph")) {
      sourceCode = sourceCode.replace(/\/\* \[\[GRAPH_NODE_START\]\] \*\/[\s\S]*?\/\* \[\[GRAPH_NODE_END\]\] \*\//g, "");
      sourceCode = sourceCode.replace(/\/\* \[\[BUILD_GRAPH_START\]\] \*\/[\s\S]*?\/\* \[\[BUILD_GRAPH_END\]\] \*\//g, "");
    }
    if (!sigStr.includes("DoublyLinkedListNode")) {
      sourceCode = sourceCode.replace(/\/\* \[\[DOUBLY_LIST_NODE_START\]\] \*\/[\s\S]*?\/\* \[\[DOUBLY_LIST_NODE_END\]\] \*\//g, "");
      sourceCode = sourceCode.replace(/\/\* \[\[BUILD_DOUBLY_LIST_START\]\] \*\/[\s\S]*?\/\* \[\[BUILD_DOUBLY_LIST_END\]\] \*\//g, "");
    }
    if (!sigStr.includes("NaryTreeNode") && !driverLogic.includes("buildNaryTree")) {
      sourceCode = sourceCode.replace(/\/\* \[\[NARY_TREE_NODE_START\]\] \*\/[\s\S]*?\/\* \[\[NARY_TREE_NODE_END\]\] \*\//g, "");
      sourceCode = sourceCode.replace(/\/\* \[\[BUILD_NARY_TREE_START\]\] \*\/[\s\S]*?\/\* \[\[BUILD_NARY_TREE_END\]\] \*\//g, "");
    }


    return {
      sourceCode,
      stdin: stdinLines.join("\n"),
      languageId: this.judge0Id,
    };
  }
}

