import { BaseTypeMapper } from "../../core/base-type-mapper";
import { TypeNode, parseType } from "../../core/type-ast";
import { 
  RESULT_DELIMITER, 
  TIME_DELIMITER, 
} from "../../core/constants";

export class CSharpTypeMapper extends BaseTypeMapper {
  public mapType(type: TypeNode): string {
    if (type.kind === "primitive") {
      if (type.primitive === "string") return "string";
      if (type.primitive === "boolean") return "bool";
      if (type.primitive === "double") return "double";
      if (type.primitive === "float") return "float";
      if (type.primitive === "long") return "long";
      if (type.primitive === "int") return "int";
      return type.primitive;
    }
    if (type.kind === "node") return type.nodeType;
    if (type.kind === "list") return `List<${this.mapType(type.element)}>`;
    if (type.kind === "array") {
      const el = type.element;
      if (el.kind === "array" || el.kind === "list") {
          return `${this.mapType(el.element as any)}[][]`;
      }
      return `${this.mapType(el)}[]`;
    }
    return "object";
  }

  public generateReadExpr(type: TypeNode, scName: string = "scanner"): string {
    if (type.kind === "primitive") {
      const p = type.primitive;
      return `${scName}.Next` + p.charAt(0).toUpperCase() + p.slice(1) + "()";
    }
    if (type.kind === "node") return `${scName}.Next` + type.nodeType + "()";
    if (type.kind === "list") {
      const el = type.element;
      if (el.kind === "list" || el.kind === "array") {
        const inner = el.element as any;
        if (inner.kind === "primitive") {
            const p = inner.primitive;
            return `${scName}.Next` + p.charAt(0).toUpperCase() + p.slice(1) + "Matrix()";
        }
        return `${scName}.Next` + this.mapType(inner) + "Matrix()";
      }
      if (el.kind === "primitive") {
         const p = el.primitive;
         return `${scName}.Next` + p.charAt(0).toUpperCase() + p.slice(1) + "List()";
      }
      return `${scName}.Next` + this.mapType(el) + "List()";
    }
    if (type.kind === "array") {
      const el = type.element;
      if (el.kind === "list" || el.kind === "array") {
        const inner = el.element as any;
        let baseMethod = "";
        if (inner.kind === "primitive") {
            const p = inner.primitive;
            baseMethod = `${scName}.Next` + p.charAt(0).toUpperCase() + p.slice(1) + "Matrix()";
        } else {
            baseMethod = `${scName}.Next` + this.mapType(inner) + "Matrix()";
        }
        return `${baseMethod}?.Select(x => x?.ToArray())?.ToArray()`;
      }
      if (el.kind === "primitive") {
         const p = el.primitive;
         return `${scName}.Next` + p.charAt(0).toUpperCase() + p.slice(1) + "List()?.ToArray()";
      }
      return `${scName}.Next` + this.mapType(el) + "List()?.ToArray()";
    }
    return `${scName}.NextObject()`;
  }

  public generateExecutionBlock(sig: any): string {
    const lines: string[] = [];
    const isVoid = sig.return_type === "void" || (typeof sig.return_type === "object" && sig.return_type.primitive === "void");

    // 1. Parse inputs
    sig.params.forEach((param: any) => {
      const typeNode = parseType(param.type);
      lines.push(`    ${this.mapType(typeNode)} ${param.name} = ${this.generateReadExpr(typeNode)};`);
    });

    // 2. Parse expected output
    lines.push(`    __phase = "parse_expected";`);
    if (isVoid) {
        lines.push(`    scanner.NextString(); // consume null/void expected`);
    } else {
        const retType = parseType(sig.return_type);
        lines.push(`    ${this.mapType(retType)} __expected = ${this.generateReadExpr(retType)};`);
    }

    // 3. Setup solution
    lines.push(`    Solution sol = new Solution();`);
    
    // 4. Invoke
    lines.push(`    __phase = "invoke";`);
    lines.push(`    var watch = System.Diagnostics.Stopwatch.StartNew();`);
    
    const args = sig.params.map((p: any) => p.name).join(", ");
    const methodName = this.capitalize(sig.name);
    if (isVoid) {
      lines.push(`    sol.${methodName}(${args});`);
      lines.push(`    watch.Stop();`);
      lines.push(`    string resultStr = "null";`);
      lines.push(`    string expStr = "null";`);
      lines.push(`    bool pass = true;`);
    } else {
      lines.push(`    var result = sol.${methodName}(${args});`);
      lines.push(`    watch.Stop();`);
      lines.push(`    string resultStr = Comparator.Serialize(result);`);
      lines.push(`    string expStr = Comparator.Serialize(__expected);`);
      lines.push(`    bool pass = resultStr == expStr;`);
    }

    // 5. Output
    lines.push(`    Console.WriteLine("${RESULT_DELIMITER}:" + resultStr + " @@EXPECTED@@:" + expStr + " @@PASS@@:" + pass.ToString().ToLower() + " @@TIME@@:" + watch.Elapsed.TotalMilliseconds);`);

    return lines.join("\n");
  }

