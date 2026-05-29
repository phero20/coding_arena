import { CombineOptions } from "../types";
import { stripLines, ensureNewline } from "./helpers";

const PYTHON_SHIM = `
# ─── Minimal pytest-compatible runner (injected by exercise driver) ────────────
if __name__ == "__main__":
    import sys, inspect, traceback, unittest

    _passed = 0
    _failed = 0

    class PytestFormatter(unittest.TextTestResult):
        def addSuccess(self, test):
            super().addSuccess(test)
            global _passed
            _passed += 1
            print(f"{test.id()} PASSED")
            
        def addFailure(self, test, err):
            super().addFailure(test, err)
            global _failed
            _failed += 1
            print(f"{test.id()} FAILED")
            print("=================================== FAILURES ===================================")
            print(f"_________________ {test.id().split('.')[-1]} _________________")
            print(self._exc_info_to_string(err, test))
            
        def addError(self, test, err):
            super().addError(test, err)
            global _failed
            _failed += 1
            print(f"{test.id()} FAILED")
            print("=================================== FAILURES ===================================")
            print(f"_________________ {test.id().split('.')[-1]} _________________")
            print(self._exc_info_to_string(err, test))

    class QuietRunner(unittest.TextTestRunner):
        def __init__(self, *args, **kwargs):
            super().__init__(*args, stream=sys.stdout, resultclass=PytestFormatter, verbosity=0)

    unittest.main = lambda *args, **kwargs: None
    suite = unittest.TestLoader().loadTestsFromModule(sys.modules[__name__])
    QuietRunner().run(suite)

    for name, obj in inspect.getmembers(sys.modules[__name__]):
        if inspect.isfunction(obj) and name.startswith("test_"):
            try:
                obj()
                _passed += 1
                print(f"__main__::{name} PASSED")
            except Exception as e:
                _failed += 1
                print(f"__main__::{name} FAILED")
                print("=================================== FAILURES ===================================")
                print(f"_________________ {name} _________________")
                traceback.print_exc(file=sys.stdout)

    print(f"\\n========================= {_passed} passed, {_failed} failed ==========================")
    sys.exit(_failed > 0)
# ─────────────────────────────────────────────────────────────────────────────
`;

/**
 * Python (pytest)
 *
 * pytest discovers tests by importing the solution module.
 * Judge0 runs a single file, so we concatenate:
 *   1. User solution code
 *   2. A blank separator
 *   3. Test code — with any `from <slug> import` or `import <slug>` lines
 *      stripped (since the solution is now in the same file/namespace).
 *
 * We also strip `if __name__ == "__main__": pytest.main(...)` blocks
 * since Judge0 runs the file directly.
 */
export function combinePython(opts: CombineOptions): string {
  const { userCode, testCode } = opts;

  let cleanedTest = testCode;
  
  // Strip any manual unittest.main() blocks
  cleanedTest = stripLines(cleanedTest, /if\s+__name__\s*==\s*['"]__main__['"]:/);
  cleanedTest = stripLines(cleanedTest, /unittest\.main\(\)/);

  // Discover all imported modules in the test code to alias them to __main__
  // This avoids breaking stdlib imports that use try/except ImportError internally.
  const aliases = new Set<string>();
  const importRegex = /^\s*(?:from|import)\s+([a-zA-Z0-9_]+)/gm;
  let match;
  while ((match = importRegex.exec(testCode)) !== null) {
    const mod = match[1];
    // Ignore common standard libraries and testing frameworks
    if (!["unittest", "pytest", "sys", "inspect", "traceback", "datetime", "math", "re", "collections", "itertools", "functools", "os", "string", "random", "typing"].includes(mod)) {
      aliases.add(mod);
    }
  }

  const aliasCode = Array.from(aliases).map(m => `sys.modules['${m}'] = sys.modules['__main__']`).join("\n");
  
  const injectAliases = aliasCode ? `import sys\n${aliasCode}\n` : "";

  return [
    "# === Solution ===",
    ensureNewline(userCode),
    injectAliases,
    "# === Tests ===",
    ensureNewline(cleanedTest),
    PYTHON_SHIM,
  ].join("\n");
}
