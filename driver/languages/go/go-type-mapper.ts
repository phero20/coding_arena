import { BaseTypeMapper } from "../../core/base-type-mapper";
import { TypeNode, parseType } from "../../core/type-ast";
import { 
  RESULT_DELIMITER, 
  TIME_DELIMITER, 
} from "../../core/constants";

export class GoTypeMapper extends BaseTypeMapper {
  public mapType(type: TypeNode): string {
    if (type.kind === "primitive") {
      if (type.primitive === "string") return "string";
      if (type.primitive === "boolean") return "bool";
      if (type.primitive === "double" || type.primitive === "float") return "float64";
      if (type.primitive === "long") return "int64";
      if (type.primitive === "int") return "int";
      return type.primitive;
    }
    if (type.kind === "node") {
      if (type.nodeType === "ListNode") return "*ListNode";
      if (type.nodeType === "TreeNode") return "*TreeNode";
      return type.nodeType;
    }
    if (type.kind === "list" || type.kind === "array") {
      return `[]${this.mapType(type.element)}`;
    }
    return "interface{}";
  }

  public generateReadExpr(type: TypeNode, scName: string = "scanner"): string {
    if (type.kind === "primitive") {
      const p = type.primitive;
      if (p === "string") return `${scName}.NextString()`;
      if (p === "boolean") return `${scName}.NextBool()`;
      if (p === "double" || p === "float") return `${scName}.NextFloat64()`;
      if (p === "long") return `${scName}.NextInt64()`;
      return `${scName}.NextInt()`;
    }
    if (type.kind === "node") {
      if (type.nodeType === "ListNode") return `${scName}.NextListNode()`;
      if (type.nodeType === "TreeNode") return `${scName}.NextTreeNode()`;
    }
    if (type.kind === "list" || type.kind === "array") {
      const el = type.element;
      if (el.kind === "primitive" && el.primitive === "string") {
        return `${scName}.NextStringArray()`;
      }
      if (el.kind === "list" || el.kind === "array") {
          return `${scName}.NextIntMatrix()`;
      }
      return `${scName}.NextIntArray()`;
    }
    return `${scName}.NextRaw()`;
  }

  public generateExecutionBlock(sig: any): string {
    const lines: string[] = [];
    const isVoid = sig.return_type === "void" || (typeof sig.return_type === "object" && sig.return_type.primitive === "void");

    // 1. Parse inputs
    sig.params.forEach((param: any) => {
      const typeNode = parseType(param.type);
      lines.push(`		${param.name} := ${this.generateReadExpr(typeNode)}`);
    });

    // 2. Parse expected output
    lines.push(`		_phase = "parse_expected"`);
    if (isVoid) {
        lines.push(`		scanner.NextRaw() // consume null/void expected`);
    } else {
        const retType = parseType(sig.return_type);
        lines.push(`		__expected := ${this.generateReadExpr(retType)}`);
    }

    // 4. Invoke
    lines.push(`		_phase = "invoke"`);
    lines.push(`		_start := time.Now()`);
    
    const args = sig.params.map((p: any) => p.name).join(", ");
    // Golang LeetCode functions are standard camelCase
    const methodName = sig.name;
    
    if (isVoid) {
      lines.push(`		${methodName}(${args})`);
      lines.push(`		_duration := float64(time.Since(_start).Microseconds()) / 1000.0`);
      lines.push(`		resultStr := "null"`);
      lines.push(`		expStr := "null"`);
      lines.push(`		pass := true`);
    } else {
      lines.push(`		result := ${methodName}(${args})`);
      lines.push(`		_duration := float64(time.Since(_start).Microseconds()) / 1000.0`);
      
      lines.push(`		_phase = "compare"`);
      lines.push(`		resultStr := comp.Serialize(result)`);
      lines.push(`		expStr := comp.Serialize(__expected)`);
      lines.push(`		pass := resultStr == expStr`);
    }

    // 5. Output
    lines.push(`		fmt.Printf("${RESULT_DELIMITER}:%s @@EXPECTED@@:%s @@PASS@@:%t @@TIME@@:%f\\n", resultStr, expStr, pass, _duration)`);

    return lines.join("\n");
  }

  public generateClassExecutionBlock(sig: any): string {
    const lines: string[] = [];
    const cn = sig.class_name;
    const constructorName = "Constructor"; // LeetCode Go standard for class constructors

    lines.push(`		numOps := scanner.NextInt()`);
    lines.push(`		var sol ${cn}`);
    lines.push(`		var results []interface{}`);
    lines.push(`		var _totalDuration float64 = 0.0`);

    lines.push(`		for j := 0; j < numOps; j++ {`);
    lines.push(`			op := scanner.NextString()`);
    lines.push(`			if op == "${cn}" {`);
    const constructorArgs = sig.constructor_params.map((p: any) => this.generateReadExpr(parseType(p.type))).join(", ");
    lines.push(`				_start := time.Now()`);
    lines.push(`				sol = ${constructorName}(${constructorArgs})`);
    lines.push(`				_totalDuration += float64(time.Since(_start).Microseconds()) / 1000.0`);
    lines.push(`				results = append(results, nil)`);
    
    sig.methods.forEach((method: any) => {
      lines.push(`			} else if op == "${method.name}" {`);
      const methodArgs = method.params.map((p: any) => this.generateReadExpr(parseType(p.type))).join(", ");
      const isVoid = method.return_type === "void" || (typeof method.return_type === "object" && method.return_type.primitive === "void");
      const methodName = this.capitalize(method.name);

      lines.push(`				_start := time.Now()`);
      if (isVoid) {
        lines.push(`				sol.${methodName}(${methodArgs})`);
        lines.push(`				_totalDuration += float64(time.Since(_start).Microseconds()) / 1000.0`);
        lines.push(`				results = append(results, nil)`);
      } else {
        lines.push(`				res := sol.${methodName}(${methodArgs})`);
        lines.push(`				_totalDuration += float64(time.Since(_start).Microseconds()) / 1000.0`);
        lines.push(`				results = append(results, res)`);
      }
    });
    lines.push(`			}`);
    lines.push(`		}`);
    
    lines.push(`		numExp := scanner.NextInt()`);
    lines.push(`		var expectedResults []interface{}`);
    lines.push(`		for j := 0; j < numExp; j++ {`);
    lines.push(`		    expToken := scanner.NextString()`);
    lines.push(`		    if expToken == "null" || expToken == "" {`);
    lines.push(`		        expectedResults = append(expectedResults, nil)`);
    lines.push(`		    } else if val, err := strconv.Atoi(expToken); err == nil {`);
    lines.push(`		        expectedResults = append(expectedResults, val)`);
    lines.push(`		    } else {`);
    lines.push(`		        expectedResults = append(expectedResults, expToken)`);
    lines.push(`		    }`);
    lines.push(`		}`);

    lines.push(`		finalResults := comp.Serialize(results)`);
    lines.push(`		finalExp := comp.Serialize(expectedResults)`);
    lines.push(`		pass := finalResults == finalExp`);
    lines.push(`		fmt.Printf("${RESULT_DELIMITER}:%s @@EXPECTED@@:%s @@PASS@@:%t @@TIME@@:%f\\n", finalResults, finalExp, pass, _totalDuration)`);

    return lines.join("\n");
  }

  private capitalize(s: string): string {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