  public generateClassExecutionBlock(sig: any): string {
    const lines: string[] = [];
    
    lines.push(`    int numOps = scanner.NextInt();`);
    lines.push(`    ${sig.class_name} sol = null;`);
    lines.push(`    List<object> results = new List<object>();`);
    
    lines.push(`    var watch = new System.Diagnostics.Stopwatch();`);
    
    lines.push(`    for(int i=0; i<numOps; i++) {`);
    lines.push(`        string op = scanner.NextString();`);
    lines.push(`        if (op == "${sig.class_name}") {`);
    sig.constructor_params.forEach((p: any, idx: number) => {
      const t = parseType(p.type);
      lines.push(`            ${this.mapType(t)} __ca${idx} = ${this.generateReadExpr(t)};`);
    });
    const constructorArgs = sig.constructor_params.map((_: any, idx: number) => `__ca${idx}`).join(", ");
    lines.push(`            watch.Start();`);
    lines.push(`            sol = new ${sig.class_name}(${constructorArgs});`);
    lines.push(`            watch.Stop();`);
    lines.push(`            results.Add(null);`);
    
    sig.methods.forEach((method: any) => {
      lines.push(`        } else if (op == "${method.name}") {`);
      method.params.forEach((p: any, idx: number) => {
        const t = parseType(p.type);
        lines.push(`            ${this.mapType(t)} __ma${idx} = ${this.generateReadExpr(t)};`);
      });
      const methodArgs = method.params.map((_: any, idx: number) => `__ma${idx}`).join(", ");
      const isVoid = method.return_type === "void" || (typeof method.return_type === "object" && method.return_type.primitive === "void");
      
      const methodName = this.capitalize(method.name);
      lines.push(`            watch.Start();`);
      if (isVoid) {
        lines.push(`            sol.${methodName}(${methodArgs});`);
        lines.push(`            watch.Stop();`);
        lines.push(`            results.Add(null);`);
      } else {
        lines.push(`            var res = sol.${methodName}(${methodArgs});`);
        lines.push(`            watch.Stop();`);
        lines.push(`            results.Add(res);`);
      }
    });
    
    lines.push(`        }`);
    lines.push(`    }`);
    
    // Expected output count
    lines.push(`    int numExp = scanner.NextInt();`);
    lines.push(`    List<object> expectedResults = new List<object>();`);
    // Expected results in class problems are usually a flat stream of tokens that we should parse into objects
    lines.push(`    for(int i=0; i<numExp; i++) {`);
    lines.push(`        string expToken = scanner.NextString();`);
    lines.push(`        if (expToken == null || expToken == "null") expectedResults.Add(null);`);
    lines.push(`        else if (int.TryParse(expToken, out int val)) expectedResults.Add(val);`);
    lines.push(`        else expectedResults.Add(expToken);`);
    lines.push(`    }`);
    
    lines.push(`    string finalResults = Comparator.Serialize(results);`);
    lines.push(`    string finalExp = Comparator.Serialize(expectedResults);`);
    lines.push(`    bool pass = finalResults == finalExp;`);
    
    lines.push(`    Console.WriteLine("${RESULT_DELIMITER}:" + finalResults + " @@EXPECTED@@:" + finalExp + " @@PASS@@:" + pass.ToString().ToLower() + " @@TIME@@:" + watch.Elapsed.TotalMilliseconds);`);

    return lines.join("\n");
  }

  private capitalize(s: string): string {
    if (!s) return s;
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
}
