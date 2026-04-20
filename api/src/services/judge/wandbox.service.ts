import { createLogger } from "../../libs/utils/logger";
import {
  WandboxCompiler,
  WandboxExecutePayload,
  WandboxExecuteResult,
} from "../../types/compiler/wandbox.types";

const logger = createLogger("wandbox-service");

/**
 * WandboxService handles low-level HTTP interaction with the Wandbox API.
 */
export class WandboxService {
  private readonly baseUrl = "https://wandbox.org/api";

  /**
   * Fetches the list of available compilers from Wandbox.
   */
  async getCompilers(): Promise<WandboxCompiler[]> {
    const url = `${this.baseUrl}/list.json`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Wandbox API failed: ${response.statusText}`);
      }
      return (await response.json()) as WandboxCompiler[];
    } catch (err) {
      logger.error({ err }, "Failed to fetch compiler list from Wandbox");
      throw err;
    }
  }

  /**
   * Sends code execution request to Wandbox.
   */
  async compile(payload: WandboxExecutePayload): Promise<WandboxExecuteResult> {
    const url = `${this.baseUrl}/compile.json`;
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Wandbox execution failed: ${response.statusText}`);
      }

      return (await response.json()) as WandboxExecuteResult;
    } catch (err) {
      logger.error({ err, compiler: payload.compiler }, "Wandbox execution error");
      throw err;
    }
  }
}
