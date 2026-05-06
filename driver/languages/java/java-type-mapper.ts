import { ClassSignature, FunctionParam, FunctionSignature } from "../../core/types";
import { boxIfPrimitive, javaType, parseType, TypeNode } from "../../core/type-ast";

/**
 * Ultimate Java Type Mapper.
 * Supports Lists, Nested Lists, Base64 Strings, and all standard primitives.
 */
export class JavaTypeMapper {
  private varCounter = 0;

  public mapToJavaType(type: string): string {
    return javaType(parseType(type));
  }

  /**
   * Generates Java code to read a type from Scanner.
   */
  public generateExtractionLine(param: FunctionParam): string {
    return this.generateReadLogic(parseType(param.type), param.name);
  }

  private generateReadLogic(type: TypeNode, name: string, indent = "                "): string {
    if (type.kind === "primitive") {
      const java = javaType(type);
      if (type.primitive === "string") return `${indent}String ${name} = decodeString(sc.next());`;
      if (type.primitive === "char")
        return `${indent}char ${name} = decodeString(sc.next()).charAt(0);`;
      if (type.primitive === "boolean") return `${indent}boolean ${name} = sc.nextBoolean();`;
      if (type.primitive === "long") return `${indent}long ${name} = sc.nextLong();`;
      if (type.primitive === "double") return `${indent}double ${name} = sc.nextDouble();`;
      if (type.primitive === "float") return `${indent}float ${name} = sc.nextFloat();`;
      return `${indent}${java} ${name} = sc.nextInt();`;
    }

    if (type.kind === "node") {
      const n = `n${this.varCounter++}`;
      if (type.nodeType === "ListNode") {
        return `${indent}int ${n} = sc.nextInt();\n${indent}ListNode ${name} = buildList(${n}, sc);`;
      }
      return `${indent}int ${n} = sc.nextInt();\n${indent}TreeNode ${name} = buildTree(${n}, sc);`;
    }

    if (type.kind === "list") {
      const n = `n${this.varCounter++}`;
      const i = `i${this.varCounter++}`;
      const item = `item${this.varCounter++}`;
      const listType = `List<${boxIfPrimitive(javaType(type.element))}>`;
      const inner = this.generateReadLogic(type.element, item, `${indent}    `);
      return [
        `${indent}int ${n} = sc.nextInt();`,
        `${indent}${listType} ${name} = new ArrayList<>();`,
        `${indent}for (int ${i} = 0; ${i} < ${n}; ${i}++) {`,
        inner,
        `${indent}    ${name}.add(${item});`,
        `${indent}}`,
      ].join("\n");
    }

    if (type.kind === "set") {
      const n = `n${this.varCounter++}`;
      const i = `i${this.varCounter++}`;
      const item = `item${this.varCounter++}`;
      const setType = `Set<${boxIfPrimitive(javaType(type.element))}>`;
      const inner = this.generateReadLogic(type.element, item, `${indent}    `);
      return [
        `${indent}int ${n} = sc.nextInt();`,
        `${indent}${setType} ${name} = new LinkedHashSet<>();`,
        `${indent}for (int ${i} = 0; ${i} < ${n}; ${i}++) {`,
        inner,
        `${indent}    ${name}.add(${item});`,
        `${indent}}`,
      ].join("\n");
    }

    if (type.kind === "map") {
      const n = `n${this.varCounter++}`;
      const i = `i${this.varCounter++}`;
      const k = `k${this.varCounter++}`;
      const v = `v${this.varCounter++}`;
      const mapType = `Map<${boxIfPrimitive(javaType(type.key))}, ${boxIfPrimitive(javaType(type.value))}>`;
      const readK = this.generateReadLogic(type.key, k, `${indent}    `);
      const readV = this.generateReadLogic(type.value, v, `${indent}    `);
      return [
        `${indent}int ${n} = sc.nextInt();`,
        `${indent}${mapType} ${name} = new LinkedHashMap<>();`,
        `${indent}for (int ${i} = 0; ${i} < ${n}; ${i}++) {`,
        readK,
        readV,
        `${indent}    ${name}.put(${k}, ${v});`,
        `${indent}}`,
      ].join("\n");
    }

    if (type.kind === "array") {
      const n = `n${this.varCounter++}`;
      const i = `i${this.varCounter++}`;
      const item = `item${this.varCounter++}`;
      const declType = javaType(type);
      const alloc = this.buildArrayAllocation(type, n);
      const inner = this.generateReadLogic(type.element, item, `${indent}    `);
      return [
        `${indent}int ${n} = sc.nextInt();`,
        `${indent}${declType} ${name} = ${alloc};`,
        `${indent}for (int ${i} = 0; ${i} < ${n}; ${i}++) {`,
        inner,
        `${indent}    ${name}[${i}] = ${item};`,
        `${indent}}`,
      ].join("\n");
    }

    // Any type that fell through the AST is truly unsupported — fail loudly at codegen time.
    throw new Error(
      `Unsupported type "${(type as any).name ?? type.kind}" — cannot generate read logic. ` +
      `Add it to type-ast.ts or use a supported alias.`
    );
  }

