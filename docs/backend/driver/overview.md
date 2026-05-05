# Driver System

The Driver System is a standalone module designed to bridge the gap between "User Solution Code" and a "Sandboxed Execution Engine" (Judge0). It is responsible for generating boilerplate, handling serialization, and measuring execution time.

## 🎯 Design Philosophy

The driver follows the **Strategy Design Pattern**. This allows the platform to support any programming language by simply implementing a new `LanguageProvider`.

### Key Goals:
1.  **Zero External Dependencies**: Drivers (like Java) use only standard libraries (e.g., `java.util.Scanner`) to ensure they work on any Judge0 instance without configuration.
2.  **Batch Execution**: Multiple test cases are sent in a single Judge0 submission using a "Flat-Line" protocol for maximum efficiency.
3.  **High-Precision Timing**: Execution time is measured inside the driver using nanosecond precision (e.g., `System.nanoTime()` in Java).

## 🧩 Core Components

### 1. `DriverFactory` (`driver/index.ts`)
The entry point that registers and returns the correct language provider based on the `language` string.

### 2. `LanguageProvider` (`driver/languages/base-provider.ts`)
The abstract base class that enforces the `generate()` method. Every language implementation (Java, Python, C++) must extend this.

### 3. `TypeMapper` (`driver/languages/[lang]/[lang]-type-mapper.ts`)
The "Brain" of the language module. It is responsible for:
*   Converting generic types (`int[]`, `ListNode`) into language-specific types.
*   Generating the **Extraction Logic** (how the driver reads STDIN).
*   Generating the **Execution Block** (how the solution is called).

## 📡 The "Flat-Line" Protocol

To avoid needing JSON libraries (like GSON or Jackson) inside the judge, we use a simple space-separated protocol:

**Example Input (Two Sum):**
```text
3            // Number of test cases
4 2 7 11 15  // Case 1: [size] [elements...]
9            // Case 1: target
3 3 2 4      // Case 2: [size] [elements...]
6            // Case 2: target
...
```

## 🛠 Adding a New Language

To add support for a new language (e.g., Python):
1.  Create `driver/languages/python/` subfolder.
2.  Create `template.py` with `{{USER_CODE}}` and `{{DRIVER_LOGIC}}` placeholders.
3.  Implement `PythonTypeMapper` to generate Pythonic extraction code.
4.  Implement `PythonProvider` extending `LanguageProvider`.
5.  Register the new provider in `driver/index.ts`.
