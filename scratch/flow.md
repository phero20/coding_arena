# Python Driver — Java Parity Implementation Plan

This plan brings the Python driver to full parity with the Java driver.
It is sequenced by dependency order. **No code is written until this is approved.**

---

## Background

The Java driver is a production-grade execution platform with:
- Modular part files (5 distinct parts)
- Marker-based conditional data-structure injection/stripping
- Node-type inference from user code
- Full node family support (6 node types)
- Correct void/in-place expected output reading
- Per-test-case static state reset via reflection
- Strict scanner with `NoSuchElementException` on EOF
- Serialize-first comparator strategy

The Python driver currently sits at ~40–50% parity. The biggest risks are **silent wrong results** and **stdin desync**.

---

## User Review Required

> [!IMPORTANT]
> The Python template uses `sys.exit(1)` on the first error, which terminates the entire run. Java uses `return` after emitting `@@ERROR@@`. This means Python currently stops after any single failing test case. During this rewrite we will preserve this behavior (consistent with Java's `return` on error). No change is needed here unless you want Python to continue past errors.

> [!WARNING]
> Python has no equivalent of Java's reflection-based `finally` static field reset. We will implement a `__reset_class(cls)` helper that uses `inspect` + `vars()` to zero out class-level mutable attributes between test cases. This is best-effort (same philosophy as Java) but not perfect for all singleton patterns.

> [!CAUTION]
> The `build_list` function currently does **not** consume the `pos` cycle-position token that `base-type-mapper.ts` always emits for `ListNode`. This means any problem with a ListNode input is already silently desynced by 1 token per linked list parameter. This is a critical correctness bug and is the **first** thing we fix.

---

## Open Questions

> [!IMPORTANT]
> **Q1:** For node types `RandomListNode`, `GraphNode`, `NaryTreeNode`, `DoublyLinkedListNode` — should the Python classes match Java's exact field names (e.g., `node.random`, `node.neighbors`, `node.children`, `node.child`, `node.prev`) so that user code written for LeetCode runs without modification?
> Assumed **yes** — I will mirror Java's LeetCode-compatible field layout.

> [!IMPORTANT]
> **Q2:** Should the `serialize()` function in Python use `json.dumps()` for primitives (current behavior) or match Java's convention exactly (e.g., `true`/`false` lowercase, no quotes for integers)?
> Java's `serialize(42)` → `"42"`, `serialize(true)` → `"true"`, `serialize("hello")` → `"\"hello\""`.
> Current Python: `json.dumps(42)` → `"42"` ✓, `json.dumps(True)` → `"true"` ✓, `json.dumps("hello")` → `'"hello"'` ✓.
> These are already aligned — no change needed for primitives.

---

## Proposed Changes — In Execution Order

---

### Phase 0 — Critical Correctness Bugs

These must be fixed before anything else. They cause silent wrong results today.

---

#### [MODIFY] [scanner.py](file:///c:/Feroz/MainProjects/coding-arena/new/coding_arena/driver/languages/python/parts/scanner.py)

**Problem:** `next()`, `next_int()`, `next_float()`, `next_bool()` all return silent defaults (`None`, `0`, `0.0`, `False`) on EOF. Java's `FastScanner` throws `NoSuchElementException`. Silent defaults mask stdin desync bugs.

**Fix:**
- `next()` → raise `RuntimeError("Unexpected end of input")` instead of returning `None`
- `next_int()` / `next_float()` / `next_bool()` → call `self.next()` then parse (no default)
- The template's `try/except` already catches all `Exception` and emits `@@ERROR@@`, so strict errors are safe

---

#### [MODIFY] [data_structures.py](file:///c:/Feroz/MainProjects/coding-arena/new/coding_arena/driver/languages/python/parts/data_structures.py)

**Problem 1 — `build_list` missing cycle `pos` token:**
Java's `buildList` always reads one extra `pos` token after the node values. `base-type-mapper.ts` always emits it (even `-1` for no cycle). Python's `build_list` never reads it → **stdin is desynced by 1 token per ListNode parameter** across all function problems using ListNode.

**Fix:** Add `pos = sc.next_int()` after the loop in `build_list`. If `0 <= pos < n`, set the cycle (build node array to support this).

**Problem 2 — Missing node classes:**
Python only has `ListNode` and `TreeNode`. The remaining 4 node types are missing entirely.

**Fix:** Add class definitions for:
- `Node` (with `random` field) — for `RandomListNode` problems
- `Node` (with `neighbors: List`) — for `GraphNode` problems  
- `Node` (with `children: List`) — for `NaryTreeNode` problems
- `Node` (with `prev`, `next`, `child` fields) — for `DoublyLinkedListNode` problems

> [!NOTE]
> In Python, all 4 non-standard node families share the class name `Node` in LeetCode convention (same as Java). We will use a single `Node` class with all optional fields (`random=None`, `neighbors=None`, `children=None`, `prev=None`, `child=None`) and let problems access only what they need. This matches LeetCode's pattern.

**Fix:** Add builder functions:
- `build_random_list(n, sc)` — reads `n` pairs of `(val, random_idx_or_null)`
- `build_graph(n, sc)` — reads `n` neighbor-list tokens (comma-separated or `"empty"`)
- `build_nary_tree(n, sc)` — reads `n` tokens (BFS with `null` separators between children groups)
- `build_doubly_list(n, sc)` — reads `n` tokens (multi-level flat format, same as Java)

---

#### [MODIFY] [python-type-mapper.ts](file:///c:/Feroz/MainProjects/coding-arena/new/coding_arena/driver/languages/python/python-type-mapper.ts)

**Problem 1 — `generateReadExpr` falls through to `"None"` for unsupported types:**
Any type not handled returns the Python literal `None`. This causes a `None` value to be silently used as input, hiding the real codegen error.

**Fix:** Replace the `return "None"` fallthrough with:
```ts
throw new Error(`Unsupported type "${(type as any).name ?? type.kind}" in Python driver. Add it to python-type-mapper.ts.`);
```

**Problem 2 — Node type read path only handles `ListNode`:**
For all other node types, `generateReadExpr` falls through to `build_tree(...)`. This silently builds a wrong value for RandomListNode, GraphNode, NaryTreeNode, DoublyLinkedListNode.

**Fix:** Expand the `node` kind handler to match each nodeType:
- `ListNode` → `build_list(sc.next_int(), sc)`
- `TreeNode` → `build_tree(sc.next_int(), sc)`
- `RandomListNode` → `build_random_list(sc.next_int(), sc)`
- `GraphNode` → `build_graph(sc.next_int(), sc)`
- `NaryTreeNode` → `build_nary_tree(sc.next_int(), sc)`
- `DoublyLinkedListNode` → `build_doubly_list(sc.next_int(), sc)`
- Anything else → `throw new Error(...)`

**Problem 3 — `generateExecutionBlock` reads expected output using `generateReadExpr(parseType(sig.return_type))` even for `void` returns:**
For void problems, `parseType("void")` returns `{kind:"custom", name:"void"}`, which falls through to `"None"` (or will now throw after fix 1). Either way, it reads the wrong expected value.

**Fix:** Port Java's `generateExpectedExtractionLine()` method into `PythonTypeMapper`:
- For `void` returns: read expected from the in-place param type using `inplace_param_indices` (same logic as Java)
- For multi-index in-place: build a list `__expected = [...]` reading each indexed param's type
- Otherwise: read expected using the return type normally

---

### Phase 1 — Serializer Parity

#### [MODIFY] [data_structures.py](file:///c:/Feroz/MainProjects/coding-arena/new/coding_arena/driver/languages/python/parts/data_structures.py)

Split into dedicated responsibilities and add missing serializers.

**Missing serializers (add):**
- `serialize_list(head)` — cycle-safe (use a visited set, emit `"CYCLE"` token on detection), matches Java
- `serialize_tree(root)` — already present but inline; extract as named function
- `serialize_random_list(head)` — emits `[[val, random_idx_or_null], ...]` format matching Java
- `serialize_graph(node)` — BFS, sort by val, emit `[[neighbor_vals], ...]` matching Java
- `serialize_nary_tree(root)` — BFS with `null` separators, trim trailing nulls, matching Java
- `serialize_doubly_list(head)` — flatten `.next` chain, emit `[val, ...]`, matching Java

**Expand top-level `serialize(obj)` dispatch:**
```python
if isinstance(obj, ListNode): return serialize_list(obj)
if isinstance(obj, TreeNode): return serialize_tree(obj)
if isinstance(obj, Node):
    # infer by checking fields present
    if hasattr(obj, 'random'): return serialize_random_list(obj)
    if hasattr(obj, 'neighbors'): return serialize_graph(obj)
    if hasattr(obj, 'children'): return serialize_nary_tree(obj)
    return serialize_doubly_list(obj)
```

**String/char serialization:** Ensure `serialize(str)` → `'"hello"'` (with surrounding quotes) matching Java's `"\"hello\""`. Currently `json.dumps("hello")` → `'"hello"'` which already matches ✓. Confirm this also handles escape sequences (`\n`, `\t`, `\\`) correctly via `json.dumps`.

**Set serialization:** Match Java — sort items, wrap in `[...]`:
```python
if isinstance(obj, set):
    return "[" + ",".join(sorted(serialize(x) for x in obj)) + "]"
```

---

### Phase 2 — Comparator Parity

#### [MODIFY] [comparator.py](file:///c:/Feroz/MainProjects/coding-arena/new\coding_arena\driver\languages\python\parts\comparator.py)

**Problem 1 — Unordered array check uses `sorted()` which fails for nested/object arrays:**
```python
sorted(actual) == sorted(expected)  # fails for lists of lists
```

**Fix:** Port Java's `deepNormalizeString` strategy:
```python
def deep_normalize(obj):
    if isinstance(obj, (list, tuple)):
        return "[" + ",".join(sorted(deep_normalize(x) for x in obj)) + "]"
    return serialize(obj)
```
Use `sorted([deep_normalize(x) for x in actual]) == sorted([deep_normalize(x) for x in expected])` for unordered comparison.

**Problem 2 — Node comparison uses fragile `hasattr` heuristics:**
Current comparator tries `actual.val == expected.val`, then branches on `hasattr(next)` vs `hasattr(left)`. This doesn't handle RandomListNode, GraphNode, NaryTreeNode, DoublyLinkedListNode and is incorrect for edge cases (e.g. two TreeNodes that differ only in right subtree).

**Fix:** Adopt Java's serialize-first strategy for all node types:
```python
# Node comparison → canonical serialize equality
if hasattr(actual, 'val') and hasattr(expected, 'val'):
    return serialize(actual) == serialize(expected)
```

**Problem 3 — Float comparison uses `math.isclose` with `rel_tol=eps`:**
Java uses `Math.abs(da - db) <= eps` (pure absolute tolerance). Using relative tolerance (`rel_tol`) in Python can cause mismatches for values near 0.

**Fix:** Change to `abs(actual - expected) <= eps` to match Java exactly.

**Problem 4 — Set and Map comparison missing:**
No explicit `set` or `dict` path that uses serialize-equality.

**Fix:** Add:
```python
if isinstance(actual, set) and isinstance(expected, set):
    return serialize(actual) == serialize(expected)
if isinstance(actual, dict) and isinstance(expected, dict):
    return serialize(actual) == serialize(expected)
```

---

### Phase 3 — Provider: Node Inference + Marker-Based Injection

#### [MODIFY] [python-provider.ts](file:///c:/Feroz/MainProjects/coding-arena/new/coding_arena/driver/languages/python/python-provider.ts)

**Problem 1 — No Node-type inference:**
Java inspects userCode for field access patterns (`.random`, `.neighbors`, `.children`, `.prev`) and rewrites generic `Node` to the correct specific type before code generation.

**Fix:** Port the exact same inference block:
```ts
let inferredNode = "RandomListNode"; // default
if (userCode.includes(".random")) inferredNode = "RandomListNode";
else if (userCode.includes(".neighbors")) inferredNode = "GraphNode";
else if (userCode.includes(".children")) inferredNode = "NaryTreeNode";
else if (userCode.includes(".prev") || userCode.includes(".child")) inferredNode = "DoublyLinkedListNode";

// Rewrite signature before passing to mapper
if (sig.return_type.toLowerCase() === "node") sig.return_type = inferredNode;
sig.params?.forEach(p => { if (p.type.toLowerCase() === "node") p.type = inferredNode; });
```

**Problem 2 — No conditional data-structure injection (regex removal is brittle):**
Current approach injects all DS into the template then tries regex deletion when user defines their own class.

**Fix:** Port Java's marker-based approach. Wrap each class + its builders in Python comment markers:

```python
# [[LIST_NODE_START]]
class ListNode: ...
def build_list(...): ...
def serialize_list(...): ...
# [[LIST_NODE_END]]
```

Then strip unused markers in the provider (same as Java):
```ts
if (!sigStr.includes("ListNode")) {
  sourceCode = sourceCode.replace(/# \[\[LIST_NODE_START\]\][\s\S]*?# \[\[LIST_NODE_END\]\]/g, "");
}
// ...repeat for TreeNode, Node/RandomListNode, GraphNode, NaryTreeNode, DoublyLinkedListNode
```

Remove all the fragile regex user-code-conflict removal (`options.userCode.includes("class ListNode")`).

**Problem 3 — Brittle `EPS` / `UNORDERED` string replacement:**
Current: `.replace("EPS = 1e-6", ...)` which breaks if formatting changes.

**Fix:** Use anchored regex replacements matching Java's pattern:
```ts
.replace(/^EPS\s*=\s*1e-6$/m, `EPS = ${options.comparator?.float_epsilon ?? 1e-6}`)
.replace(/^UNORDERED\s*=\s*False$/m, `UNORDERED = ${options.comparator?.unordered_arrays ? "True" : "False"}`)
```

**Add:** Load `builders.py` as a 4th part (once we create it):
```ts
const [skeleton, scanner, dataStructures, builders, comparator] = await Promise.all([...]);
```
Replace: `# {{PART_BUILDERS}}` → `builders.trim()`

---

### Phase 4 — Template: Per-Test-Case State Reset

#### [MODIFY] [template.py](file:///c:/Feroz/MainProjects/coding-arena/new/coding_arena/driver/languages/python/template.py)

**Problem:** Java's `finally` block resets all non-final static fields of the target class via reflection. Python has no equivalent, so class-level mutable state leaks between test cases for design problems.

**Fix:** Add a `__reset_class(cls)` helper in the template that resets class-level mutable attributes using `inspect`:

```python
def __reset_class(cls):
    import inspect
    for name, val in inspect.getmembers(cls):
        if not name.startswith("__") and not inspect.isfunction(val) and not inspect.ismethod(val):
            try:
                default = type(val)()  # int() → 0, list() → [], dict() → {}, str() → ""
                setattr(cls, name, default)
            except:
                pass
```

Add a `finally` block to the test case loop that calls `__reset_class(Solution)` (for function problems) or `__reset_class(TARGET_CLASS)` (for class problems).

Also: Move `EPS` and `UNORDERED` to module-level constants (out of `main()`) — they're currently inside `main()` which makes them unavailable to nested functions.

---

### Phase 5 — New Part File: builders.py (Split from data_structures.py)

#### [NEW] [builders.py](file:///c:/Feroz/MainProjects/coding-arena/new/coding_arena/driver/languages/python/parts/builders.py)

Extract all builder functions from `data_structures.py` into a separate `builders.py` file, mirroring Java's `builders.java`. Content:
- `build_list(n, sc)` — with cycle `pos` handling
- `build_tree(n, sc)` — BFS
- `build_random_list(n, sc)` — reads pairs `(val, random_idx_or_null)`
- `build_graph(n, sc)` — reads `n` adjacency tokens
- `build_nary_tree(n, sc)` — BFS with null separators
- `build_doubly_list(n, sc)` — multi-level flat format

Each builder wrapped in marker comments:
```python
# [[BUILD_LIST_START]]
def build_list(n, sc): ...
# [[BUILD_LIST_END]]
```

---

### Phase 6 — data_structures.py: Split Definitions Only

#### [MODIFY] [data_structures.py](file:///c:/Feroz/MainProjects/coding-arena/new/coding_arena/driver/languages/python/parts/data_structures.py)

After extracting builders to `builders.py`, this file contains only:
1. `ListNode` class — in `# [[LIST_NODE_START]]` / `# [[LIST_NODE_END]]` markers
2. `TreeNode` class — in `# [[TREE_NODE_START]]` / `# [[TREE_NODE_END]]` markers
3. `Node` class (unified for all 4 exotic node types) — in `# [[NODE_START]]` / `# [[NODE_END]]` markers
4. All serializers (`serialize`, `serialize_list`, `serialize_tree`, etc.) — each in matching markers

The `serialize()` dispatch is also wrapped so unused serializer branches are stripped too.

---

## Final File Map After All Changes

| File | Status | Summary of Change |
|------|--------|-------------------|
| `parts/scanner.py` | MODIFY | Strict EOF errors instead of silent defaults |
| `parts/data_structures.py` | MODIFY | Add Node class, 4 missing builders (temp), add all node serializers, add set/map serialize, add markers |
| `parts/builders.py` | NEW | Extract all builder functions with markers |
| `parts/comparator.py` | MODIFY | Fix float eps, fix unordered, add serialize-first for nodes/sets/maps |
| `python-type-mapper.ts` | MODIFY | Full node type dispatch, hard throw on unsupported, port `generateExpectedExtractionLine` |
| `python-provider.ts` | MODIFY | Node inference, marker-based stripping, load builders.py part, fix regex replacements |
| `template.py` | MODIFY | Add `finally` reset block, move EPS/UNORDERED to module scope, add `{{PART_BUILDERS}}` slot |

---

## Verification Plan

### Automated
- `cd driver && bun run build` (or `tsc --noEmit`) to verify TypeScript compiles cleanly
- Manually run the driver codegen output against a sample problem JSON to inspect generated source code

### Manual
- **ListNode problem** (e.g. "Reverse Linked List") — verify no stdin desync
- **TreeNode problem** (e.g. "Invert Binary Tree") — verify serialize/compare works
- **Void/in-place problem** (e.g. "Sort Colors" with `void sortColors(int[] nums)`) — verify expected is read from `nums` param not from `void`
- **Design problem** (e.g. "LRU Cache") — verify state resets between test cases
- **RandomListNode problem** (e.g. "Copy List with Random Pointer") — verify full read + serialize cycle
