# Judge Services

The services within the Judge module act as the core logic engine. They are responsible for preparing execution packages, analyzing edge cases, and auditing suspicious code.

**File Location**: [api/src/services/judge/](../../../api/src/services/judge/)

## 1. `driver-judge-execution.service.ts`

This is the master orchestrator. It sits between the `SubmissionWorker` and the `Judge0Service`.

### Execution Flow:
1. **Hydration & Routing**: Takes the raw `sourceCode`, `problemId`, and `languageId`. Verifies if the language is supported natively (`SUPPORTED_LANGUAGE_IDS`).
2. **Package Generation**: Uses the internal driver (`generateExecutionPackage`) to stitch the user's `sourceCode` together with the problem's hidden `function_signature` and test cases into a single executable file.
3. **Execution (`executeAndPoll`)**: Sends the package to `Judge0Service` and polls for completion.
4. **Parsing**: Uses the internal driver (`parseDriverResult`) to strip away the boilerplate and extract the exact stdout/stderr for each test case.
5. **Suspicion Engine**: Passes the raw results into `evaluateSuspicion`. This engine checks for cheating (e.g., hardcoding the expected string `if (input==5) print("10")`).
6. **AI Audit (`AiVerdictAuditService`)**: If the suspicion score is high, it sends the code to the Groq LLM. If the AI determines the user cheated, it overrides Judge0's `ACCEPTED` verdict with a failure state!

---

## 2. `ai-verdict-audit.service.ts`

A specialized security service. It utilizes the Groq LLM (Llama 3.1) to read the user's code and determine if they actually solved the problem algorithmically, or if they just "gamed" the test cases. It returns a `confidence` score and a `reason`, which the `DriverJudgeExecutionService` uses to confidently override the Sandbox verdict.
