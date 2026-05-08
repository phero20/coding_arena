import { ClassSignature, FunctionParam, FunctionSignature } from "../../core/types";
import { parseType, TypeNode } from "../../core/type-ast";
import { BaseTypeMapper } from "../../core/base-type-mapper";

export class CppTypeMapper extends BaseTypeMapper {
  public mapType(type: string): string {
    return this.toCppType(parseType(type));
  }

  private toCppType(type: TypeNode): string {
    if (type.kind === "primitive") {
      if (type.primitive === "string") return "string";
      if (type.primitive === "char") return "char";
      if (type.primitive === "boolean") return "bool";
      if (type.primitive === "double" || type.primitive === "float") return "double";
      if (type.primitive === "long") return "long long";
      return "int";
    }
    if (type.kind === "node") {
      return `${type.nodeType}*`;
    }
    if (type.kind === "list" || type.kind === "array") {
      return `vector<${this.toCppType(type.element)}>`;
    }
    if (type.kind === "set") {
      return `set<${this.toCppType(type.element)}>`;
    }
    if (type.kind === "map") {
      return `map<${this.toCppType(type.key)}, ${this.toCppType(type.value)}>`;
    }
    return "void";
  }

  public generateReadExpr(type: TypeNode): string {
    if (type.kind === "primitive") {
      if (type.primitive === "string") return "decode_string(sc.next())";
      if (type.primitive === "char") return "decode_string(sc.next())[0]";
      if (type.primitive === "boolean") return "sc.next_bool()";
      if (type.primitive === "double" || type.primitive === "float") return "sc.next_float()";
      if (type.primitive === "long") return "sc.next_long()";
      return "sc.next_int()";
    }
    if (type.kind === "node") {
      if (type.nodeType === "ListNode") return "build_list(sc.next_int(), sc)";
      return "build_tree(sc.next_int(), sc)";
    }
    if (type.kind === "list" || type.kind === "array") {
      const elType = this.toCppType(type.element);
      return `[&](){ int n = sc.next_int(); vector<${elType}> v; for(int i=0; i<n; ++i) v.push_back(${this.generateReadExpr(type.element)}); return v; }()`;
    }
    // Set and Map follow similar pattern but vector is most common for competitive programming inputs
    return "void";
  }

  public generateExecutionBlock(sig: FunctionSignature): string {
    const lines: string[] = [];
    sig.params.forEach(p => {
      lines.push(`            ${this.toCppType(parseType(p.type))} ${p.name} = ${this.generateReadExpr(parseType(p.type))};`);
    });

    const isVoid = sig.return_type.toLowerCase() === "void";
    const retType = this.toCppType(parseType(sig.return_type));
    
    lines.push(`            __phase = "parse_expected";`);
    lines.push(`            ${retType} __expected = ${this.generateReadExpr(parseType(sig.return_type))};`);
    lines.push(`            __phase = "invoke";`);
    lines.push(`            Solution solution;`);
    lines.push(`            auto start_time = chrono::high_resolution_clock::now();`);
    if (isVoid) {
      lines.push(`            solution.${sig.name}(${sig.params.map(p => p.name).join(", ")});`);
    } else {
      lines.push(`            ${retType} result = solution.${sig.name}(${sig.params.map(p => p.name).join(", ")});`);
    }
    lines.push(`            auto end_time = chrono::high_resolution_clock::now();`);
    lines.push(`            double duration = chrono::duration<double, milli>(end_time - start_time).count();`);
    lines.push(`            __phase = "compare";`);
    
    const resultSource = isVoid ? (sig.params[sig.inplace_param_index ?? 0]?.name || "void") : "result";
    lines.push(`            bool pass_status = DeepComparator::equals(${resultSource}, __expected, EPS, UNORDERED);`);
    lines.push(`            cout << "@@RESULT@@:" << serialize(${resultSource}) << " @@EXPECTED@@:" << serialize(__expected) << " @@PASS@@:" << (pass_status ? "true" : "false") << " @@TIME@@:" << duration << endl;`);

    return lines.join("\n");
  }

  public generateClassExecutionBlock(sig: ClassSignature): string {
    const lines: string[] = [];
    lines.push(`            int num_commands = sc.next_int();`);
    lines.push(`            vector<string> results;`);
    lines.push(`            ${sig.class_name}* obj = nullptr;`);
    lines.push(`            auto start_time = chrono::high_resolution_clock::now();`);
    lines.push(`            for (int j = 0; j < num_commands; ++j) {`);
    lines.push(`                string cmd = decode_string(sc.next());`);
    
    // Constructor
    lines.push(`                if (cmd == "${sig.class_name}") {`);
    sig.constructor_params.forEach(p => {
      lines.push(`                    ${this.toCppType(parseType(p.type))} arg_${p.name} = ${this.generateReadExpr(parseType(p.type))};`);
    });
    const ctorArgs = sig.constructor_params.map(p => `arg_${p.name}`).join(", ");
    lines.push(`                    obj = new ${sig.class_name}(${ctorArgs});`);
    lines.push(`                    results.push_back("null");`);
    lines.push(`                }`);

    // Methods
    sig.methods.forEach(m => {
      lines.push(`                else if (cmd == "${m.name}") {`);
      m.params.forEach(p => {
        lines.push(`                    ${this.toCppType(parseType(p.type))} arg_${p.name} = ${this.generateReadExpr(parseType(p.type))};`);
      });
      const mArgs = m.params.map(p => `arg_${p.name}`).join(", ");
      if (m.return_type.toLowerCase() === "void") {
        lines.push(`                    obj->${m.name}(${mArgs});`);
        lines.push(`                    results.push_back("null");`);
      } else {
        lines.push(`                    results.push_back(serialize(obj->${m.name}(${mArgs})));`);
      }
      lines.push(`                }`);
    });
    lines.push(`            }`);
    lines.push(`            auto end_time = chrono::high_resolution_clock::now();`);
    lines.push(`            double duration = chrono::duration<double, milli>(end_time - start_time).count();`);
    
    // Expected
    lines.push(`            __phase = "parse_expected";`);
    lines.push(`            int num_exp = sc.next_int();`);
    lines.push(`            vector<string> expected_vals;`);
    lines.push(`            for(int j=0; j<num_exp; ++j) expected_vals.push_back(sc.next());`);
    
    // Comparison
    lines.push(`            __phase = "compare";`);
    lines.push(`            bool all_pass = true;`);
    lines.push(`            string res_str = "[";`);
    lines.push(`            string exp_str = "[";`);
    lines.push(`            for (int j = 0; j < num_commands; ++j) {`);
    lines.push(`                string actual = results[j];`);
    lines.push(`                string raw_exp = (j < (int)expected_vals.size()) ? expected_vals[j] : "null";`);
    lines.push(`                string expected = (raw_exp == "null") ? "null" : decode_string(raw_exp);`);
    lines.push(`                if (actual != expected) all_pass = false;`);
    lines.push(`                res_str += actual; if(j<num_commands-1) res_str += ",";`);
    lines.push(`                exp_str += expected; if(j<num_commands-1) exp_str += ",";`);
    lines.push(`            }`);
    lines.push(`            res_str += "]"; exp_str += "]";`);
    lines.push(`            cout << "@@RESULT@@:" << res_str << " @@EXPECTED@@:" << exp_str << " @@PASS@@:" << (all_pass ? "true" : "false") << " @@TIME@@:" << duration << endl;`);

    return lines.join("\n");
  }
}
