import { CombineOptions } from "../types";
import { stripLines, ensureNewline } from "./helpers";

/**
 * C# (xUnit / NUnit / MSTest → custom shim)
 *
 * Judge0 runs C# via Mono which does NOT have xUnit/NUnit/MSTest available.
 * We inject a lightweight xUnit-compatible shim that:
 *   - Provides [Fact], [Theory], [InlineData] attributes
 *   - Provides Assert.* methods that throw on failure
 *   - Has a reflection-based Main() that discovers and runs all [Fact] methods
 *
 * Output format:
 *   PASSED: ClassName.MethodName
 *   FAILED: ClassName.MethodName
 *     reason: message
 *   Tests: X passed, Y failed, Z total
 */

// ─── xUnit-compatible shim (injected as C# source) ───────────────────────────
const XUNIT_SHIM = `\
// ═══════════════════════════════════════════════════════════════════════════════
// xUnit-compatible shim — injected by exercise driver
// ═══════════════════════════════════════════════════════════════════════════════
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;

[AttributeUsage(AttributeTargets.Method, AllowMultiple = false)]
class FactAttribute : Attribute { }

[AttributeUsage(AttributeTargets.Method, AllowMultiple = false)]
class TheoryAttribute : Attribute { }

[AttributeUsage(AttributeTargets.Method, AllowMultiple = true)]
class InlineDataAttribute : Attribute {
    public object[] Data { get; }
    public InlineDataAttribute(params object[] data) { Data = data; }
}

static class Assert {
    public static void Equal<T>(T expected, T actual) {
        if (!Equals(expected, actual))
            throw new Exception($"Assert.Equal() Failure\\nExpected: {Format(expected)}\\nActual:   {Format(actual)}");
    }

    public static void NotEqual<T>(T unexpected, T actual) {
        if (Equals(unexpected, actual))
            throw new Exception($"Assert.NotEqual() Failure: both are {Format(actual)}");
    }

    public static void True(bool condition, string message = "Expected true but was false") {
        if (!condition) throw new Exception(message);
    }

    public static void False(bool condition, string message = "Expected false but was true") {
        if (condition) throw new Exception(message);
    }

    public static void Null(object obj) {
        if (obj != null) throw new Exception($"Assert.Null() Failure: value is {Format(obj)}");
    }

    public static void NotNull(object obj) {
        if (obj == null) throw new Exception("Assert.NotNull() Failure: value is null");
    }

    public static void Contains<T>(T expected, IEnumerable<T> collection) {
        if (collection == null) throw new Exception("Assert.Contains() Failure: collection is null");
        if (!collection.Contains(expected))
            throw new Exception($"Assert.Contains() Failure: {Format(expected)} not found in collection");
    }

    public static void Contains(string expectedSubstring, string actualString) {
        if (actualString == null || !actualString.Contains(expectedSubstring))
            throw new Exception($"Assert.Contains() Failure: \\"{expectedSubstring}\\" not found in \\"{actualString}\\"");
    }

    public static T Throws<T>(Action action) where T : Exception {
        if (action == null) throw new ArgumentNullException(nameof(action));
        try { action(); }
        catch (T ex) { return ex; }
        catch (Exception ex) {
            throw new Exception($"Assert.Throws() Failure: expected {typeof(T).Name} but got {ex.GetType().Name}");
        }
        throw new Exception($"Assert.Throws() Failure: expected {typeof(T).Name} but no exception was thrown");
    }

    public static void Empty(IEnumerable collection) {
        if (collection == null) throw new Exception("Assert.Empty() Failure: collection is null");
        var enumerator = collection.GetEnumerator();
        if (enumerator.MoveNext())
            throw new Exception("Assert.Empty() Failure: collection is not empty");
    }

    public static void NotEmpty(IEnumerable collection) {
        if (collection == null) throw new Exception("Assert.NotEmpty() Failure: collection is null");
        var enumerator = collection.GetEnumerator();
        if (!enumerator.MoveNext())
            throw new Exception("Assert.NotEmpty() Failure: collection is empty");
    }

    private static string Format(object value) =>
        value == null ? "null" : value.ToString();
}

// ─── Reflection-based test runner ────────────────────────────────────────────
class _TestRunner {
    static int Main(string[] args) {
        int passed = 0, failed = 0;
        var assembly = Assembly.GetExecutingAssembly();

        foreach (var type in assembly.GetTypes()) {
            foreach (var method in type.GetMethods(BindingFlags.Public | BindingFlags.Instance | BindingFlags.DeclaredOnly)) {
                if (method.GetCustomAttribute<FactAttribute>() == null) continue;

                object instance;
                try { instance = Activator.CreateInstance(type); }
                catch (Exception ex) {
                    Console.WriteLine($"FAILED: {type.Name}.{method.Name}");
                    Console.WriteLine($"  reason: Could not instantiate {type.Name}: {ex.Message}");
                    failed++;
                    continue;
                }

                try {
                    method.Invoke(instance, null);
                    Console.WriteLine($"PASSED: {type.Name}.{method.Name}");
                    passed++;
                } catch (TargetInvocationException tie) {
                    var inner = tie.InnerException ?? tie;
                    Console.WriteLine($"FAILED: {type.Name}.{method.Name}");
                    Console.WriteLine($"  reason: {inner.Message}");
                    failed++;
                } catch (Exception ex) {
                    Console.WriteLine($"FAILED: {type.Name}.{method.Name}");
                    Console.WriteLine($"  reason: {ex.Message}");
                    failed++;
                }
            }
        }

        int total = passed + failed;
        Console.WriteLine($"Tests: {passed} passed, {failed} failed, {total} total");
        return failed > 0 ? 1 : 0;
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
`;