  private buildArrayAllocation(type: TypeNode, lenVar: string): string {
    let depth = 0;
    let cursor: TypeNode = type;
    while (cursor.kind === "array") {
      depth++;
      cursor = cursor.element;
    }
    const base = javaType(cursor);
    const tail = "[]".repeat(Math.max(0, depth - 1));
    return `new ${base}[${lenVar}]${tail}`;
  }

  /** Reset per-submission state so the same mapper instance can be reused safely. */
  public reset(): void {
    this.varCounter = 0;
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
        ? sig.params[inPlaceIndices[0]]?.name ?? "null"
        : `Arrays.asList(${inPlaceIndices
            .map((idx) => sig.params[idx]?.name)
            .filter(Boolean)
            .join(", ")})`;
    const resultSource = isVoid ? inPlaceExpr : "result";

    const executionCall = isVoid 
      ? `solution.${sig.name}(${argList});`
      : `${this.mapToJavaType(sig.return_type)} result = solution.${sig.name}(${argList});`;

    return [
      `                __phase = "parse_expected";`,
      `                ${this.generateExpectedExtractionLine(sig)}`,
      `                __phase = "invoke";`,
      `                long start = System.nanoTime();`,
      `                ${executionCall}`,
      `                long end = System.nanoTime();`,
      `                double duration = (end - start) / 1_000_000.0;`,
      `                __phase = "compare";`,
      `                boolean pass = DeepComparator.equals(${resultSource}, __expected, EPS, UNORDERED);`,
      `                System.out.println("@@RESULT@@:" + serialize(${resultSource}) + " @@EXPECTED@@:" + serialize(__expected) + " @@PASS@@:" + pass + " @@TIME@@:" + duration);`
    ].join("\n");
  }

  private generateExpectedExtractionLine(sig: FunctionSignature): string {
    const t = parseType(sig.return_type);
    const decl = this.mapToJavaType(sig.return_type);
    if (t.kind === "primitive") {
      if (t.primitive === "string") return `String __expected = decodeString(sc.next());`;
      if (t.primitive === "char") return `char __expected = decodeString(sc.next()).charAt(0);`;
      if (t.primitive === "boolean") return `boolean __expected = sc.nextBoolean();`;
      if (t.primitive === "long") return `long __expected = sc.nextLong();`;
      if (t.primitive === "double") return `double __expected = sc.nextDouble();`;
      if (t.primitive === "float") return `float __expected = sc.nextFloat();`;
      return `int __expected = sc.nextInt();`;
    }
    if (t.kind === "node") {
      const n = `n${this.varCounter++}`;
      if (t.nodeType === "ListNode") {
        return `int ${n} = sc.nextInt(); ListNode __expected = buildList(${n}, sc);`;
      }
      return `int ${n} = sc.nextInt(); TreeNode __expected = buildTree(${n}, sc);`;
    }
    // array/list/set/map/custom -> reuse generic reader
    // declare and read into temp var name "__expected"
    const line = this.generateReadLogic(t as any, "__expected", "");
    // ensure declaration included (generateReadLogic emits decl)
    if (line.includes("__expected")) return line;
    return `${decl} __expected = null;`;
  }

