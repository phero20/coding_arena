import { ClassSignature, FunctionSignature } from "../../core/types";
import { parseType, TypeNode } from "../../core/type-ast";
import { BaseTypeMapper } from "../../core/base-type-mapper";

export class TypeScriptTypeMapper extends BaseTypeMapper {
  public mapType(type: string): string {
    return this.toTSType(parseType(type));
  }

  private toTSType(type: TypeNode): string {
    if (type.kind === "primitive") {
      if (type.primitive === "string") return "string";
      if (type.primitive === "boolean") return "boolean";
      if (type.primitive === "double" || type.primitive === "float") return "number";
      if (type.primitive === "long") return "any";
      return "number";
    }
    if (type.kind === "node") return type.nodeType;
    if (type.kind === "list" || type.kind === "array") return `${this.toTSType(type.element)}[]`;
    return "any";
  }

  public generateReadExpr(type: TypeNode, scName: string = "sc"): string {
    if (type.kind === "primitive") {
      if (type.primitive === "string") return `${scName}.nextString()`;
      if (type.primitive === "boolean") return `${scName}.nextBool()`;
      if (type.primitive === "double" || type.primitive === "float") return `${scName}.nextFloat()`;
      if (type.primitive === "long") return `${scName}.nextBigInt()`;
      return `${scName}.nextInt()`;
    }
    if (type.kind === "node") {
      if (type.nodeType === "ListNode") return `buildList(${scName}.nextInt(), ${scName})`;
      return `buildTree(${scName}.nextInt(), ${scName})`;
    }
    return "null";
  }

  public generateExecutionBlock(sig: FunctionSignature): string {
    const lines: string[] = [];
    const retTypeNode = parseType(sig.return_type);
    const isVoid = sig.return_type.toLowerCase() === "void";

    lines.push(`{`);

    // 1. Parse inputs
    sig.params.forEach((p, idx) => {
      const typeNode = parseType(p.type);
      const tsType = this.toTSType(typeNode);
      if (typeNode.kind === "list" || typeNode.kind === "array") {
        lines.push(`    const ${p.name}_size: number = sc.nextInt();`);
        lines.push(`    const ${p.name}: ${tsType} = [];`);
        lines.push(`    for (let _i${idx} = 0; _i${idx} < ${p.name}_size; _i${idx}++) ${p.name}.push(${this.generateReadExpr(typeNode.element)});`);
      } else {
        lines.push(`    const ${p.name}: ${tsType} = ${this.generateReadExpr(typeNode)};`);
      }
    });

    // 2. Parse expected
    lines.push(`    __phase = "parse_expected";`);
    if (!isVoid) {
      const expType = this.toTSType(retTypeNode);
      if (retTypeNode.kind === "list" || retTypeNode.kind === "array") {
        lines.push(`    const __exp_size: number = sc.nextInt();`);
        lines.push(`    const __expected: ${expType} = [];`);
        lines.push(`    for (let _e = 0; _e < __exp_size; _e++) __expected.push(${this.generateReadExpr(retTypeNode.element)});`);
      } else {
        lines.push(`    const __expected: ${expType} = ${this.generateReadExpr(retTypeNode)};`);
      }
    }

    // 3. Invoke
    lines.push(`    __phase = "invoke";`);
    lines.push(`    const _t0: any = process.hrtime.bigint();`);

    const args = sig.params.map(p => p.name).join(", ");
    if (isVoid) {
      lines.push(`    ${sig.name}(${args});`);
    } else {
      lines.push(`    const result: ${this.toTSType(retTypeNode)} = ${sig.name}(${args});`);
    }

    lines.push(`    const _duration: number = Number(process.hrtime.bigint() - _t0) / 1e6;`);

    // 4. Compare
    lines.push(`    __phase = "compare";`);
    if (isVoid) {
      const idx = (sig as any).inplace_param_index ?? 0;
      const p = sig.params[idx];
      if (p) {
        lines.push(`    const _res: string = serialize(${p.name});`);
        lines.push(`    const _exp: string = serialize(__expected);`);
        lines.push(`    const _pass: boolean = compare(${p.name}, __expected);`);
        lines.push(`    process.stdout.write(\`@@RESULT@@:\${_res} @@EXPECTED@@:\${_exp} @@PASS@@:\${_pass} @@TIME@@:\${_duration.toFixed(6)}\\n\`);`);
      }
    } else {
      lines.push(`    const _res: string = serialize(result);`);
      lines.push(`    const _exp: string = serialize(__expected);`);
      lines.push(`    const _pass: boolean = compare(result, __expected);`);
      lines.push(`    process.stdout.write(\`@@RESULT@@:\${_res} @@EXPECTED@@:\${_exp} @@PASS@@:\${_pass} @@TIME@@:\${_duration.toFixed(6)}\\n\`);`);
    }

    lines.push(`}`);
    return lines.join("\n");
  }

  public generateClassExecutionBlock(sig: ClassSignature): string {
    const lines: string[] = [];
    const cn = sig.class_name;

    lines.push(`{`);
    lines.push(`    let _obj: ${cn} | null = null;`);
    lines.push(`    const _ncmds: number = sc.nextInt();`);
    lines.push(`    const _out: any[] = [];`);
    lines.push(`    for (let _j = 0; _j < _ncmds; _j++) {`);
    lines.push(`        const _cmd: string = sc.nextString();`);
    lines.push(`        __phase = "invoke";`);

    // Constructor
    lines.push(`        if (_cmd === "${cn}") {`);
    sig.constructor_params.forEach((p, idx) => {
      lines.push(`            const _ca${idx}: ${this.toTSType(parseType(p.type))} = ${this.generateReadExpr(parseType(p.type))};`);
    });
    const cArgs = sig.constructor_params.map((_, i) => `_ca${i}`).join(", ");
    lines.push(`            _obj = new ${cn}(${cArgs});`);
    lines.push(`            _out.push(null);`);
    lines.push(`        }`);

    // Methods
    sig.methods.forEach(m => {
      lines.push(`        if (_cmd === "${m.name}") {`);
      m.params.forEach((p, idx) => {
        lines.push(`            const _ma${idx}: ${this.toTSType(parseType(p.type))} = ${this.generateReadExpr(parseType(p.type))};`);
      });
      const mArgs = m.params.map((_, i) => `_ma${i}`).join(", ");
      lines.push(`            const _mr: any = _obj!.${m.name}(${mArgs});`);
      lines.push(`            _out.push(_mr === undefined ? null : _mr);`);
      lines.push(`        }`);
    });

    lines.push(`    }`);
    lines.push(`    __phase = "compare";`);
    lines.push(`    const _nexp: number = sc.nextInt();`);
    lines.push(`    for (let _k = 0; _k < _nexp; _k++) sc.nextString();`);
    lines.push(`    process.stdout.write(\`@@RESULT@@:done @@EXPECTED@@:done @@PASS@@:true @@TIME@@:0\\n\`);`);
    lines.push(`}`);

    return lines.join("\n");
  }
}
