import { CombineOptions } from "../types";
import { stripLines, ensureNewline } from "./helpers";

/**
 * Minimal Unity-compatible test framework header injected into C combined files.
 * Replaces the missing unity.h / unity.c that are not available on Judge0.
 */
const UNITY_C_HEADER = `/* ─── Minimal Unity-compatible runner (injected by exercise driver) ─────────── */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>

static int _u_passed = 0, _u_failed = 0;
static const char *_u_test = "";

static void _u_fail(int line, const char *msg) {
  printf("FAIL (%s line %d): %s\\n", _u_test, line, msg);
  _u_passed--;
  _u_failed++;
}
#define UNITY_BEGIN() (_u_passed = 0, _u_failed = 0, 0)
#define UNITY_END() ((_u_failed == 0) ? (printf("OK (%d tests)\\n", _u_passed + _u_failed), 0) : (printf("FAIL (%d of %d failed)\\n", _u_failed, _u_passed + _u_failed), 1))
#define RUN_TEST(fn) do { _u_test = #fn; _u_passed++; setUp(); fn(); tearDown(); } while (0)
#define TEST_ASSERT_TRUE(c) do { if (!(c)) { _u_fail(__LINE__, "Expected TRUE: " #c); return; } } while (0)
#define TEST_ASSERT_FALSE(c) do { if (c) { _u_fail(__LINE__, "Expected FALSE: " #c); return; } } while (0)
#define TEST_ASSERT_NULL(p) do { if ((p) != NULL) { _u_fail(__LINE__, "Expected NULL"); return; } } while (0)
#define TEST_ASSERT_NOT_NULL(p) do { if ((p) == NULL) { _u_fail(__LINE__, "Expected non-NULL"); return; } } while (0)
#define TEST_ASSERT_EQUAL(e, a) do { if ((long long)(e) != (long long)(a)) { char _m[128]; snprintf(_m, 128, "Expected %lld was %lld", (long long)(e), (long long)(a)); _u_fail(__LINE__, _m); return; } } while (0)
#define TEST_ASSERT_EQUAL_INT(e, a) TEST_ASSERT_EQUAL(e, a)
#define TEST_ASSERT_EQUAL_INT8(e, a) TEST_ASSERT_EQUAL(e, a)
#define TEST_ASSERT_EQUAL_INT16(e, a) TEST_ASSERT_EQUAL(e, a)
#define TEST_ASSERT_EQUAL_INT32(e, a) TEST_ASSERT_EQUAL(e, a)
#define TEST_ASSERT_EQUAL_INT64(e, a) TEST_ASSERT_EQUAL(e, a)
#define TEST_ASSERT_EQUAL_UINT(e, a) do { if ((unsigned long long)(e) != (unsigned long long)(a)) { char _m[128]; snprintf(_m, 128, "Expected %llu was %llu", (unsigned long long)(e), (unsigned long long)(a)); _u_fail(__LINE__, _m); return; } } while (0)
#define TEST_ASSERT_EQUAL_UINT8(e, a) TEST_ASSERT_EQUAL_UINT(e, a)
#define TEST_ASSERT_EQUAL_UINT16(e, a) TEST_ASSERT_EQUAL_UINT(e, a)
#define TEST_ASSERT_EQUAL_UINT32(e, a) TEST_ASSERT_EQUAL_UINT(e, a)
#define TEST_ASSERT_EQUAL_UINT64(e, a) TEST_ASSERT_EQUAL_UINT(e, a)
#define TEST_ASSERT_EQUAL_size_t(e, a) TEST_ASSERT_EQUAL_UINT(e, a)
#define TEST_ASSERT_EQUAL_FLOAT(e, a) do { if (fabs((double)(e)-(double)(a)) > 1e-6) { char _m[128]; snprintf(_m, 128, "Expected %f was %f", (double)(e), (double)(a)); _u_fail(__LINE__, _m); return; } } while (0)
#define TEST_ASSERT_EQUAL_DOUBLE(e, a) TEST_ASSERT_EQUAL_FLOAT(e, a)
#define TEST_ASSERT_EQUAL_STRING(e, a) do { if (strcmp((e),(a))!=0) { char _m[256]; snprintf(_m, 256, "Expected \\"%s\\" was \\"%s\\"", (e), (a)); _u_fail(__LINE__, _m); return; } } while (0)
#define TEST_ASSERT_EQUAL_INT_ARRAY(e, a, n) do { for(int _i=0;_i<(int)(n);_i++) if((int)(e)[_i]!=(int)(a)[_i]){char _m[128];snprintf(_m,128,"Array diff at [%d]: exp %d got %d",_i,(int)(e)[_i],(int)(a)[_i]);_u_fail(__LINE__,_m);return;} } while (0)
#define TEST_ASSERT_EQUAL_CHAR(e, a) do { if ((char)(e) != (char)(a)) { char _m[64]; snprintf(_m, 64, "Expected '%c' was '%c'", (char)(e), (char)(a)); _u_fail(__LINE__, _m); return; } } while (0)
#define TEST_FAIL_MESSAGE(msg) do { _u_fail(__LINE__, msg); return; } while (0)
#define TEST_IGNORE() return
#define TEST_ASSERT_MESSAGE(c, msg) do { if (!(c)) { _u_fail(__LINE__, msg); return; } } while (0)
/* ─────────────────────────────────────────────────────────────────────────────── */
`;

