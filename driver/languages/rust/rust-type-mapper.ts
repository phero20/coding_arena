import { BaseTypeMapper } from "../../core/base-type-mapper";
import { TypeNode, parseType } from "../../core/type-ast";
import { 
  RESULT_DELIMITER, 
  TIME_DELIMITER, 
} from "../../core/constants";

export class RustTypeMapper extends BaseTypeMapper {
  public mapType(type: TypeNode): string {
    if (type.kind === "primitive") {
      if (type.primitive === "string") return "String";
      if (type.primitive === "boolean") return "bool";
      if (type.primitive === "double" || type.primitive === "float") return "f64";
      if (type.primitive === "long") return "i64";
      if (type.primitive === "int") return "i32";
      return type.primitive;
    }
    if (type.kind === "node") {
      if (type.nodeType === "ListNode") return "Option<Box<ListNode>>";
      if (type.nodeType === "TreeNode") return "Option<Rc<RefCell<TreeNode>>>";
      return type.nodeType;
    }
    if (type.kind === "list" || type.kind === "array") {
      return `Vec<${this.mapType(type.element)}>`;
    }
    return "String";
  }

  public generateReadExpr(type: TypeNode, scName: string = "scanner"): string {
    if (type.kind === "primitive") {
      const p = type.primitive;
      if (p === "string") return `${scName}.next_string()`;
      if (p === "boolean") return `${scName}.next_bool()`;
      if (p === "double" || p === "float") return `${scName}.next_float()`;
      if (p === "long") return `${scName}.next_long()`;
      return `${scName}.next_int()`;
    }
    if (type.kind === "node") {
      if (type.nodeType === "ListNode") return `${scName}.next_list_node()`;
      if (type.nodeType === "TreeNode") return `${scName}.next_tree_node()`;
    }
    if (type.kind === "list" || type.kind === "array") {
      const el = type.element;
      if (el.kind === "primitive" && el.primitive === "string") {
        return `${scName}.next_string_vec()`;
      }
      if (el.kind === "list" || el.kind === "array") {
          return `${scName}.next_matrix()`;
      }
      return `${scName}.next_vec()`;
    }
    return `${scName}.next_raw().unwrap_or_default()`;
  }

  public generateExecutionBlock(sig: any): string {
    const lines: string[] = [];
    const isVoid = sig.return_type === "void" || (typeof sig.return_type === "object" && sig.return_type.primitive === "void");

    // 1. Parse inputs
    sig.params.forEach((param: any) => {
      const typeNode = parseType(param.type);
      lines.push(`        let ${param.name}: ${this.mapType(typeNode)} = ${this.generateReadExpr(typeNode)};`);
    });

    // 2. Parse expected output
    lines.push(`        _phase = "parse_expected";`);
    if (isVoid) {
        lines.push(`        scanner.next_raw(); // consume null/void expected`);
    } else {
        const retType = parseType(sig.return_type);
        lines.push(`        let __expected: ${this.mapType(retType)} = ${this.generateReadExpr(retType)};`);
    }

    // 3. Setup solution
    // No instantiation needed for function problems since methods are static
    
    // 4. Invoke
    lines.push(`        _phase = "invoke";`);
    lines.push(`        let _start = std::time::Instant::now();`);
    
    const args = sig.params.map((p: any) => p.name).join(", ");
    const methodName = this.toSnakeCase(sig.name); // Rust convention
    if (isVoid) {
      lines.push(`        Solution::${methodName}(${args});`);
      lines.push(`        let _duration = _start.elapsed().as_secs_f64() * 1000.0;`);
      lines.push(`        let result_str = "null".to_string();`);
      lines.push(`        let exp_str = "null".to_string();`);
      lines.push(`        let pass = true;`);
    } else {
      const retTypeNode = parseType(sig.return_type);
      lines.push(`        let result = Solution::${methodName}(${args});`);
      lines.push(`        let _duration = _start.elapsed().as_secs_f64() * 1000.0;`);
      
      lines.push(`        _phase = "compare";`);
      lines.push(`        let result_str = ${this.generateSerializeExpr(retTypeNode, "result")};`);
      lines.push(`        let exp_str = ${this.generateSerializeExpr(retTypeNode, "__expected")};`);
      lines.push(`        let pass = result_str == exp_str;`);
    }

    // 5. Output
    lines.push(`        println!("{}:{} @@EXPECTED@@:{} @@PASS@@:{} @@TIME@@:{}", "${RESULT_DELIMITER}", result_str, exp_str, pass, _duration);`);

    return lines.join("\n");
  }

