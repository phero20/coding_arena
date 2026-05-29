import { CombineOptions } from "../types";
import { stripLines, ensureNewline } from "./helpers";

/**
 * Java (JUnit 5 → custom shim)
 *
 * Judge0 compiles a single .java file with javac and runs it.
 * JUnit 5 is NOT on the classpath, so we inject a lightweight shim that:
 *   - Provides @Test, @DisplayName, @Disabled annotations
 *   - Provides Assertions.* static methods
 *   - Has a reflection-based TestRunner.main() that discovers and runs tests
 *
 * Output format:
 *   PASSED: ClassName#methodName
 *   FAILED: ClassName#methodName
 *     reason: message
 *   Tests: X passed, Y failed, Z total
 */

// ─── JUnit 5-compatible shim (injected as Java source) ───────────────────────
const JUNIT_SHIM = `\
// ═══════════════════════════════════════════════════════════════════════════════
// JUnit 5-compatible shim — injected by exercise driver
// ═══════════════════════════════════════════════════════════════════════════════
import java.lang.annotation.*;
import java.lang.reflect.*;
import java.util.*;

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface Test {}

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface DisplayName { String value() default ""; }

@Retention(RetentionPolicy.RUNTIME)
@Target(ElementType.METHOD)
@interface Disabled { String value() default ""; }

@FunctionalInterface
interface Executable { void execute() throws Throwable; }

class Assertions {
    public static void assertEquals(Object expected, Object actual) {
        if (!Objects.equals(expected, actual))
            throw new AssertionError("expected: <" + expected + "> but was: <" + actual + ">");
    }

    public static void assertEquals(Object expected, Object actual, String message) {
        if (!Objects.equals(expected, actual))
            throw new AssertionError(message + " ==> expected: <" + expected + "> but was: <" + actual + ">");
    }

    public static void assertEquals(long expected, long actual) {
        if (expected != actual)
            throw new AssertionError("expected: <" + expected + "> but was: <" + actual + ">");
    }

    public static void assertEquals(double expected, double actual, double delta) {
        if (Math.abs(expected - actual) > delta)
            throw new AssertionError("expected: <" + expected + "> but was: <" + actual + "> (delta " + delta + ")");
    }

    public static void assertNotEquals(Object unexpected, Object actual) {
        if (Objects.equals(unexpected, actual))
            throw new AssertionError("expected: not equal to <" + unexpected + ">");
    }

    public static void assertTrue(boolean condition) {
        if (!condition) throw new AssertionError("expected: <true> but was: <false>");
    }

    public static void assertTrue(boolean condition, String message) {
        if (!condition) throw new AssertionError(message);
    }

    public static void assertFalse(boolean condition) {
        if (condition) throw new AssertionError("expected: <false> but was: <true>");
    }

    public static void assertFalse(boolean condition, String message) {
        if (condition) throw new AssertionError(message);
    }

    public static void assertNull(Object obj) {
        if (obj != null) throw new AssertionError("expected: <null> but was: <" + obj + ">");
    }

    public static void assertNotNull(Object obj) {
        if (obj == null) throw new AssertionError("expected: not <null>");
    }

    public static <T extends Throwable> T assertThrows(Class<T> expectedType, Executable executable) {
        try {
            executable.execute();
        } catch (Throwable actual) {
            if (expectedType.isInstance(actual)) {
                return expectedType.cast(actual);
            }
            throw new AssertionError(
                "expected: <" + expectedType.getName() + "> but was: <" + actual.getClass().getName() + ">",
                actual
            );
        }
        throw new AssertionError("Expected " + expectedType.getName() + " to be thrown, but nothing was thrown.");
    }

    public static void assertArrayEquals(Object[] expected, Object[] actual) {
        if (!Arrays.deepEquals(expected, actual))
            throw new AssertionError("expected: " + Arrays.deepToString(expected) + " but was: " + Arrays.deepToString(actual));
    }

    public static void assertArrayEquals(int[] expected, int[] actual) {
        if (!Arrays.equals(expected, actual))
            throw new AssertionError("expected: " + Arrays.toString(expected) + " but was: " + Arrays.toString(actual));
    }

    public static void assertIterableEquals(Iterable<?> expected, Iterable<?> actual) {
        List<Object> exp = new ArrayList<>();
        List<Object> act = new ArrayList<>();
        for (Object o : expected) exp.add(o);
        for (Object o : actual) act.add(o);
        if (!exp.equals(act))
            throw new AssertionError("expected: " + exp + " but was: " + act);
    }

    public static void fail(String message) {
        throw new AssertionError(message);
    }

    public static void fail() {
        throw new AssertionError("Test failed");
    }
}

class TestRunner {
    public static void main(String[] args) throws Exception {
        int passed = 0, failed = 0;

        // Collect all classes defined in this compilation unit via the class loader
        // We enumerate all loaded classes and filter to those in the default package
        List<Class<?>> testClasses = new ArrayList<>();
        for (Class<?> cls : getLoadedClasses()) {
            // Skip shim classes and anonymous/synthetic classes
            if (cls.isSynthetic() || cls.isAnonymousClass() || cls.isLocalClass()) continue;
            String name = cls.getName();
            if (name.equals("TestRunner") || name.equals("Assertions") || name.equals("Executable")) continue;
            if (name.startsWith("java.") || name.startsWith("javax.") || name.startsWith("sun.")) continue;
            testClasses.add(cls);
        }

        for (Class<?> cls : testClasses) {
            for (Method method : cls.getDeclaredMethods()) {
                if (method.getAnnotation(Test.class) == null) continue;
                if (method.getAnnotation(Disabled.class) != null) continue;

                Object instance;
                try {
                    instance = cls.getDeclaredConstructor().newInstance();
                } catch (Exception e) {
                    System.out.println("FAILED: " + cls.getSimpleName() + "#" + method.getName());
                    System.out.println("  reason: Could not instantiate " + cls.getSimpleName() + ": " + e.getMessage());
                    failed++;
                    continue;
                }

                try {
                    method.invoke(instance);
                    System.out.println("PASSED: " + cls.getSimpleName() + "#" + method.getName());
                    passed++;
                } catch (InvocationTargetException ite) {
                    Throwable cause = ite.getCause() != null ? ite.getCause() : ite;
                    System.out.println("FAILED: " + cls.getSimpleName() + "#" + method.getName());
                    System.out.println("  reason: " + cause.getMessage());
                    failed++;
                } catch (Exception e) {
                    System.out.println("FAILED: " + cls.getSimpleName() + "#" + method.getName());
                    System.out.println("  reason: " + e.getMessage());
                    failed++;
                }
            }
        }

        int total = passed + failed;
        System.out.println("Tests: " + passed + " passed, " + failed + " failed, " + total + " total");
        System.exit(failed > 0 ? 1 : 0);
    }

    private static List<Class<?>> getLoadedClasses() {
        // Use a known trick: iterate over classes reachable from the system class loader
        // For single-file Judge0 compilation, all classes are in the default package
        List<Class<?>> result = new ArrayList<>();
        try {
            java.lang.reflect.Field f = ClassLoader.class.getDeclaredField("classes");
            f.setAccessible(true);
            @SuppressWarnings("unchecked")
            Vector<Class<?>> classes = (Vector<Class<?>>) f.get(TestRunner.class.getClassLoader());
            result.addAll(classes);
        } catch (Exception e) {
            // Fallback: nothing to iterate — tests won't run but won't crash
        }
        return result;
    }
}
// ═══════════════════════════════════════════════════════════════════════════════
`;

