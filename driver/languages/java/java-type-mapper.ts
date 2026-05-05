import { FunctionParam, FunctionSignature } from "../../core/types";

/**
 * Ultimate Java Type Mapper.
 * Supports Lists, Nested Lists, Base64 Strings, and all standard primitives.
 */
export class JavaTypeMapper {
  private varCounter = 0;

  public mapToJavaType(type: string): string {
    let t = type.trim();
    if (t.toLowerCase() === "string") return "String";
    if (t.toLowerCase() === "boolean") return "boolean";
    if (t.toLowerCase() === "int") return "int";
    if (t.toLowerCase() === "char") return "char";

    // Handle List<T> or ArrayList<T>
    if (t.startsWith("List<") || t.startsWith("ArrayList<")) {
      return t.replace(/string/gi, "String");
    }

    return t.replace(/string/gi, "String");
  }

  /**
   * Generates Java code to read a type from Scanner.
   */
  public generateExtractionLine(param: FunctionParam): string {
    return this.generateReadLogic(param.type, param.name);
  }

  private generateReadLogic(type: string, name: string): string {
    const t = type.toLowerCase().trim();
    
    if (t === "int") return `int ${name} = sc.nextInt();`;
    if (t === "boolean") return `boolean ${name} = sc.nextBoolean();`;
    if (t === "char") return `char ${name} = decodeString(sc.next()).charAt(0);`;
    if (t === "string") return `String ${name} = decodeString(sc.next());`;

    if (t === "int[]") {
      const i = `i${this.varCounter++}`;
      const n = `n${this.varCounter++}`;
      return `int ${n} = sc.nextInt(); int[] ${name} = new int[${n}]; for(int ${i}=0; ${i}<${n}; ${i}++) ${name}[${i}] = sc.nextInt();`;
    }

    if (t === "char[]") {
      const i = `i${this.varCounter++}`;
      const n = `n${this.varCounter++}`;
      return `int ${n} = sc.nextInt(); char[] ${name} = new char[${n}]; for(int ${i}=0; ${i}<${n}; ${i}++) ${name}[${i}] = decodeString(sc.next()).charAt(0);`;
    }

    if (t.startsWith("list<int") || t.startsWith("arraylist<int")) {
      const i = `i${this.varCounter++}`;
      const n = `n${this.varCounter++}`;
      return `int ${n} = sc.nextInt(); List<Integer> ${name} = new ArrayList<>(); for(int ${i}=0; ${i}<${n}; ${i}++) ${name}.add(sc.nextInt());`;
    }

    if (t.startsWith("list<string") || t.startsWith("arraylist<string")) {
        const i = `i${this.varCounter++}`;
        const n = `n${this.varCounter++}`;
        return `int ${n} = sc.nextInt(); List<String> ${name} = new ArrayList<>(); for(int ${i}=0; ${i}<${n}; ${i}++) ${name}.add(decodeString(sc.next()));`;
    }

    if (t === "int[][]") {
      const r = `r${this.varCounter++}`;
      const c = `c${this.varCounter++}`;
      const i = `i${this.varCounter++}`;
      const j = `j${this.varCounter++}`;
      return `int ${r} = sc.nextInt(); int ${c} = sc.nextInt(); int[][] ${name} = new int[${r}][${c}]; for(int ${i}=0; ${i}<${r}; ${i}++) for(int ${j}=0; ${j}<${c}; ${j}++) ${name}[${i}][${j}] = sc.nextInt();`;
    }

    if (t === "listnode") {
      const n = `n${this.varCounter++}`;
      return `int ${n} = sc.nextInt(); ListNode ${name} = buildList(${n}, sc);`;
    }

    if (t === "treenode") {
      const n = `n${this.varCounter++}`;
      return `int ${n} = sc.nextInt(); TreeNode ${name} = buildTree(${n}, sc);`;
    }

    return `// Unsupported type: ${type}`;
  }

  public generateExecutionBlock(sig: FunctionSignature): string {
    const argList = sig.params.map(p => p.name).join(", ");
    const isVoid = sig.return_type.toLowerCase() === "void";
    const resultSource = isVoid ? sig.params[0].name : "result";

    const executionCall = isVoid 
      ? `solution.${sig.name}(${argList});`
      : `${this.mapToJavaType(sig.return_type)} result = solution.${sig.name}(${argList});`;

    return [
      `                long start = System.nanoTime();`,
      `                ${executionCall}`,
      `                long end = System.nanoTime();`,
      `                double duration = (end - start) / 1_000_000.0;`,
      `                System.out.println("@@RESULT@@:" + serialize(${resultSource}) + " @@TIME@@:" + duration);`
    ].join("\n");
  }

  /**
   * Flattens a test case input object into the "Flat-Line" protocol string.
   */
  public flattenInput(input: Record<string, any>, sig: FunctionSignature): string {
    const parts: string[] = [];
    
    sig.params.forEach(param => {
      this.flattenValue(input[param.name], param.type, parts);
    });

    return parts.join(" ");
  }

  private flattenValue(val: any, type: string, parts: string[]): void {
    const t = type.toLowerCase().trim();

    if (t === "int") parts.push(String(val));
    else if (t === "boolean") parts.push(String(val));
    else if (t === "char") parts.push(Buffer.from(String(val)).toString("base64"));
    else if (t === "string") parts.push(Buffer.from(String(val)).toString("base64"));
    else if (t === "int[]") {
      parts.push(String(val.length));
      parts.push(...val.map(String));
    }
    else if (t === "char[]") {
        parts.push(String(val.length));
        parts.push(...val.map((c: any) => Buffer.from(String(c)).toString("base64")));
    }
    else if (t.startsWith("list<int") || t.startsWith("arraylist<int")) {
        parts.push(String(val.length));
        parts.push(...val.map(String));
    }
    else if (t.startsWith("list<string") || t.startsWith("arraylist<string")) {
        parts.push(String(val.length));
        parts.push(...val.map((s: any) => Buffer.from(String(s)).toString("base64")));
    }
    else if (t === "int[][]") {
      parts.push(String(val.length));
      parts.push(String(val[0]?.length || 0));
      val.forEach((row: any[]) => parts.push(...row.map(String)));
    }
    else if (t === "listnode") {
      parts.push(String(val.length));
      parts.push(...val.map(String));
    }
    else if (t === "treenode") {
      parts.push(String(val.length));
      // Tree nodes can be "null", so we encode those as words
      parts.push(...val.map((v: any) => v === null ? "null" : String(v)));
    }
  }
}