  public generateClassExecutionBlock(sig: ClassSignature): string {
    const lines: string[] = [];
    lines.push(`                int numCommands = sc.nextInt();`);
    lines.push(`                Object[] results = new Object[numCommands];`);
    lines.push(`                ${sig.class_name} obj = null;`);
    lines.push(`                long start = System.nanoTime();`);
    lines.push(`                for (int j = 0; j < numCommands; j++) {`);
    lines.push(`                    String cmd = decodeString(sc.next());`);

    // Constructor handling
    lines.push(`                    if (cmd.equals("${sig.class_name}")) {`);
    const constructorArgs = sig.constructor_params.map(p => {
        const line = this.generateReadLogic(parseType(p.type), `arg_${p.name}`);
        return `                        ${line}`;
    });
    lines.push(...constructorArgs);
    const constructorCallArgs = sig.constructor_params.map(p => `arg_${p.name}`).join(", ");
    lines.push(`                        obj = new ${sig.class_name}(${constructorCallArgs});`);
    lines.push(`                        results[j] = null;`);

    // Methods handling
    for (const method of sig.methods) {
        lines.push(`                    } else if (cmd.equals("${method.name}")) {`);
        const methodArgs = method.params.map(p => {
            const line = this.generateReadLogic(parseType(p.type), `arg_${p.name}`);
            return `                        ${line}`;
        });
        lines.push(...methodArgs);
        const methodCallArgs = method.params.map(p => `arg_${p.name}`).join(", ");
        const isVoid = method.return_type.toLowerCase() === "void";
        if (isVoid) {
            lines.push(`                        obj.${method.name}(${methodCallArgs});`);
            lines.push(`                        results[j] = null;`);
        } else {
            lines.push(`                        results[j] = obj.${method.name}(${methodCallArgs});`);
        }
    }

    lines.push(`                    }`);
    lines.push(`                }`);
    lines.push(`                long end = System.nanoTime();`);
    lines.push(`                double duration = (end - start) / 1_000_000.0;`);

    // Read expected output array from stdin (one token per command: "null" or base64-serialized value)
    lines.push(`                __phase = "parse_expected";`);
    lines.push(`                int __numExp = sc.nextInt();`);
    lines.push(`                String[] __exp = new String[__numExp];`);
    lines.push(`                for (int __k = 0; __k < __numExp; __k++) { __exp[__k] = sc.next(); }`);

    // Compare and emit structured result
    lines.push(`                __phase = "compare";`);
    lines.push(`                boolean __allPass = true;`);
    lines.push(`                StringBuilder __resSb = new StringBuilder("[");`);
    lines.push(`                StringBuilder __expSb = new StringBuilder("[");`);
    lines.push(`                for (int __j = 0; __j < numCommands; __j++) {`);
    lines.push(`                    String __actual = serialize(results[__j]);`);
    lines.push(`                    String __expected = (__j < __exp.length) ? (__exp[__j].equals("null") ? "null" : decodeString(__exp[__j])) : "null";`);
    lines.push(`                    if (!__actual.equals(__expected)) __allPass = false;`);
    lines.push(`                    __resSb.append(__actual); if (__j < numCommands - 1) __resSb.append(",");`);
    lines.push(`                    __expSb.append(__expected); if (__j < numCommands - 1) __expSb.append(",");`);
    lines.push(`                }`);
    lines.push(`                __resSb.append("]"); __expSb.append("]");`);
    lines.push(`                System.out.println("@@RESULT@@:" + __resSb + " @@EXPECTED@@:" + __expSb + " @@PASS@@:" + __allPass + " @@TIME@@:" + duration);`);

    return lines.join("\n");
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
    const commands = input.commands as string[];
    const args = input.arguments as any[][];

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

    // Append expected output array so the Java driver can emit @@PASS@@
    // Each token is "null" (literal) or Base64-serialized string of the expected value
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

  private flattenValue(val: any, type: TypeNode, parts: string[]): void {
    const MAX_COLLECTION_ITEMS = 200000;
    // Fix #5: null/undefined guard — emit safe zero-value instead of crashing
    if (val === null || val === undefined) {
      if (type.kind === "primitive") {
        if (type.primitive === "string" || type.primitive === "char") {
          parts.push(Buffer.from("").toString("base64")); // empty string
        } else if (type.primitive === "boolean") {
          parts.push("false");
        } else {
          parts.push("0"); // int / long / double / float
        }
      } else if (type.kind === "node" || type.kind === "array" || type.kind === "list" || type.kind === "set" || type.kind === "map") {
        parts.push("0"); // empty collection / null node
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

    if (type.kind === "array" || type.kind === "list") {
      const arr = Array.isArray(val) ? val : [];
      if (arr.length > MAX_COLLECTION_ITEMS) {
        throw new Error(`Collection too large for driver flattening: ${arr.length}`);
      }
      parts.push(String(arr.length));
      for (const item of arr) {
        this.flattenValue(item, type.element, parts);
      }
      return;
    }

    if (type.kind === "set") {
      const arr = Array.isArray(val) ? val : Array.from(val ?? []);
      if (arr.length > MAX_COLLECTION_ITEMS) {
        throw new Error(`Set too large for driver flattening: ${arr.length}`);
      }
      parts.push(String(arr.length));
      for (const item of arr) {
        this.flattenValue(item, type.element, parts);
      }
      return;
    }

    if (type.kind === "map") {
      const entries = Array.isArray(val)
        ? val
        : val && typeof val === "object"
          ? Object.entries(val)
          : [];
      if (entries.length > MAX_COLLECTION_ITEMS) {
        throw new Error(`Map too large for driver flattening: ${entries.length}`);
      }
      parts.push(String(entries.length));
      for (const [k, v] of entries as [any, any][]) {
        this.flattenValue(k, type.key, parts);
        this.flattenValue(v, type.value, parts);
      }
      return;
    }
  }
}
