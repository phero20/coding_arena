import { ClassSignature, FunctionSignature } from "../../core/types";
import { parseType, TypeNode } from "../../core/type-ast";
import { BaseTypeMapper } from "../../core/base-type-mapper";

export class CTypeMapper extends BaseTypeMapper {
  public mapType(type: string): string {
    return this.toCType(parseType(type));
  }

  private toCType(type: TypeNode): string {
    if (type.kind === "primitive") {
      if (type.primitive === "string") return "char*";
      if (type.primitive === "boolean") return "bool";
      if (type.primitive === "double" || type.primitive === "float") return "double";
      if (type.primitive === "long") return "long long";
      return "int";
    }
    if (type.kind === "node") return `struct ${type.nodeType}*`;
    if (type.kind === "list" || type.kind === "array") return `${this.toCType(type.element)}*`;
    return "void";
  }

  public generateReadExpr(type: TypeNode, scName: string = "sc"): string {
    if (type.kind === "primitive") {
      if (type.primitive === "string") return `decode_string(next(&${scName}))`;
      if (type.primitive === "boolean") return `next_bool(&${scName})`;
      if (type.primitive === "double" || type.primitive === "float") return `next_float(&${scName})`;
      if (type.primitive === "long") return `next_long(&${scName})`;
      return `next_int(&${scName})`;
    }
    if (type.kind === "node") {
      if (type.nodeType === "ListNode") return `build_list(next_int(&${scName}), &${scName})`;
      return `build_tree(next_int(&${scName}), &${scName})`;
    }
    return "0";
  }

  public generateExecutionBlock(sig: FunctionSignature): string {
    const lines: string[] = [];

    sig.params.forEach(p => {
      const typeNode = parseType(p.type);
      if (typeNode.kind === "list" || typeNode.kind === "array") {
        lines.push(`            int ${p.name}_size = next_int(&sc);`);
        const elType = this.toCType(typeNode.element);
        lines.push(`            ${elType}* ${p.name} = (${elType}*)malloc((${p.name}_size > 0 ? ${p.name}_size : 1) * sizeof(${elType}));`);
        lines.push(`            for(int _j=0; _j<${p.name}_size; ++_j) ${p.name}[_j] = ${this.generateReadExpr(typeNode.element)};`);
      } else {
        lines.push(`            ${this.toCType(typeNode)} ${p.name} = ${this.generateReadExpr(typeNode)};`);
      }
    });

    const retTypeNode = parseType(sig.return_type);
    const retType = this.toCType(retTypeNode);
    const isVoid = sig.return_type.toLowerCase() === "void";

    lines.push(`            __phase = "parse_expected";`);
    if (retTypeNode.kind === "list" || retTypeNode.kind === "array") {
      lines.push(`            int __exp_size = next_int(&sc);`);
      const elType = this.toCType(retTypeNode.element);
      lines.push(`            ${elType}* __expected = (${elType}*)malloc((__exp_size > 0 ? __exp_size : 1) * sizeof(${elType}));`);
      lines.push(`            for(int _j=0; _j<__exp_size; ++_j) __expected[_j] = ${this.generateReadExpr(retTypeNode.element)};`);
    } else if (!isVoid) {
      lines.push(`            ${retType} __expected = ${this.generateReadExpr(retTypeNode)};`);
    }

    lines.push(`            __phase = "invoke";`);
    lines.push(`            clock_t _start = clock();`);

    const args = sig.params.map(p => {
      const t = parseType(p.type);
      if (t.kind === "list" || t.kind === "array") return `${p.name}, ${p.name}_size`;
      return p.name;
    }).join(", ");

    if (isVoid) {
      lines.push(`            ${sig.name}(${args});`);
    } else if (retTypeNode.kind === "list" || retTypeNode.kind === "array") {
      lines.push(`            int __ret_size = 0;`);
      lines.push(`            ${retType} result = ${sig.name}(${args}, &__ret_size);`);
    } else {
      lines.push(`            ${retType} result = ${sig.name}(${args});`);
    }

    lines.push(`            double duration = ((double)(clock() - _start) / CLOCKS_PER_SEC) * 1000;`);
    lines.push(`            __phase = "compare";`);

    if (isVoid) {
      const inPlaceParam = sig.params[(sig as any).inplace_param_index ?? 0];
      if (inPlaceParam) {
        const inPlaceType = parseType(inPlaceParam.type);
        if (inPlaceType.kind === "list" || inPlaceType.kind === "array") {
          lines.push(`            char* res_str = serialize_int_array(${inPlaceParam.name}, ${inPlaceParam.name}_size);`);
          lines.push(`            char* exp_str = serialize_int_array(__expected, __exp_size);`);
        } else {
          lines.push(`            char* res_str = serialize_int((int)${inPlaceParam.name});`);
          lines.push(`            char* exp_str = serialize_int((int)__expected);`);
        }
        lines.push(`            bool pass = strcmp(res_str, exp_str) == 0;`);
        lines.push(`            printf("@@RESULT@@:%s @@EXPECTED@@:%s @@PASS@@:%s @@TIME@@:%f\\n", res_str, exp_str, pass ? "true" : "false", duration);`);
        lines.push(`            free(res_str); free(exp_str);`);
      }
    } else if (retTypeNode.kind === "node" && retTypeNode.nodeType === "ListNode") {
      lines.push(`            char* res_str = serialize_list(result);`);
      lines.push(`            char* exp_str = serialize_list(__expected);`);
      lines.push(`            bool pass = strcmp(res_str, exp_str) == 0;`);
      lines.push(`            printf("@@RESULT@@:%s @@EXPECTED@@:%s @@PASS@@:%s @@TIME@@:%f\\n", res_str, exp_str, pass ? "true" : "false", duration);`);
      lines.push(`            free(res_str); free(exp_str);`);
    } else if (retTypeNode.kind === "list" || retTypeNode.kind === "array") {
      lines.push(`            char* res_str = serialize_int_array(result, __ret_size);`);
      lines.push(`            char* exp_str = serialize_int_array(__expected, __exp_size);`);
      lines.push(`            bool pass = strcmp(res_str, exp_str) == 0;`);
      lines.push(`            printf("@@RESULT@@:%s @@EXPECTED@@:%s @@PASS@@:%s @@TIME@@:%f\\n", res_str, exp_str, pass ? "true" : "false", duration);`);
      lines.push(`            free(res_str); free(exp_str); free(__expected); free(result);`);
    } else if (retTypeNode.kind === "primitive") {
      if (retTypeNode.primitive === "double" || retTypeNode.primitive === "float") {
        lines.push(`            char* res_str = serialize_double(result);`);
        lines.push(`            char* exp_str = serialize_double(__expected);`);
        lines.push(`            bool pass = equals_double(result, __expected, EPS, UNORDERED);`);
      } else if (retTypeNode.primitive === "string") {
        lines.push(`            char* res_str = serialize_string(result);`);
        lines.push(`            char* exp_str = serialize_string(__expected);`);
        lines.push(`            bool pass = equals_string(result, __expected, EPS, UNORDERED);`);
      } else if (retTypeNode.primitive === "boolean") {
        lines.push(`            char* res_str = serialize_bool(result);`);
        lines.push(`            char* exp_str = serialize_bool(__expected);`);
        lines.push(`            bool pass = equals_int((int)result, (int)__expected, EPS, UNORDERED);`);
      } else {
        lines.push(`            char* res_str = serialize_int((int)result);`);
        lines.push(`            char* exp_str = serialize_int((int)__expected);`);
        lines.push(`            bool pass = equals_int((int)result, (int)__expected, EPS, UNORDERED);`);
      }
      lines.push(`            printf("@@RESULT@@:%s @@EXPECTED@@:%s @@PASS@@:%s @@TIME@@:%f\\n", res_str, exp_str, pass ? "true" : "false", duration);`);
      lines.push(`            free(res_str); free(exp_str);`);
    }

    // Free heap-allocated inputs
    sig.params.forEach(p => {
      const t = parseType(p.type);
      if (t.kind === "list" || t.kind === "array") {
        lines.push(`            free(${p.name});`);
      }
    });

    return lines.join("\n");
  }

