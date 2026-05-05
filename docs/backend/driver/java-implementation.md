# Java Driver: Technical Guide

This document explains the specific implementation details of the Java Driver, which serves as the blueprint for high-performance, zero-dependency execution.

## 🛠 Why "Zero-Dependency"?

Standard competitive programming environments (like Judge0 VMs) often do not have external JARs like `Gson` or `Jackson` in the classpath. To ensure this driver runs on **any** Judge0 instance without manual server configuration, it uses only standard `java.util.*` libraries.

## 📡 The Flat-Line Protocol (Java Edition)

The driver reads input from `System.in` using a `java.util.Scanner`. Data is sent in a specific order based on the `FunctionSignature`.

### Data Encoding:
*   **Integers/Booleans**: Sent as raw text.
*   **Strings/Characters**: **Base64 encoded** in the generator (Bun) and decoded in the driver (`Base64.getDecoder().decode()`). This prevents spaces or special characters from breaking the scanner.
*   **Arrays/Lists**: Prefixed with their size (e.g., `3 10 20 30`).
*   **Trees**: Represented as a BFS-flattened array including `"null"` strings.

## 🧩 Internal Components

### 1. The Mapper (`JavaTypeMapper.ts`)
Generates the specific Java code required to extract parameters.
*   **Example**: For `int[] nums`, it generates:
    ```java
    int n0 = sc.nextInt(); 
    int[] nums = new int[n0]; 
    for(int i=0; i<n0; i++) nums[i] = sc.nextInt();
    ```

### 2. The Universal Serializer (`template.java`)
A recursive `serialize(Object obj)` method that can detect and format:
*   `ListNode` ➡️ `[1,2,3]`
*   `TreeNode` ➡️ `[1,null,2]`
*   `List<List<Integer>>` ➡️ `[[1,2],[3,4]]`

## ⏱ Precision Timing

Timing is measured using `System.nanoTime()` immediately before and after the `solution.method()` call.
```java
long start = System.nanoTime();
ListNode result = solution.addTwoNumbers(l1, l2);
long end = System.nanoTime();
double duration = (end - start) / 1_000_000.0; // Convert to milliseconds
```

## 🚨 Error Handling
The entire execution block is wrapped in a `try-catch`. 
*   **Success**: Prints `@@RESULT@@:[...] @@TIME@@:0.123`.
*   **Crash**: Prints `@@RUNTIME_ERROR@@:Message`.
This allows the **Result Parser** in the API to distinguish between a wrong answer and a code crash.