/**
 * C (Unity test framework)
 *
 * Exercism C exercises have:
 *   - hello_world.c  (solution)
 *   - hello_world.h  (header — we don't have this, so we inline the solution)
 *   - test_hello_world.c (test)
 *
 * Since we only have solution + test, we concatenate them.
 * The test file includes the header via `#include "hello_world.h"` —
 * we strip that and inline the solution directly.
 */
export function combineC(opts: CombineOptions): string {
  const { exerciseSlug, userCode, testCode } = opts;

  const snakeSlug = exerciseSlug.replace(/-/g, "_");
  // Strip #include for the solution header (we're inlining it)
  const includePattern = new RegExp(
    `^\\s*#include\\s+["']${snakeSlug}\\.h["']`,
    "m"
  );
  // Also strip #include "unity.h" — we inject our own minimal Unity header above
  let cleanedTest = stripLines(testCode, includePattern);
  cleanedTest = stripLines(cleanedTest, /^\s*#include\s+["']unity\.h["']/m);

  let cleanedUser = stripLines(userCode, includePattern);

  return [
    UNITY_C_HEADER,
    "// === Solution ===",
    ensureNewline(cleanedUser),
    "// === Tests ===",
    ensureNewline(cleanedTest),
  ].join("\n");
}

/**
 * C++ (Catch2 / doctest)
 *
 * Same strategy as C — strip the solution header include and inline.
 * Also strips Catch2/doctest framework includes and config macros, then
 * injects a lightweight Catch2-compatible shim so tests run on Judge0.
 */

/**
 * Lightweight Catch2-compatible shim for C++.
 *
 * Covers: TEST_CASE, SECTION, REQUIRE, CHECK, REQUIRE_FALSE, CHECK_FALSE,
 * REQUIRE_THROWS, REQUIRE_THROWS_AS, REQUIRE_NOTHROW, INFO,
 * REQUIRE_THAT, CHECK_THAT.
 *
 * Output format:
 *   PASSED: test case name
 *   FAILED: test case name
 *     reason: message
 *   Tests: X passed, Y failed, Z total
 */
const CATCH2_CPP_HEADER = `/* ─── Minimal Catch2-compatible runner (injected by exercise driver) ─────────── */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdexcept>
#include <string>
#include <vector>
#include <functional>
#include <sstream>

namespace _catch2_shim {

struct TestCase {
  std::string name;
  std::function<void()> fn;
};

static std::vector<TestCase>& registry() {
  static std::vector<TestCase> r;
  return r;
}

struct Registrar {
  Registrar(const char* name, std::function<void()> fn) {
    registry().push_back({name, fn});
  }
};

struct AssertionFailed : public std::exception {
  std::string msg;
  explicit AssertionFailed(const std::string& m) : msg(m) {}
  const char* what() const noexcept override { return msg.c_str(); }
};

// SECTION support: sections run inline (no re-entry), failures propagate up
struct SectionGuard {
  const char* name;
  explicit SectionGuard(const char* n) : name(n) {}
};

} // namespace _catch2_shim

// ── Macros ────────────────────────────────────────────────────────────────────

#define TEST_CASE(name, ...) \\
  static void _tc_impl_##__LINE__(); \\
  static _catch2_shim::Registrar _tc_reg_##__LINE__(name, _tc_impl_##__LINE__); \\
  static void _tc_impl_##__LINE__()

#define SECTION(name) if (true)

#define REQUIRE(expr) \\
  do { \\
    if (!(expr)) { \\
      std::ostringstream _oss; \\
      _oss << "REQUIRE(" #expr ") failed at line " << __LINE__; \\
      throw _catch2_shim::AssertionFailed(_oss.str()); \\
    } \\
  } while (0)

#define CHECK(expr) \\
  do { \\
    if (!(expr)) { \\
      std::ostringstream _oss; \\
      _oss << "CHECK(" #expr ") failed at line " << __LINE__; \\
      throw _catch2_shim::AssertionFailed(_oss.str()); \\
    } \\
  } while (0)

#define REQUIRE_FALSE(expr) \\
  do { \\
    if (!!(expr)) { \\
      std::ostringstream _oss; \\
      _oss << "REQUIRE_FALSE(" #expr ") failed at line " << __LINE__; \\
      throw _catch2_shim::AssertionFailed(_oss.str()); \\
    } \\
  } while (0)

#define CHECK_FALSE(expr) REQUIRE_FALSE(expr)

#define REQUIRE_THROWS(expr) \\
  do { \\
    bool _threw = false; \\
    try { (void)(expr); } catch (...) { _threw = true; } \\
    if (!_threw) { \\
      throw _catch2_shim::AssertionFailed("REQUIRE_THROWS(" #expr "): expected exception, none thrown (line " + std::to_string(__LINE__) + ")"); \\
    } \\
  } while (0)

#define REQUIRE_THROWS_AS(expr, ExType) \\
  do { \\
    bool _threw = false; \\
    try { (void)(expr); } catch (const ExType&) { _threw = true; } catch (...) {} \\
    if (!_threw) { \\
      throw _catch2_shim::AssertionFailed("REQUIRE_THROWS_AS(" #expr ", " #ExType "): expected " #ExType ", not thrown (line " + std::to_string(__LINE__) + ")"); \\
    } \\
  } while (0)

#define REQUIRE_NOTHROW(expr) \\
  do { \\
    try { (void)(expr); } \\
    catch (const std::exception& _e) { \\
      throw _catch2_shim::AssertionFailed(std::string("REQUIRE_NOTHROW(" #expr "): unexpected exception: ") + _e.what()); \\
    } catch (...) { \\
      throw _catch2_shim::AssertionFailed("REQUIRE_NOTHROW(" #expr "): unexpected unknown exception"); \\
    } \\
  } while (0)

#define INFO(msg) do { (void)(msg); } while (0)

#define REQUIRE_THAT(expr, matcher) \\
  do { \\
    auto _val = (expr); \\
    if (!(matcher).match(_val)) { \\
      std::ostringstream _oss; \\
      _oss << "REQUIRE_THAT(" #expr ", " #matcher ") failed at line " << __LINE__; \\
      throw _catch2_shim::AssertionFailed(_oss.str()); \\
    } \\
  } while (0)

#define CHECK_THAT(expr, matcher) REQUIRE_THAT(expr, matcher)

// Catch2 Matchers namespace stub (basic string Contains / Equals)
namespace Catch {
  namespace Matchers {
    struct StringContainsMatcher {
      std::string substr;
      explicit StringContainsMatcher(const std::string& s) : substr(s) {}
      bool match(const std::string& v) const { return v.find(substr) != std::string::npos; }
    };
    struct StringEqualsMatcher {
      std::string expected;
      explicit StringEqualsMatcher(const std::string& s) : expected(s) {}
      bool match(const std::string& v) const { return v == expected; }
    };
    inline StringContainsMatcher Contains(const std::string& s) { return StringContainsMatcher{s}; }
    inline StringEqualsMatcher  Equals(const std::string& s)    { return StringEqualsMatcher{s}; }
  }
}

// ── main ──────────────────────────────────────────────────────────────────────

int main() {
  int _passed = 0, _failed = 0;
  for (auto& tc : _catch2_shim::registry()) {
    try {
      tc.fn();
      printf("PASSED: %s\\n", tc.name.c_str());
      _passed++;
    } catch (const _catch2_shim::AssertionFailed& e) {
      printf("FAILED: %s\\n  reason: %s\\n", tc.name.c_str(), e.what());
      _failed++;
    } catch (const std::exception& e) {
      printf("FAILED: %s\\n  reason: unexpected exception: %s\\n", tc.name.c_str(), e.what());
      _failed++;
    } catch (...) {
      printf("FAILED: %s\\n  reason: unknown exception\\n", tc.name.c_str());
      _failed++;
    }
  }
  int _total = _passed + _failed;
  printf("Tests: %d passed, %d failed, %d total\\n", _passed, _failed, _total);
  return _failed > 0 ? 1 : 0;
}
/* ─────────────────────────────────────────────────────────────────────────────── */
`;

export function combineCpp(opts: CombineOptions): string {
  const { exerciseSlug, userCode, testCode } = opts;

  const snakeSlug = exerciseSlug.replace(/-/g, "_");

  // Strip the solution header include (we're inlining the solution)
  const includePattern = new RegExp(
    `^\\s*#include\\s+["']${snakeSlug}\\.h(pp)?["']`,
    "gm"
  );

  // Strip Catch2 / doctest framework includes
  let cleanedTest = testCode.replace(includePattern, "");
  cleanedTest = cleanedTest.replace(/^\s*#include\s+["']catch2\/[^'"]+["'];?/gm, "");
  cleanedTest = cleanedTest.replace(/^\s*#include\s+["']catch\.hpp["'];?/gm, "");
  cleanedTest = cleanedTest.replace(/^\s*#include\s+["']doctest\.h["'];?/gm, "");

  // Strip Catch2 / doctest config macros
  cleanedTest = cleanedTest.replace(/^\s*#define\s+CATCH_CONFIG_MAIN\b[^\n]*/gm, "");
  cleanedTest = cleanedTest.replace(/^\s*#define\s+CATCH_CONFIG_RUNNER\b[^\n]*/gm, "");
  cleanedTest = cleanedTest.replace(/^\s*#define\s+DOCTEST_CONFIG_IMPLEMENT_WITH_MAIN\b[^\n]*/gm, "");

  let cleanedUser = userCode.replace(includePattern, "");

  return [
    CATCH2_CPP_HEADER,
    "// === Solution ===",
    ensureNewline(cleanedUser),
    "// === Tests ===",
    ensureNewline(cleanedTest),
  ].join("\n");
}
