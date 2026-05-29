import { CombineOptions } from "../types";
import { stripLines, ensureNewline } from "./helpers";

/**
 * Minimal Jest-compatible runner injected at the top of JS/TS combined files.
 * Mocks describe / it / test / expect so the test suite runs under plain Node.js.
 */
const JEST_SHIM = `// ─── Minimal Jest-compatible runner (injected by exercise driver) ────────────
(function () {
  let _passed = 0, _failed = 0;
  const _failures = [];

  function _deepEqual(a, b) {
    if (a === b) return true;
    if (a === null || b === null || typeof a !== typeof b) return false;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((v, i) => _deepEqual(v, b[i]));
    }
    if (typeof a === 'object') {
      const ka = Object.keys(a).sort(), kb = Object.keys(b).sort();
      if (!_deepEqual(ka, kb)) return false;
      return ka.every((k) => _deepEqual(a[k], b[k]));
    }
    return false;
  }

  function _makeExpect(received) {
    function _fail(msg) { throw new Error(msg); }
    const m = {
      toBe(e) { if (!Object.is(received, e)) _fail(\`Expected \${JSON.stringify(received)} to be \${JSON.stringify(e)}\`); },
      toEqual(e) { if (!_deepEqual(received, e)) _fail(\`Expected \${JSON.stringify(received)} to equal \${JSON.stringify(e)}\`); },
      toStrictEqual(e) { if (!_deepEqual(received, e)) _fail(\`Expected \${JSON.stringify(received)} to strictly equal \${JSON.stringify(e)}\`); },
      toBeNull() { if (received !== null) _fail(\`Expected null but got \${JSON.stringify(received)}\`); },
      toBeDefined() { if (received === undefined) _fail('Expected value to be defined'); },
      toBeUndefined() { if (received !== undefined) _fail(\`Expected undefined but got \${JSON.stringify(received)}\`); },
      toBeTruthy() { if (!received) _fail(\`Expected truthy but got \${JSON.stringify(received)}\`); },
      toBeFalsy() { if (received) _fail(\`Expected falsy but got \${JSON.stringify(received)}\`); },
      toBeGreaterThan(n) { if (!(received > n)) _fail(\`Expected \${received} > \${n}\`); },
      toBeGreaterThanOrEqual(n) { if (!(received >= n)) _fail(\`Expected \${received} >= \${n}\`); },
      toBeLessThan(n) { if (!(received < n)) _fail(\`Expected \${received} < \${n}\`); },
      toBeLessThanOrEqual(n) { if (!(received <= n)) _fail(\`Expected \${received} <= \${n}\`); },
      toContain(item) {
        if (typeof received === 'string') { if (!received.includes(item)) _fail(\`Expected "\${received}" to contain "\${item}"\`); }
        else { if (!received.includes(item)) _fail(\`Expected array to contain \${JSON.stringify(item)}\`); }
      },
      toHaveLength(n) { if (received.length !== n) _fail(\`Expected length \${n} but got \${received.length}\`); },
      toMatch(p) {
        if (typeof p === 'string') { if (!received.includes(p)) _fail(\`Expected "\${received}" to match "\${p}"\`); }
        else { if (!p.test(received)) _fail(\`Expected "\${received}" to match \${p}\`); }
      },
      toThrow(msg) {
        let threw = false, thrownMsg = '';
        try { received(); } catch (e) { threw = true; thrownMsg = e && e.message ? e.message : String(e); }
        if (!threw) _fail('Expected function to throw');
        if (msg !== undefined) {
          const pattern = typeof msg === 'string' ? msg : (msg && msg.message ? msg.message : String(msg));
          if (pattern && !thrownMsg.includes(pattern)) _fail(\`Expected error "\${thrownMsg}" to include "\${pattern}"\`);
        }
      },
      toHaveBeenCalledTimes(n) {
        if (!received.mock) _fail('Expected a mock function');
        if (received.mock.calls.length !== n) _fail(\`Expected mock to have been called \${n} times, but got \${received.mock.calls.length}\`);
      },
      toHaveBeenCalledWith(...args) {
        if (!received.mock) _fail('Expected a mock function');
        const hasCall = received.mock.calls.some(callArgs => JSON.stringify(callArgs) === JSON.stringify(args));
        if (!hasCall) _fail(\`Expected mock to have been called with \${JSON.stringify(args)}\`);
      }
    };
    const not = {};
    for (const key of Object.keys(m)) {
      not[key] = (...args) => {
        let threw = false;
        try { m[key](...args); } catch (_) { threw = true; }
        if (!threw) _fail(\`Expected NOT \${key}\`);
      };
    }
    return Object.assign(m, { not });
  }

  let _suite = '';
  global.describe = (name, fn) => { const p = _suite; _suite = _suite ? \`\${_suite} > \${name}\` : name; fn(); _suite = p; };
  global.xdescribe = global.describe;
  global.describe.skip = () => {};

  global.it = global.test = (name, fn) => {
    const full = _suite ? \`\${_suite} > \${name}\` : name;
    try { fn(); _passed++; } catch (e) { _failed++; _failures.push({ name: full, message: e.message || String(e) }); }
  };
  global.xit = global.xtest = global.it;
  global.it.skip = global.test.skip = () => {};
  
  global.expect = _makeExpect;
  global.beforeEach = global.afterEach = global.beforeAll = global.afterAll = () => {};
  
  global.jest = {
    fn: (impl) => {
      const mockFn = function(...args) {
        mockFn.mock.calls.push(args);
        if (impl) return impl.apply(this, args);
      };
      mockFn.mock = { calls: [] };
      return mockFn;
    }
  };

  process.on('exit', () => {
    const total = _passed + _failed;
    if (_failed === 0) {
      console.log(\`Tests: \${total} passed, 0 failed, \${total} total\`);
    } else {
      _failures.forEach((f) => console.log(\`  ✗ \${f.name}\\n    \${f.message}\`));
      console.log(\`\\nTests: \${_passed} passed, \${_failed} failed, \${total} total\`);
      process.exitCode = 1;
    }
  });
})();
// ─────────────────────────────────────────────────────────────────────────────
`;

