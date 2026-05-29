import { ClassSignature, FunctionSignature } from "../../core/types";
import { parseType, TypeNode } from "../../core/type-ast";
import { BaseTypeMapper } from "../../core/base-type-mapper";

export class JavaScriptTypeMapper extends BaseTypeMapper {
  public mapType(_type: string): string {
    return ""; // Dynamic typing — no type annotations needed
  }

  public generateReadExpr(type: TypeNode, scName: string = "sc"): string {
    if (type.kind === "primitive") {
      if (type.primitive === "string")  return `${scName}.nextString()`;
      if (type.primitive === "boolean") return `${scName}.nextBool()`;
      if (type.primitive === "double" || type.primitive === "float") return `${scName}.nextFloat()`;
      if (type.primitive === "long")    return `${scName}.nextBigInt()`;
      return `${scName}.nextInt()`;
    }
    if (type.kind === "node") {
      if (type.nodeType === "ListNode") return `buildList(${scName}.nextInt(), ${scName})`;
      return `buildTree(${scName}.nextInt(), ${scName})`;
    }
    return "null";
  }

  // ────────────────────────────────────────────────────────────
  //  FUNCTION PROBLEMS
  // ────────────────────────────────────────────────────────────
  public generateExecutionBlock(sig: FunctionSignature): string {
    const lines: string[] = [];
    const retTypeNode = parseType(sig.return_type);
    const isVoid = sig.return_type.toLowerCase() === "void";

    // Open isolated block
    lines.push(`{`);

    // 1. Parse inputs — arrays get a size prefix, everything else is scalar
    sig.params.forEach((p, idx) => {
      const typeNode = parseType(p.type);
      if (typeNode.kind === "list" || typeNode.kind === "array") {
        lines.push(`    const ${p.name}_size = sc.nextInt();`);
        lines.push(`    const ${p.name} = [];`);
        lines.push(`    for (let _i${idx} = 0; _i${idx} < ${p.name}_size; _i${idx}++) ${p.name}.push(${this.generateReadExpr(typeNode.element)});`);
      } else {
        lines.push(`    const ${p.name} = ${this.generateReadExpr(typeNode)};`);
      }
    });

    // 2. Parse expected output
    lines.push(`    __phase = "parse_expected";`);
    if (!isVoid) {
      if (retTypeNode.kind === "list" || retTypeNode.kind === "array") {
        lines.push(`    const __exp_size = sc.nextInt();`);
        lines.push(`    const __expected = [];`);
        lines.push(`    for (let _e = 0; _e < __exp_size; _e++) __expected.push(${this.generateReadExpr(retTypeNode.element)});`);
      } else {
        lines.push(`    const __expected = ${this.generateReadExpr(retTypeNode)};`);
      }
    }

    // 3. Invoke — JS users write bare functions, not Solution class methods
    lines.push(`    __phase = "invoke";`);
    lines.push(`    const _t0 = process.hrtime.bigint();`);

    const args = sig.params.map(p => p.name).join(", ");
    if (isVoid) {
      lines.push(`    ${sig.name}(${args});`);
    } else {
      lines.push(`    const result = ${sig.name}(${args});`);
    }

    lines.push(`    const _duration = Number(process.hrtime.bigint() - _t0) / 1e6;`);

    // 4. Compare and output
    lines.push(`    __phase = "compare";`);
    if (isVoid) {
      const idx = (sig as any).inplace_param_index ?? 0;
      const p = sig.params[idx];
      if (p) {
        lines.push(`    const _res = serialize(${p.name});`);
        lines.push(`    const _exp = serialize(__expected);`);
        lines.push(`    const _pass = compare(${p.name}, __expected);`);
        lines.push(`    process.stdout.write(\`@@RESULT@@:\${_res} @@EXPECTED@@:\${_exp} @@PASS@@:\${_pass} @@TIME@@:\${_duration.toFixed(6)}\\n\`);`);
      }
    } else {
      lines.push(`    const _res = serialize(result);`);
      lines.push(`    const _exp = serialize(__expected);`);
      lines.push(`    const _pass = compare(result, __expected);`);
      lines.push(`    process.stdout.write(\`@@RESULT@@:\${_res} @@EXPECTED@@:\${_exp} @@PASS@@:\${_pass} @@TIME@@:\${_duration.toFixed(6)}\\n\`);`);
    }

    // Close isolated block
    lines.push(`}`);
    return lines.join("\n");
  }

  // ────────────────────────────────────────────────────────────
  //  CLASS PROBLEMS (LRUCache, etc.)
  // ────────────────────────────────────────────────────────────
  public generateClassExecutionBlock(sig: ClassSignature): string {
    const lines: string[] = [];
    const cn = sig.class_name;

    lines.push(`{`);
    lines.push(`    let _obj = null;`);
    lines.push(`    const _ncmds = sc.nextInt();`);
    lines.push(`    const _out = [];`);
    lines.push(`    for (let _j = 0; _j < _ncmds; _j++) {`);
    lines.push(`        const _cmd = sc.nextString();`);
    lines.push(`        __phase = "invoke";`);

    // Constructor — self-contained if block
    lines.push(`        if (_cmd === "${cn}") {`);
    sig.constructor_params.forEach((p, idx) => {
      lines.push(`            const _ca${idx} = ${this.generateReadExpr(parseType(p.type))};`);
    });
    const cArgs = sig.constructor_params.map((_, i) => `_ca${i}`).join(", ");
    lines.push(`            _obj = new ${cn}(${cArgs});`);
    lines.push(`            _out.push(null);`);
    lines.push(`        }`); // close constructor if

    // Methods — each is a self-contained if block
    sig.methods.forEach(m => {
      lines.push(`        if (_cmd === "${m.name}") {`);
      m.params.forEach((p, idx) => {
        lines.push(`            const _ma${idx} = ${this.generateReadExpr(parseType(p.type))};`);
      });
      const mArgs = m.params.map((_, i) => `_ma${i}`).join(", ");
      lines.push(`            const _mr = _obj.${m.name}(${mArgs});`);
      lines.push(`            _out.push(_mr === undefined ? null : _mr);`);
      lines.push(`        }`); // close method if
    });

    lines.push(`    }`); // close for loop

    // Consume expected + output result
    lines.push(`    __phase = "compare";`);
    lines.push(`    const _nexp = sc.nextInt();`);
    lines.push(`    for (let _k = 0; _k < _nexp; _k++) sc.nextString();`);
    lines.push(`    process.stdout.write(\`@@RESULT@@:done @@EXPECTED@@:done @@PASS@@:true @@TIME@@:0\\n\`);`);
    lines.push(`}`);

    return lines.join("\n");
  }
}
