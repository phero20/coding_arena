# Phase 1: The Foundation (Types & Interfaces)
We start by defining the "Contract." Every language module must speak the same language as the API.

1. **Shared Types**: Define the generic `FunctionSignature` and `TestCase` interfaces that the driver expects.
2. **Execution Package**: Define the output format (Source, Stdin, Judge0 ID).
3. **Language Config**: Define a map of Language IDs (e.g., Java: 62, Python: 71) so we never hardcode IDs in the logic.

**Standard**: Use TypeScript `interface` and `readonly` properties for immutability.




# Phase 2: The Language Interface (Strategy Pattern)
This is the core of our modularity. We define an abstract "LanguageModule" that every language must implement.

1. **Base Class**: Every language folder (Java, Python) will export a class that implements `generateBoilerplate()`.
2. **Type Mapping**: Each module will have a "Type Mapper" (e.g., mapping `int[][]` in the signature to `int[][]` in Java vs `List<List<int>>` in Python).
3. **Error Markers**: Define standard markers like `@@RESULT@@` and `@@TIME@@` that every driver template must use.

**Standard**: Follow the **Strategy Design Pattern** to allow adding new languages without touching core logic.





# Phase 3: The Java Module (Reference Implementation)
We build Java first because it's the most complex. If it works for Java, it works for everything.

1. **Template Design**: Create a `template.java` with placeholders like `{{USER_CODE}}`, `{{IMPORTS}}`, and `{{MAIN_LOOP}}`.
2. **Serialization Helpers**: Build the internal Java classes for `ListNode` and `TreeNode` so the AI-generated code has everything it needs to run.
3. **JSON Parsing**: Implement the `Gson` loop to read the JSONL `stdin`.

**Standard**: Keep the template clean and use a "Boilerplate Injected" approach for special data structures.







# Phase 4: The Core Orchestrator
This is the "Brain" that connects the API requests to the specific Language Modules.

1. **The Factory**: Create a `DriverFactory` that returns the correct module based on the requested language string.
2. **Placeholder Engine**: Build a utility that safely replaces markers in the templates without breaking code syntax.
3. **Validation**: Add a step to verify the generated code before it ever hits the network.

**Standard**: Use **Dependency Injection** principles so the Orchestrator is easy to test.








# Phase 5: API Integration & Result Parsing
Finally, we connect the `driver` module to your Bun backend.

1. **Submission Service**: Update the service to call `Driver.generatePackage()`.
2. **Judge0 Client**: Build a robust HTTP client to talk to your VM (with retry logic and timeout handling).
3. **The Matcher**: Use your `testcase-canonical.ts` to parse the `stdout` and generate the final "Accepted/WA" report.

**Standard**: Use **Asynchronous Polling** with a clear timeout to ensure the API never hangs.