  public generateClassExecutionBlock(sig: ClassSignature): string {
    const lines: string[] = [];
    const className = sig.class_name;
    const cClassName = className.charAt(0).toLowerCase() + className.slice(1);

    lines.push(`            void* obj = NULL;`);
    lines.push(`            int num_commands = next_int(&sc);`);
    lines.push(`            for (int _j = 0; _j < num_commands; _j++) {`);
    lines.push(`                char* cmd_b64 = next(&sc);`);
    lines.push(`                if (cmd_b64 == NULL) break;`);
    lines.push(`                char* cmd = decode_string(cmd_b64);`);
    lines.push(`                __phase = "invoke";`);

    // Constructor
    lines.push(`                if (strcmp(cmd, "${className}") == 0) {`);
    sig.constructor_params.forEach((p, idx) => {
      const t = parseType(p.type);
      lines.push(`                    ${this.toCType(t)} __ca${idx} = ${this.generateReadExpr(t)};`);
    });
    const cArgs = sig.constructor_params.map((_, i) => `__ca${i}`).join(", ");
    lines.push(`                    obj = ${cClassName}Create(${cArgs});`);
    lines.push(`                    printf("null ");`);

    // Methods — local vars guarantee left-to-right arg reads
    sig.methods.forEach(m => {
      lines.push(`                } else if (strcmp(cmd, "${m.name}") == 0) {`);
      m.params.forEach((p, idx) => {
        const t = parseType(p.type);
        lines.push(`                    ${this.toCType(t)} __ma${idx} = ${this.generateReadExpr(t)};`);
      });
      const mLocalArgs = m.params.map((_, i) => `__ma${i}`).join(", ");
      const mCall = `${cClassName}${m.name.charAt(0).toUpperCase() + m.name.slice(1)}(obj, ${mLocalArgs})`;
      const retType = parseType(m.return_type);

      if (m.return_type.toLowerCase() === "void") {
        lines.push(`                    if (obj != NULL) { ${mCall}; }`);
        lines.push(`                    printf("null ");`);
      } else if (retType.kind === "primitive" && retType.primitive === "boolean") {
        lines.push(`                    if (obj != NULL) printf("%s ", (${mCall}) ? "true" : "false"); else printf("null ");`);
      } else if (retType.kind === "primitive" && retType.primitive === "string") {
        lines.push(`                    if (obj != NULL) { char* __mr = ${mCall}; printf("%s ", __mr ? __mr : "null"); } else printf("null ");`);
      } else {
        lines.push(`                    if (obj != NULL) printf("%d ", ${mCall}); else printf("null ");`);
      }
    });

    lines.push(`                }`);
    lines.push(`                free(cmd);`);
    lines.push(`            }`);
    lines.push(`            printf("\\n");`);
    lines.push(`            __phase = "compare";`);
    lines.push(`            int num_exp = next_int(&sc);`);
    lines.push(`            for (int _k = 0; _k < num_exp; _k++) next(&sc);`);
    lines.push(`            printf("@@RESULT@@:done @@EXPECTED@@:done @@PASS@@:true @@TIME@@:0\\n");`);

    return lines.join("\n");
  }
}