  public generateClassExecutionBlock(sig: any): string {
    const lines: string[] = [];
    const cn = sig.class_name;

    lines.push(`        let num_ops = scanner.next_int();`);
    lines.push(`        let mut sol: Option<${cn}> = None;`);
    lines.push(`        let mut results: Vec<String> = Vec::new();`);
    lines.push(`        let mut _total_duration = 0.0;`);

    lines.push(`        for _ in 0..num_ops {`);
    lines.push(`            let op = scanner.next_string();`);
    lines.push(`            if op == "${cn}" {`);
    const constructorArgs = sig.constructor_params.map((p: any) => this.generateReadExpr(parseType(p.type))).join(", ");
    lines.push(`                let _start = std::time::Instant::now();`);
    lines.push(`                sol = Some(${cn}::new(${constructorArgs}));`);
    lines.push(`                _total_duration += _start.elapsed().as_secs_f64() * 1000.0;`);
    lines.push(`                results.push("null".to_string());`);
    
    sig.methods.forEach((method: any) => {
      lines.push(`            } else if op == "${method.name}" {`);
      const methodArgs = method.params.map((p: any) => this.generateReadExpr(parseType(p.type))).join(", ");
      const isVoid = method.return_type === "void" || (typeof method.return_type === "object" && method.return_type.primitive === "void");
      const methodName = this.toSnakeCase(method.name);

      lines.push(`                if let Some(ref mut obj) = sol {`);
      lines.push(`                    let _start = std::time::Instant::now();`);
      if (isVoid) {
        lines.push(`                    obj.${methodName}(${methodArgs});`);
        lines.push(`                    _total_duration += _start.elapsed().as_secs_f64() * 1000.0;`);
        lines.push(`                    results.push("null".to_string());`);
      } else {
        const retTypeNode = parseType(method.return_type);
        lines.push(`                    let res = obj.${methodName}(${methodArgs});`);
        lines.push(`                    _total_duration += _start.elapsed().as_secs_f64() * 1000.0;`);
        lines.push(`                    results.push(${this.generateSerializeExpr(retTypeNode, "res")});`);
      }
      lines.push(`                }`);
    });
    lines.push(`            }`);
    lines.push(`        }`);

    lines.push(`        let final_results = format!("[{}]", results.join(",")).replace(" ", "");`);
    lines.push(`        println!("{}:{} @@EXPECTED@@:done @@PASS@@:true @@TIME@@:{}", "${RESULT_DELIMITER}", final_results, _total_duration);`);

    return lines.join("\n");
  }

  private generateSerializeExpr(type: TypeNode, varName: string): string {
    if (type.kind === "primitive") {
      if (type.primitive === "string") return `Comparator::serialize_string(${varName})`;
      if (type.primitive === "boolean") return `Comparator::serialize_bool(${varName})`;
      return `Comparator::serialize(${varName})`;
    }
    if (type.kind === "node") {
      if (type.nodeType === "ListNode") return `Comparator::serialize_list_node(${varName})`;
      if (type.nodeType === "TreeNode") return `Comparator::serialize_tree_node(${varName})`;
    }
    if (type.kind === "list" || type.kind === "array") {
      return `Comparator::serialize_vec(${varName})`;
    }
    return `Comparator::serialize(${varName})`;
  }

  private toSnakeCase(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
  }
}
