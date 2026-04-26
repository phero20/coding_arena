import { createLogger } from "../../libs/utils/logger";
import { config } from "../../configs/env";

const logger = createLogger("clist-service");

/**
 * ClistService handles low-level HTTP interaction with the CLIST.by API.
 */
export class ClistService {
  private readonly baseUrl = "https://clist.by/api/v1";
  private readonly username = config.clistUsername;
  private readonly apiKey = config.clistApiKey;

  /**
   * Fetches the raw list of contests from CLIST.
   * @param limit Maximum number of contests to fetch.
   * @param offset Offset for pagination.
   */
  async getContests(limit: number = 20, offset: number = 0, startUntil?: Date): Promise<any> {
    if (!this.username || !this.apiKey) {
      logger.error("CLIST credentials are not set in environment variables");
      throw new Error("CLIST API configuration missing");
    }

    // Example URL: https://clist.by/api/v1/contest/?username=YOUR_USERNAME&api_key=YOUR_API_KEY&limit=10&order_by=-start
    const url = new URL(`${this.baseUrl}/contest/`);
    url.searchParams.append("username", this.username);
    url.searchParams.append("api_key", this.apiKey);
    url.searchParams.append("limit", limit.toString());
    url.searchParams.append("offset", offset.toString());
    
    // Sort ascending (soonest first) and only fetch contests from right now onward
    const now = new Date().toISOString();
    url.searchParams.append("order_by", "start");
    url.searchParams.append("start__gte", now);

    if (startUntil) {
      url.searchParams.append("start__lte", startUntil.toISOString());
    }

    try {
      logger.info({ url: url.origin + url.pathname, limit, offset }, "Fetching contests from CLIST");
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        const errorText = await response.text();
        logger.error({ status: response.status, errorText }, "CLIST API request failed");
        throw new Error(`CLIST API failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      logger.error({ err }, "Failed to fetch contests from CLIST");
      throw err;
    }
  }
}
