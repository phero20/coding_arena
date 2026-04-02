/**
 * Evaluation Domain Types
 * 
 * Note: AI judge I/O types (AiRunSamplesInput, AiRunSamplesResult) are defined 
 * in ai-code-judge.service.ts since they are tightly coupled to the Judge0/Groq 
 * runtime contract (ExecutionTestResult, rawLlmResponse etc).
 * 
 * Re-exported here for convenience when consumers want a single import point.
 */
export type { AiRunSamplesInput, AiRunSamplesResult } from '../services/ai-code-judge.service';