/**
 * JavaScript / TypeScript (Jest / Mocha)
 *
 * Test files typically have:
 *   const { fn } = require('./hello-world');
 *   import { fn } from './hello-world';
 *
 * We strip those import/require lines and prepend the solution.
 */
export function combineJavaScript(opts: CombineOptions): string {
  const { userCode, testCode } = opts;

  // Node.js will execute this as a standard script, not a module.
  // We must strip ALL ES6 imports and CommonJS requires from the test code.
  let cleanedTest = testCode;
  
  // Multi-line or single-line import: import { A, B } from './C';
  cleanedTest = cleanedTest.replace(/^import\s+[^'"]+?from\s+['"][^'"]+['"];?/gm, "");
  
  // Single-line import without from: import './C';
  cleanedTest = cleanedTest.replace(/^import\s+['"][^'"]+['"];?/gm, "");
  
  // Multi-line or single-line require: const { A, B } = require('./C');
  cleanedTest = cleanedTest.replace(/^(?:const|let|var)\s+[^=]+?=\s*require\s*\(['"][^'"]+['"]\);?/gm, "");
  cleanedTest = cleanedTest.replace(/^require\s*\(['"][^'"]+['"]\);?/gm, "");

  // Node.js will execute this as a standard script, not a module.
  // We need to strip ES6 'export ' and 'export default ' keywords,
  // as well as CommonJS 'module.exports' from the user code.
  let cleanedUser = userCode;
  
  // If "export default function name" -> "function name"
  cleanedUser = cleanedUser.replace(/^export\s+default\s+(function|class)\s+/gm, "$1 ");
  
  // If "export default expression" -> "const _default_export = expression"
  cleanedUser = cleanedUser.replace(/^export\s+default\s+/gm, "const _default_export = ");
  
  // If "export const/let/var/function/class" -> "const/let/var/function/class"
  cleanedUser = cleanedUser.replace(/^export\s+(const|let|var|function|class)\s+/gm, "$1 ");
  
  // Strip named export blocks: export { hello, world } or export { hello as default }
  cleanedUser = cleanedUser.replace(/^export\s*\{[^}]*\};?/gm, "");

  // Strip TypeScript named type export blocks: export type { Foo, Bar }
  cleanedUser = cleanedUser.replace(/^export\s+type\s*\{[^}]*\};?/gm, "");

  // Strip module.exports
  cleanedUser = cleanedUser.replace(/^module\.exports\s*=/gm, "const _module_exports =");

  return [
    JEST_SHIM,
    "// === Solution ===",
    ensureNewline(cleanedUser),
    "// === Tests ===",
    ensureNewline(cleanedTest),
  ].join("\n");
}
