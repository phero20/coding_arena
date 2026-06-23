import { ClassSignature, FunctionSignature } from "./types";
import { parseType, TypeNode } from "./type-ast";

/**
 * Shared logic for all language type mappers.
 * Specifically handles the language-agnostic "Flat-Line" protocol serialization.
 */
export abstract class BaseTypeMapper {
  protected varCounter = 0;

  public reset(): void {
    this.varCounter = 0;
  }

  /**
   * Flattens a test case input object into the "Flat-Line" protocol string.
   */
  public flattenInput(input: Record<string, any>, sig: FunctionSignature): string {
    const parts: string[] = [];
    
    sig.params.forEach(param => {
      this.flattenValue(input[param.name], parseType(param.type), parts, input);
    });

    // expected output
    let returnTypeStr = sig.return_type;
    if (returnTypeStr.toLowerCase() === "void") {
      const inplaceIdx = sig.inplace_param_indices?.[0] ?? sig.inplace_param_index ?? 0;
      returnTypeStr = sig.params[inplaceIdx]?.type ?? "void";
    }
    this.flattenValue((input as any).__expected_output ?? (input as any).expected_output, parseType(returnTypeStr), parts, input);

    parts.push("@@CASE_END@@");

    return parts.join(" ");
  }

  public flattenClassInput(input: Record<string, any>, sig: ClassSignature, expectedOutput?: any[]): string {
    const parts: string[] = [];
    const commands = (input.commands || input.operations || input.methods || []) as string[];
    const args = (input.arguments || input.parameters || input.args || []) as any[][];

    parts.push(String(commands.length));

    for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        const b64 = Buffer.from(cmd).toString("base64");
        parts.push(b64 === "" ? "-" : b64);

        if (cmd === sig.class_name) {
            sig.constructor_params.forEach((p, idx) => {
                this.flattenValue(args[i]?.[idx] ?? null, parseType(p.type), parts, input);
            });
        } else {
            const method = sig.methods.find(m => m.name === cmd);
            if (method) {
                method.params.forEach((p, idx) => {
                    this.flattenValue(args[i]?.[idx] ?? null, parseType(p.type), parts, input);
                });
            } else {
                throw new Error(`Unknown class command in testcase: ${cmd}`);
            }
        }
    }

    // Append expected output array
    const exp = expectedOutput ?? [];
    parts.push(String(exp.length));
    for (let i = 0; i < exp.length; i++) {
      const v = exp[i];
      if (v === null || v === undefined) {
        parts.push("null");
      } else {
        let strVal = JSON.stringify(v);
        const cmd = commands[i];
        if (cmd && cmd !== sig.class_name) {
          const method = sig.methods.find(m => m.name === cmd);
          if (method && (method.return_type === "double" || method.return_type === "float") && typeof v === "number" && Number.isInteger(v)) {
            strVal = v.toFixed(1);
          }
        }
        const b64 = Buffer.from(strVal).toString("base64");
        parts.push(b64 === "" ? "-" : b64);
      }
    }

    parts.push("@@CASE_END@@");
    return parts.join(" ");
  }

  protected flattenValue(val: any, type: TypeNode, parts: string[], fullInput: Record<string, any>): void {
    const MAX_COLLECTION_ITEMS = 200000;
    
    if (val === null || val === undefined) {
      if (type.kind === "primitive") {
      if (type.primitive === "string" || type.primitive === "char") {
        parts.push("-");
      } else if (type.primitive === "boolean") {
          parts.push("false");
        } else {
          parts.push("0");
        }
      } else {
        parts.push("0");
        if (type.kind === "node" && type.nodeType === "ListNode") {
            parts.push("-1"); // push pos for null list
        }
      }
      return;
    }

    if (type.kind === "primitive") {
      if (type.primitive === "string" || type.primitive === "char") {
        const b64 = Buffer.from(String(val ?? "")).toString("base64");
        parts.push(b64 === "" ? "-" : b64);
      } else {
        parts.push(String(val));
      }
      return;
    }

    if (type.kind === "node") {
      const arr = Array.isArray(val) ? val : [];
      parts.push(String(arr.length));
      if (type.nodeType === "TreeNode") {
        parts.push(...arr.map((v: any) => (v === null ? "null" : String(v))));
      } else if (type.nodeType === "RandomListNode") {
        for (const pair of arr) {
          if (Array.isArray(pair) && pair.length >= 2) {
            parts.push(String(pair[0]));
            parts.push(pair[1] === null ? "null" : String(pair[1]));
          } else {
            parts.push("null", "null");
          }
        }
      } else if (type.nodeType === "GraphNode") {
        for (const v of arr) {
          if (Array.isArray(v)) {
            parts.push(v.length === 0 ? "empty" : v.join(","));
          } else {
            parts.push("empty");
          }
        }
      } else if (type.nodeType === "ListNode") {
        parts.push(...arr.map((v: any) => String(v)));
        parts.push(String(fullInput?.pos ?? "-1"));
      } else {
        parts.push(...arr.map((v: any) => String(v)));
      }
      return;
    }

    if (type.kind === "array" || type.kind === "list" || type.kind === "set") {
      const arr = Array.isArray(val) ? val : Array.from(val ?? []);
      if (arr.length > MAX_COLLECTION_ITEMS) {
        throw new Error(`Collection too large: ${arr.length}`);
      }
      parts.push(String(arr.length));
      for (const item of arr) {
        this.flattenValue(item, type.element, parts);
      }
      return;
    }

    if (type.kind === "map") {
      const entries = Array.isArray(val) ? val : Object.entries(val ?? {});
      parts.push(String(entries.length));
      for (const [k, v] of entries as [any, any][]) {
        this.flattenValue(k, type.key, parts);
        this.flattenValue(v, type.value, parts);
      }
      return;
    }
  }
}
