export type PrimitiveKind =
  | "int"
  | "long"
  | "double"
  | "float"
  | "boolean"
  | "char"
  | "string";

export type TypeNode =
  | { kind: "primitive"; primitive: PrimitiveKind }
  | { kind: "array"; element: TypeNode }
  | { kind: "list"; element: TypeNode }
  | { kind: "set"; element: TypeNode }
  | { kind: "map"; key: TypeNode; value: TypeNode }
  | { kind: "node"; nodeType: "ListNode" | "TreeNode" | "RandomListNode" | "NaryTreeNode" | "GraphNode" | "DoublyLinkedListNode" }
  | { kind: "custom"; name: string };

function normalize(raw: string): string {
  return raw.trim().replace(/\s+/g, "");
}

function parsePrimitive(lower: string): PrimitiveKind | null {
  if (lower === "int" || lower === "integer" || lower === "int32") return "int";
  if (lower === "long" || lower === "int64") return "long";
  if (lower === "double") return "double";
  if (lower === "float") return "float";
  if (lower === "boolean" || lower === "bool") return "boolean";
  if (lower === "char" || lower === "character") return "char";
  if (lower === "string" || lower === "str") return "string";
  return null;
}

function unwrapList(input: string): string | null {
  const m = /^(?:List|ArrayList|LinkedList|Vector)<(.+)>$/i.exec(input);
  return m ? m[1] : null;
}

function unwrapSet(input: string): string | null {
  const m = /^(?:Set|HashSet|LinkedHashSet|TreeSet)<(.+)>$/i.exec(input);
  return m ? m[1] : null;
}

function unwrapMap(input: string): { key: string; value: string } | null {
  const m = /^(?:Map|HashMap|LinkedHashMap|TreeMap)<(.+)>$/i.exec(input);
  if (!m) return null;
  const [k, v] = splitTopLevelArgs(m[1]);
  if (!k || !v) return null;
  return { key: k, value: v };
}

function splitTopLevelArgs(inner: string): [string, string] {
  let depth = 0;
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i];
    if (ch === "<") depth++;
    else if (ch === ">") depth--;
    else if (ch === "," && depth === 0) {
      return [inner.slice(0, i).trim(), inner.slice(i + 1).trim()];
    }
  }
  return ["", ""];
}

export function parseType(type: string): TypeNode {
  let s = normalize(type);
  if (!s) return { kind: "custom", name: "Object" };

  const low = s.toLowerCase();
  if (low === "listnode") return { kind: "node", nodeType: "ListNode" };
  if (low === "treenode") return { kind: "node", nodeType: "TreeNode" };
  if (low === "randomlistnode" || low === "node") return { kind: "node", nodeType: "RandomListNode" };
  if (low === "narytreenode") return { kind: "node", nodeType: "NaryTreeNode" };
  if (low === "graphnode") return { kind: "node", nodeType: "GraphNode" };
  if (low === "doublylinkedlistnode") return { kind: "node", nodeType: "DoublyLinkedListNode" };

  const listInner = unwrapList(s);
  if (listInner) {
    return { kind: "list", element: parseType(listInner) };
  }

  const setInner = unwrapSet(s);
  if (setInner) {
    return { kind: "set", element: parseType(setInner) };
  }

  const mapInner = unwrapMap(s);
  if (mapInner) {
    return {
      kind: "map",
      key: parseType(mapInner.key),
      value: parseType(mapInner.value),
    };
  }

  if (s.endsWith("[]")) {
    return { kind: "array", element: parseType(s.slice(0, -2)) };
  }

  const primitive = parsePrimitive(low);
  if (primitive) return { kind: "primitive", primitive };

  return { kind: "custom", name: s };
}

export function javaType(node: TypeNode): string {
  switch (node.kind) {
    case "primitive":
      switch (node.primitive) {
        case "string":
          return "String";
        default:
          return node.primitive;
      }
    case "array":
      return `${javaType(node.element)}[]`;
    case "list":
      return `List<${boxIfPrimitive(javaType(node.element))}>`;
    case "set":
      return `Set<${boxIfPrimitive(javaType(node.element))}>`;
    case "map":
      return `Map<${boxIfPrimitive(javaType(node.key))}, ${boxIfPrimitive(javaType(node.value))}>`;
    case "node":
      if (node.nodeType === "RandomListNode" || node.nodeType === "NaryTreeNode" || 
          node.nodeType === "GraphNode" || node.nodeType === "DoublyLinkedListNode") {
        return "Node";
      }
      return node.nodeType;
    case "custom":
      return node.name;
  }
}

export function boxIfPrimitive(java: string): string {
  if (java === "int") return "Integer";
  if (java === "long") return "Long";
  if (java === "double") return "Double";
  if (java === "float") return "Float";
  if (java === "boolean") return "Boolean";
  if (java === "char") return "Character";
  return java;
}