// Test framework using directives to strip
const FRAMEWORK_USING_PATTERNS = [
  /^\s*using\s+Xunit\s*;/,
  /^\s*using\s+NUnit\.Framework\s*;/,
  /^\s*using\s+Microsoft\.VisualStudio\.TestTools\.UnitTesting\s*;/,
];

// Test framework attributes to strip (MSTest class/method markers)
const FRAMEWORK_ATTR_PATTERNS = [
  /^\s*\[TestClass\]/,
  /^\s*\[TestMethod\]/,
  /^\s*\[TestInitialize\]/,
  /^\s*\[TestCleanup\]/,
  /^\s*\[ClassInitialize\]/,
  /^\s*\[ClassCleanup\]/,
];

// Namespace declarations to strip (Mono single-file compilation)
const NAMESPACE_PATTERN = /^\s*namespace\s+\S+\s*(\{)?\s*$/;

function stripFrameworkDirectives(code: string): string {
  let result = code;
  for (const pattern of FRAMEWORK_USING_PATTERNS) {
    result = stripLines(result, pattern);
  }
  for (const pattern of FRAMEWORK_ATTR_PATTERNS) {
    result = stripLines(result, pattern);
  }
  return result;
}

function stripNamespaces(code: string): string {
  // Remove namespace declarations and their matching closing braces.
  // Strategy: remove lines that are just "namespace Foo" or "namespace Foo {"
  // and track brace depth to remove the matching closing "}" if needed.
  const lines = code.split("\n");
  const result: string[] = [];
  let skipClosingBrace = 0;

  for (const line of lines) {
    if (NAMESPACE_PATTERN.test(line)) {
      // If the namespace line itself opens a brace, we need to remove the matching close
      if (/\{/.test(line)) {
        skipClosingBrace++;
      }
      // Skip the namespace declaration line itself
      continue;
    }

    // If we're tracking a namespace brace and hit a lone closing brace, skip it
    if (skipClosingBrace > 0 && /^\s*\}\s*$/.test(line)) {
      skipClosingBrace--;
      continue;
    }

    result.push(line);
  }

  return result.join("\n");
}

function collectUsings(code: string): string[] {
  return code
    .split("\n")
    .filter((l) => /^\s*using\s+/.test(l))
    .map((l) => l.trim());
}

function stripUsings(code: string): string {
  return stripLines(code, /^\s*using\s+/);
}

export function combineCSharp(opts: CombineOptions): string {
  const { userCode, testCode } = opts;

  // Clean both files
  const cleanSolution = stripNamespaces(stripFrameworkDirectives(userCode));
  const cleanTest = stripNamespaces(stripFrameworkDirectives(testCode));

  // Collect all non-framework using directives, deduplicated
  const frameworkUsings = new Set([
    "using Xunit;",
    "using NUnit.Framework;",
    "using Microsoft.VisualStudio.TestTools.UnitTesting;",
  ]);

  const allUsings = [
    ...new Set([
      ...collectUsings(cleanSolution),
      ...collectUsings(cleanTest),
    ]),
  ].filter((u) => !frameworkUsings.has(u));

  const solutionBody = stripUsings(cleanSolution);
  const testBody = stripUsings(cleanTest);

  return [
    XUNIT_SHIM,
    allUsings.join("\n"),
    "",
    "// === Solution ===",
    ensureNewline(solutionBody),
    "// === Tests ===",
    ensureNewline(testBody),
  ].join("\n");
}