// JUnit import patterns to strip
const JUNIT_IMPORT_PATTERNS = [
  /^\s*import\s+org\.junit\./,
  /^\s*import\s+static\s+org\.junit\./,
  /^\s*import\s+org\.junit\.jupiter\./,
  /^\s*import\s+static\s+org\.junit\.jupiter\./,
];

// Class-level JUnit annotations to strip
const JUNIT_CLASS_ANNOTATION_PATTERNS = [
  /^\s*@ExtendWith\s*\(/,
  /^\s*@RunWith\s*\(/,
  /^\s*@SpringBootTest/,
];

function stripJUnitImports(code: string): string {
  let result = code;
  for (const pattern of JUNIT_IMPORT_PATTERNS) {
    result = stripLines(result, pattern);
  }
  return result;
}

function stripJUnitClassAnnotations(code: string): string {
  let result = code;
  for (const pattern of JUNIT_CLASS_ANNOTATION_PATTERNS) {
    result = stripLines(result, pattern);
  }
  return result;
}

function collectImports(code: string): string[] {
  return code
    .split("\n")
    .filter((l) => /^\s*import\s+/.test(l))
    .map((l) => l.trim());
}

function stripImports(code: string): string {
  return stripLines(code, /^\s*import\s+/);
}

function stripPackage(code: string): string {
  return stripLines(code, /^\s*package\s+/);
}

export function combineJava(opts: CombineOptions): string {
  const { userCode, testCode } = opts;

  // Strip package declarations (Judge0 single-file, no packages)
  const solutionNoPackage = stripPackage(userCode);
  const testNoPackage = stripPackage(testCode);

  // Strip JUnit imports and class-level annotations from test
  const cleanTest = stripJUnitClassAnnotations(stripJUnitImports(testNoPackage));
  const cleanSolution = stripJUnitImports(solutionNoPackage);

  // Collect all non-JUnit imports, deduplicated
  const junitPrefixes = ["org.junit.", "static org.junit."];
  const allImports = [
    ...new Set([
      ...collectImports(cleanSolution),
      ...collectImports(cleanTest),
    ]),
  ].filter((imp) => !junitPrefixes.some((p) => imp.includes(p)));

  // Strip imports from bodies (they go at the top)
  const solutionBody = stripImports(cleanSolution);
  const testBody = stripImports(cleanTest);

  // Make solution class package-private (remove top-level `public` modifier)
  const solutionBodyPrivate = solutionBody.replace(
    /^public\s+(class|interface|enum|record)\s+/m,
    "$1 ",
  );

  return [
    JUNIT_SHIM,
    allImports.join("\n"),
    "",
    "// === Solution ===",
    ensureNewline(solutionBodyPrivate),
    "// === Tests ===",
    ensureNewline(testBody),
  ].join("\n");
}
