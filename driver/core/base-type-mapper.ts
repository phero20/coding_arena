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
      this.flattenValue(input[param.name], parseType(param.type), parts);
    });

    // expected output
    this.flattenValue((input as any).__expected_output ?? (input as any).expected_output, parseType(sig.return_type), parts);

    return parts.join(" ");
  }

  public flattenClassInput(input: Record<string, any>, sig: ClassSignature, expectedOutput?: any[]): string {
    const parts: string[] = [];
    const commands = (input.commands || input.operations || []) as string[];
    const args = (input.arguments || input.parameters || []) as any[][];

    parts.push(String(commands.length));

    for (let i = 0; i < commands.length; i++) {
        const cmd = commands[i];
        parts.push(Buffer.from(cmd).toString("base64"));

        if (cmd === sig.class_name) {
            sig.constructor_params.forEach((p, idx) => {
                this.flattenValue(args[i]?.[idx] ?? null, parseType(p.type), parts);
            });
        } else {
            const method = sig.methods.find(m => m.name === cmd);
            if (method) {
                method.params.forEach((p, idx) => {
                    this.flattenValue(args[i]?.[idx] ?? null, parseType(p.type), parts);
                });
            } else {
                throw new Error(`Unknown class command in testcase: ${cmd}`);
            }
        }
    }

    // Append expected output array
    const exp = expectedOutput ?? [];
    parts.push(String(exp.length));
    for (const v of exp) {
      if (v === null || v === undefined) {
        parts.push("null");
      } else {
        parts.push(Buffer.from(String(v)).toString("base64"));
      }
    }

    return parts.join(" ");
  }

  protected flattenValue(val: any, type: TypeNode, parts: string[]): void {
    const MAX_COLLECTION_ITEMS = 200000;
    
    if (val === null || val === undefined) {
      if (type.kind === "primitive") {
        if (type.primitive === "string" || type.primitive === "char") {
          parts.push(Buffer.from("").toString("base64"));
        } else if (type.primitive === "boolean") {
          parts.push("false");
        } else {
          parts.push("0");
        }
      } else {
        parts.push("0");
      }
      return;
    }

    if (type.kind === "primitive") {
      if (type.primitive === "string" || type.primitive === "char") {
        parts.push(Buffer.from(String(val ?? "")).toString("base64"));
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
