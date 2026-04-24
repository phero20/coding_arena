import { config } from "../configs/env";
import { metrics } from "../libs/metrics";

export interface GroqJsonResponse<T> {
  data: T;
  raw: unknown;
}

/**
 * Thin client around Groq's OpenAI-compatible chat completions API.
 *
 * This service is intentionally generic: it knows nothing about problems or test
 * cases. Higher-level services should handle prompt design and type-checking.
 */
export class GroqLlmService {
  private readonly apiKey = config.groqApiKey;
  private readonly baseUrl = "https://api.groq.com/openai/v1";
  private readonly model = "llama-3.3-70b-versatile";

  private ensureConfigured() {
    if (!this.apiKey) {
      throw new Error("GROQ_API_KEY is not configured");
    }
  }

  /**
   * Calls Groq with a system + user prompt and expects a single JSON object back.
   *
   * The caller is responsible for providing clear instructions so the model
   * returns valid JSON matching the expected TypeScript shape.
   */
  async generateJson<T>(opts: {
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
    model?: string;
    maxTokens?: number;
  }): Promise<GroqJsonResponse<T>> {
    this.ensureConfigured();

    const body = {
      model: opts.model ?? this.model,
      messages: [
        { role: "system", content: opts.systemPrompt },
        { role: "user", content: opts.userPrompt },
      ],
      temperature: opts.temperature ?? 0,
      max_tokens: opts.maxTokens ?? 2048, 
      response_format: { type: "json_object" },
    };

    const startTime = Date.now();
    
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const duration = Date.now() - startTime;
    metrics.recordLlmLatency(duration);

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(
        `Groq request failed with status ${response.status}: ${errText}`,
      );
    }

    const json = (await response.json()) as any;
    const content = json.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Groq response did not contain any content");
    }

    try {
      // In JSON mode, the model should return a valid JSON string.
      const parsed = JSON.parse(content) as T;
      return {
        data: parsed,
        raw: json,
      };
    } catch (err) {
      console.error("Failed to parse Groq JSON content:", content);
      throw new Error(
        "Groq returned invalid JSON despite JSON mode being enabled",
      );
    }
  }
}
