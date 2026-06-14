# Problems Services

Because the Problems module is incredibly dense, its services are divided into two distinct categories: **Standard Logic** and **AI Generation Engines**.

**File Location**: [api/src/services/problems/](../../../api/src/services/problems/)

## 1. Standard Logic Services

### `problem.service.ts`
The core CRUD manager. It bridges the `problem.repository` with the API payload. Nothing fancy, just clean, validated data access.

### `problem-test.service.ts`
The test case manager. 
- **Security**: When `getTests` is called by a regular user, this service actively filters out any test cases marked as `type === "hidden"`, ensuring users cannot scrape the hidden tests used by the `Judge` module to evaluate their code.

### `problem-validator.service.ts`
A strict syntax validation service. It uses `acorn` (a JS parser) to parse `function_signature` or `class_signature` JSON payloads and ensure that the provided syntax is valid JavaScript/TypeScript before saving it to the database.

---

## 2. AI Generation Engines

These services utilize LLMs to automate the heavy lifting of content creation.

### `ai-problem.service.ts`
- **Engine**: Groq (Llama 3.1)
- **Role**: Takes a text prompt (e.g., "Create a Leetcode Medium about Two Pointers") and returns a fully structured JSON problem document.
- **Complexity**: Highly complex system prompt engineering to enforce exact JSON schemas (title, description, difficulty, tags, function signature, boilerplate code in 7 languages).

### `testcase-generator.service.ts`
- **Engine**: Groq (Llama 3.1)
- **Role**: Automatically generates 15-20 robust edge-case test validations for a given problem signature.
- **Execution**: Because the AI only generates the *inputs*, this service actually calls the backend `CompilerService` to run the AI's inputs against the official solution to mathematically generate the `expected_output`!

### `testcase-canonical.ts`
- **Engine**: Groq (Llama 3.1)
- **Role**: A parsing assistant. If an admin pastes raw text from a website like Codeforces, this service uses the LLM to intelligently extract the inputs and expected outputs and convert them into the strict `[{ input, expected_output }]` JSON array required by our database.

### `ai-addsolve.service.ts`
- **Engine**: AWS Bedrock (Anthropic Claude 3.5 Sonnet)
- **Role**: The ultimate solver. It takes a newly generated problem and uses Claude Sonnet's superior reasoning capabilities to write the perfect `canonical_solution` (official solution) for it. It then updates the database directly.
