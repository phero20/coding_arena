import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import { type ICradle } from "../../libs/awilix-container";
import type { IProblemRepository } from "../../repositories/problems/problem.repository";
import type { Problem } from "../../types/problems/problem.types";

const BEDROCK_MODEL_ID = "anthropic.claude-3-5-sonnet-20241022-v2:0";

export class AiAddSolveService {
  private problemRepo: IProblemRepository;
  private bedrockClient: BedrockRuntimeClient;

  constructor({ problemRepository }: ICradle & any) {
    this.problemRepo = problemRepository;
    // AWS SDK automatically picks up AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_REGION from your .env
    this.bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });
  }

  /**
   * Main entry point to process all problems sequentially
   */
  public async processAllProblems(startId: number = 1, endId: number = 3640) {
    console.log(`Starting Batch AI Solution & Signature Generation from ID ${startId} to ${endId}`);
    
    for (let i = startId; i <= endId; i++) {
      const problemIdStr = i.toString();
      
      try {
        const problem = await this.problemRepo.findByProblemId(problemIdStr);
        
        if (!problem) {
          console.warn(`Problem ${problemIdStr} not found. Skipping.`);
          continue;
        }

        if (problem.is_premium) {
          console.log(`Problem ${problemIdStr} is premium. Skipping.`);
          continue;
        }

        console.log(`\n======================================`);
        console.log(`[Processing] ID: ${problemIdStr} - ${problem.title}`);
        console.log(`======================================`);

        // 1. Build the prompt for Claude 3.5 Sonnet
        const prompt = this.buildPrompt(problem);
        
        // 2. Call Amazon Bedrock
        const response = await this.invokeClaudeOnBedrock(prompt);
        
        if (!response) {
          console.error(`Failed to get response from Bedrock for problem ${problemIdStr}`);
          continue;
        }
        
        // 3. Parse the JSON response
        let parsedOutput;
        try {
          parsedOutput = JSON.parse(response);
        } catch (e) {
          console.error(`Invalid JSON returned from Claude for problem ${problemIdStr}`, response);
          continue;
        }

        // 4. Update the Database with fixed signature (if flagged inaccurate)
        if (parsedOutput.is_signature_inaccurate && parsedOutput.fixed_signature) {
          console.log(`-> Fixing inaccurate signature for problem ${problemIdStr}`);
          await this.problemRepo.createOrUpdate({
            ...problem,
            problem_type: parsedOutput.fixed_signature.type || problem.problem_type,
            function_signature: parsedOutput.fixed_signature.function_signature,
            class_signature: parsedOutput.fixed_signature.class_signature,
          });
        }

        // 5. Log the Solutions (To be saved in your Solutions DB/Repo)
        if (parsedOutput.solutions && parsedOutput.solutions.length > 0) {
          console.log(`-> Successfully generated ${parsedOutput.solutions.length} solution approaches.`);
          
          // TODO: Hook this up to your SolutionRepository!
          // example: await this.solutionRepo.saveSolutions(problemIdStr, parsedOutput.solutions);
        }

        console.log(`-> Completed problem ${problemIdStr}. Waiting 2 seconds for API limits...`);
        
        // Rate limiting buffer: Wait 2 seconds before the next problem
        await new Promise(res => setTimeout(res, 2000));
        
      } catch (error) {
        console.error(`FATAL ERROR on problem ${problemIdStr}:`, error);
        // Exponential backoff to protect against Bedrock 429 Rate Limits
        console.log("Sleeping for 10 seconds before retrying next problem...");
        await new Promise(res => setTimeout(res, 10000));
      }
    }
    
    console.log("\n✅ FINISHED BATCH PROCESSING ALL PROBLEMS!");
  }

  /**
   * Generates the highly structured prompt asking for JSON
   */
  private buildPrompt(problem: Problem): string {
    const jsonStructureExample = {
      is_signature_inaccurate: false,
      fixed_signature: {
        type: "function",
        function_signature: { 
          name: "exampleFunc", 
          return_type: "int",
          params: [{ name: "arg1", type: "int" }] 
        },
        class_signature: null
      },
      fixed_judging_policy: {
        comparator_mode: "strict",
        multi_answer: false,
        output_order: "any_order"
      },
      solutions: [
        {
          language: "python",
          approach_name: "Optimal Two Pointer",
          time_complexity: "O(N)",
          space_complexity: "O(1)",
          editorial_explanation: "First paragraph explains the brute force briefly. Second paragraph explains the optimal intuition...",
          code: "def exampleFunc(arg1):\n    return arg1"
        }
      ]
    };

    // Strip HTML from description to save thousands of input tokens
    const cleanDescription = problem.description?.replace(/<[^>]*>?/gm, '') || "No description provided.";

    return `
You are an expert competitive programmer and algorithmic engineer.
Review the following problem, its current signature, and its judging policy.

PROBLEM TITLE: ${problem.title}
PROBLEM DESCRIPTION: 
${cleanDescription}

CURRENT SIGNATURE:
${JSON.stringify({ func: problem.function_signature, cls: problem.class_signature }, null, 2)}

CURRENT JUDGING POLICY:
${JSON.stringify(problem.judging_policy || {}, null, 2)}

CRITICAL RULES:
1. Do NOT suggest changes to the problem title, description, hints, or any other fields.
2. ONLY evaluate the function/class signature and the judging policy.
3. For the 'language' field in your solutions, you MUST choose exactly ONE of the following valid strings: "java", "python", "c#", "cpp", or "js". Do NOT write "java | python...".

TASK 1: Verify the signature. If it is mathematically wrong, missing arguments, or inaccurate for the problem description, fix it according to the schema. Otherwise, return the existing one and set is_signature_inaccurate to false.
TASK 2: Verify the judging_policy. If the problem asks for "any order" (e.g. return arrays in any order) ensure output_order is "any_order".
TASK 3: Write optimal, production-ready solutions using 2 to 3 different algorithm approaches (e.g., Brute Force, Memoization, Optimal DP). 
For EACH approach, provide the full executable code. 
Ensure you provide detailed time/space complexity analysis and a thorough editorial explanation of the intuition.

CRITICAL INSTRUCTION: You MUST return your response as a raw, valid JSON object following the exact structure shown below. Replace the example values with your actual analysis and code. Do NOT wrap the JSON in markdown code blocks (\`\`\`json). Return purely the JSON text:
${JSON.stringify(jsonStructureExample, null, 2)}
`;
  }

  /**
   * Invokes Claude 3.5 Sonnet v2 through Amazon Bedrock
   */
  private async invokeClaudeOnBedrock(prompt: string): Promise<string | null> {
    try {
      const payload = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 4096, // Maximum output to ensure 3 solutions fit
        temperature: 0.1, // Low temperature for deterministic code
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      };

      const command = new InvokeModelCommand({
        modelId: BEDROCK_MODEL_ID,
        contentType: "application/json",
        accept: "application/json",
        body: JSON.stringify(payload)
      });

      const response = await this.bedrockClient.send(command);
      
      // Parse the Bedrock Uint8Array response
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      
      return responseBody.content[0].text;
    } catch (error: any) {
      console.error("AWS Bedrock API Error:", error.message);
      return null;
    }
  }
}
