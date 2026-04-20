import { createLogger } from "../utils/logger";

const logger = createLogger("metrics");

/**
 * Lightweight Metrics Collector (Prometheus-style)
 *
 * Tracks system health, AI performance, and submission trends in memory.
 * Provides structured summaries for logging and monitoring.
 */
class MetricsCollector {
  private static instance: MetricsCollector;

  // Latency metrics (ms)
  private llmLatencies: number[] = [];
  private readonly MAX_LATENCY_SAMPLES = 100;

  // Verdict counters
  private verdictCounts: Record<string, number> = {
    ACCEPTED: 0,
    WRONG_ANSWER: 0,
    COMPILE_ERROR: 0,
    RUNTIME_ERROR: 0,
    TIME_LIMIT_EXCEEDED: 0,
    MEMORY_LIMIT_EXCEEDED: 0,
    SYSTEM_ERROR: 0,
    TOTAL: 0,
  };

  private constructor() {}

  public static getInstance(): MetricsCollector {
    if (!MetricsCollector.instance) {
      MetricsCollector.instance = new MetricsCollector();
    }
    return MetricsCollector.instance;
  }

  /**
   * Records a new AI judge latency sample.
   */
  public recordLlmLatency(ms: number) {
    this.llmLatencies.push(ms);
    if (this.llmLatencies.length > this.MAX_LATENCY_SAMPLES) {
      this.llmLatencies.shift();
    }
  }

  /**
   * Records a submission verdict status.
   */
  public recordVerdict(status: string) {
    const key = status.toUpperCase();
    this.verdictCounts[key] = (this.verdictCounts[key] || 0) + 1;
    this.verdictCounts.TOTAL++;
  }

  /**
   * Returns a snapshot of current system health metrics.
   */
  public getSummary() {
    const latencies = this.llmLatencies;
    const avgLatency =
      latencies.length > 0
        ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
        : 0;

    const p95Latency =
      latencies.length > 0
        ? [...latencies].sort((a, b) => a - b)[
            Math.floor(latencies.length * 0.95)
          ]
        : 0;

    return {
      ai_judge: {
        avg_latency_ms: avgLatency,
        p95_latency_ms: p95Latency,
        samples: latencies.length,
      },
      submissions: {
        ...this.verdictCounts,
        success_rate: this.calculateSuccessRate(),
      },
    };
  }

  private calculateSuccessRate(): string {
    if (this.verdictCounts.TOTAL === 0) return "0%";
    const rate = (this.verdictCounts.ACCEPTED / this.verdictCounts.TOTAL) * 100;
    return `${rate.toFixed(1)}%`;
  }

  /**
   * Logs a structured system health summary.
   */
  public logHealthReport() {
    const summary = this.getSummary();
    logger.info(summary, "System Health Report 📊");
  }
}

export const metrics = MetricsCollector.getInstance();
