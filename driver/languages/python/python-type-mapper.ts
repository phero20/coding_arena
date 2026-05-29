import { ClassSignature, FunctionParam, FunctionSignature } from "../../core/types";
import { parseType, TypeNode } from "../../core/type-ast";
import { BaseTypeMapper } from "../../core/base-type-mapper";

/**
 * Python Type Mapper.
 * Generates Python code to extract types from Scanner and execute solutions.
 */
export class PythonTypeMapper extends BaseTypeMapper {
  /**
   * Generates Python code to read a type from Scanner.
   */
  public generateExtractionLine(param: FunctionParam): string {
    return `${param.name} = ${this.generateReadExpr(parseType(param.type))}`;
  }

  public generateReadExpr(type: TypeNode): string {
    if (type.kind === "primitive") {
      if (type.primitive === "string") return "decode_string(sc.next())";
      if (type.primitive === "char") {
        return "(lambda s: s[0] if s else '')(decode_string(sc.next()))";
      }
      if (type.primitive === "boolean") return "sc.next_bool()";
      if (type.primitive === "double" || type.primitive === "float") return "sc.next_float()";
      return "sc.next_int()";
    }

    if (type.kind === "node") {
      if (type.nodeType === "ListNode") {
        return "build_list(sc.next_int(), sc)";
      }
      return "build_tree(sc.next_int(), sc)";
    }

    if (type.kind === "list" || type.kind === "array" || type.kind === "set") {
      const itemExpr = this.generateReadExpr(type.element);
      const listExpr = `[${itemExpr} for _ in range(sc.next_int())]`;
      return type.kind === "set" ? `set(${listExpr})` : listExpr;
    }

    if (type.kind === "map") {
      const kExpr = this.generateReadExpr(type.key);
      const vExpr = this.generateReadExpr(type.value);
      return `{${kExpr}: ${vExpr} for _ in range(sc.next_int())}`;
    }

    return "None";
  }

  public generateExecutionBlock(sig: FunctionSignature): string {
    const argList = sig.params.map(p => p.name).join(", ");
    const isVoid = sig.return_type.toLowerCase() === "void";
    const inPlaceIndices =
      sig.inplace_param_indices && sig.inplace_param_indices.length > 0
        ? sig.inplace_param_indices
        : [sig.inplace_param_index ?? 0];
    
    const inPlaceExpr =
      inPlaceIndices.length === 1
        ? sig.params[inPlaceIndices[0]]?.name ?? "None"
        : `[${inPlaceIndices
            .map((idx) => sig.params[idx]?.name)
            .filter(Boolean)
            .join(", ")}]`;
            
    const resultSource = isVoid ? inPlaceExpr : "result";

    return [
      `            __phase = "parse_expected"`,
      `            __expected = ${this.generateReadExpr(parseType(sig.return_type))}`,
      `            __phase = "invoke"`,
      `            solution = Solution()`,
      `            start_time = time.perf_counter()`,
      `            ${isVoid ? "" : "result = "}solution.${sig.name}(${argList})`,
      `            duration = (time.perf_counter() - start_time) * 1000`,
      `            __phase = "compare"`,
      `            pass_status = DeepComparator.equals(${resultSource}, __expected, EPS, UNORDERED)`,
      `            print(f"@@RESULT@@:{serialize(${resultSource})} @@EXPECTED@@:{serialize(__expected)} @@PASS@@:{str(pass_status).lower()} @@TIME@@:{duration}")`
    ].join("\n");
  }

  public generateClassExecutionBlock(sig: ClassSignature): string {
    const lines: string[] = [];
    lines.push(`            num_commands = sc.next_int()`);
    lines.push(`            results = []`);
    lines.push(`            obj = None`);
    lines.push(`            start_time = time.perf_counter()`);
    lines.push(`            for _ in range(num_commands):`);
    lines.push(`                cmd = decode_string(sc.next())`);
    
    // Constructor
    lines.push(`                if cmd == "${sig.class_name}":`);
    sig.constructor_params.forEach(p => {
        lines.push(`                    arg_${p.name} = ${this.generateReadExpr(parseType(p.type))}`);
    });
    const constructorArgs = sig.constructor_params.map(p => `arg_${p.name}`).join(", ");
    lines.push(`                    obj = ${sig.class_name}(${constructorArgs})`);
    lines.push(`                    results.append(None)`);

    // Methods
    for (const method of sig.methods) {
        lines.push(`                elif cmd == "${method.name}":`);
        method.params.forEach(p => {
            lines.push(`                    arg_${p.name} = ${this.generateReadExpr(parseType(p.type))}`);
        });
        const methodArgs = method.params.map(p => `arg_${p.name}`).join(", ");
        const isVoid = method.return_type.toLowerCase() === "void";
        if (isVoid) {
            lines.push(`                    obj.${method.name}(${methodArgs})`);
            lines.push(`                    results.append(None)`);
        } else {
            lines.push(`                    results.append(obj.${method.name}(${methodArgs}))`);
        }
    }
    lines.push(`            duration = (time.perf_counter() - start_time) * 1000`);
    
    // Expected output
    lines.push(`            __phase = "parse_expected"`);
    lines.push(`            num_exp = sc.next_int()`);
    lines.push(`            expected_vals = [sc.next() for _ in range(num_exp)]`);
    
    // Comparison
    lines.push(`            __phase = "compare"`);
    lines.push(`            all_pass = True`);
    lines.push(`            res_list = []`);
    lines.push(`            exp_list = []`);
    lines.push(`            for j in range(num_commands):`);
    lines.push(`                actual = serialize(results[j])`);
    lines.push(`                raw_exp = expected_vals[j] if j < len(expected_vals) else "null"`);
    lines.push(`                expected = "null" if raw_exp == "null" else decode_string(raw_exp)`);
    lines.push(`                if actual != expected: all_pass = False`);
    lines.push(`                res_list.append(actual)`);
    lines.push(`                exp_list.append(expected)`);
    lines.push(`            res_str = "[" + ",".join(res_list) + "]"`);
    lines.push(`            exp_str = "[" + ",".join(exp_list) + "]"`);
    lines.push(`            print(f"@@RESULT@@:{res_str} @@EXPECTED@@:{exp_str} @@PASS@@:{str(all_pass).lower()} @@TIME@@:{duration}")`);

    return lines.join("\n");
  }
}
