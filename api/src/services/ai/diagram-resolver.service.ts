import { DIAGRAM_ASSETS, type DiagramAsset } from "../../constants/diagram-assets";
import { type ICradle } from "../../libs/awilix-container";
import { redis } from "../../libs/core/redis";

export interface IDiagramResolverService {
  resolveIconId(input: string): Promise<string>;
}

export class DiagramResolverService implements IDiagramResolverService {
  private readonly assetsMap = new Map<string, DiagramAsset>();
  private readonly nameMap = new Map<string, DiagramAsset>();

  // Static common tech aliases mapping popular tech labels to correct catalog IDs
  private readonly techAliases: Record<string, string> = {
    // Databases
    postgres: "postgresql",
    postgresql: "postgresql",
    mysql: "mysql",
    mssql: "sqlserver",
    sql: "postgresql",
    database: "postgresql",
    db: "postgresql",
    dynamo: "aws-dynamodb",
    dynamodb: "aws-dynamodb",
    mongo: "mongodb",
    mongodb: "mongodb",
    cassandra: "cassandra",
    redis: "redis",
    memcached: "memcached",

    // Compute & Hosting
    node: "nodejs",
    nodejs: "nodejs",
    lambda: "aws-lambda",
    serverless: "aws-lambda",
    docker: "docker",
    k8s: "kubernetes",
    kubernetes: "kubernetes",
    ec2: "aws-ec2",
    vm: "aws-ec2",
    server: "linux",

    // Networking & Proxy
    nginx: "nginx",
    haproxy: "haproxy",
    envoy: "envoy",
    proxy: "nginx",
    loadbalancer: "aws-elb",
    lb: "aws-elb",
    dns: "aws-route53",
    route53: "aws-route53",
    apigateway: "aws-api-gateway",
    gateway: "aws-api-gateway",

    // Storage & Cloud Services
    s3: "aws-s3",
    storage: "aws-s3",
    bucket: "aws-s3",
    blob: "aws-s3",
    cloudfront: "aws-cloudfront",
    cdn: "aws-cloudfront",

    // Queues & Event Streaming
    kafka: "apache-kafka",
    rabbitmq: "rabbitmq",
    queue: "rabbitmq",
    mq: "rabbitmq",
    sqs: "aws-sqs",
    sns: "aws-sns",

    // Frontend & Web
    react: "react",
    vue: "vue",
    angular: "angular",
    nextjs: "nextjs",
    html: "html5",
    css: "css3",
    javascript: "javascript",
    typescript: "typescript",
  };

  constructor(cradle?: ICradle) {
    this.initializeMaps();
  }

  /**
   * Builds quick lookup indexes from the loaded DIAGRAM_ASSETS array
   */
  private initializeMaps() {
    for (const asset of DIAGRAM_ASSETS) {
      const lowerId = asset.id.toLowerCase();
      const lowerName = asset.name.toLowerCase();

      this.assetsMap.set(lowerId, asset);
      this.nameMap.set(lowerName, asset);
    }
  }

  /**
   * Resolves a dynamic input technology term to the perfect matched diagram asset ID
   * @param input Raw technology string (e.g. "postgres", "s3", "lambda")
   * @returns Resolved asset ID or a safe fallback ID
   */
  async resolveIconId(input: string): Promise<string> {
    if (!input) return "linux"; // default safe fallback

    const cleanInput = input.trim().toLowerCase();

    // 1. Direct Tech Alias Lookup
    if (this.techAliases[cleanInput]) {
      const aliasId = this.techAliases[cleanInput];
      if (this.assetsMap.has(aliasId)) {
        return aliasId;
      }
    }

    // 2. Direct ID Lookup
    if (this.assetsMap.has(cleanInput)) {
      return cleanInput;
    }

    // 3. Direct Name Lookup
    if (this.nameMap.has(cleanInput)) {
      const asset = this.nameMap.get(cleanInput);
      if (asset) return asset.id;
    }

    // 4. Redis Cache Lookup (for previously expensive string matching resolutions)
    const cacheKey = `ai:icon:resolve:${cleanInput}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) return cached;
    } catch (err) {
      // gracefully ignore redis errors
    }

    let resolvedId = "linux";
    let found = false;

    // 5. Substring Matching in IDs (e.g. "dynamodb" matches "aws-dynamodb")
    for (const asset of DIAGRAM_ASSETS) {
      const id = asset.id.toLowerCase();
      if (id.includes(cleanInput) || cleanInput.includes(id)) {
        resolvedId = asset.id;
        found = true;
        break;
      }
    }

    // 6. Substring Matching in Names
    if (!found) {
      for (const asset of DIAGRAM_ASSETS) {
        const name = asset.name.toLowerCase();
        if (name.includes(cleanInput) || cleanInput.includes(name)) {
          resolvedId = asset.id;
          found = true;
          break;
        }
      }
    }

    // 7. Category-Based Graceful Fallbacks
    if (!found) {
      if (cleanInput.includes("db") || cleanInput.includes("sql") || cleanInput.includes("data")) {
        resolvedId = "postgresql";
      } else if (cleanInput.includes("cache") || cleanInput.includes("mem")) {
        resolvedId = "redis";
      } else if (cleanInput.includes("queue") || cleanInput.includes("stream") || cleanInput.includes("event")) {
        resolvedId = "rabbitmq";
      } else if (cleanInput.includes("auth") || cleanInput.includes("login") || cleanInput.includes("token")) {
        resolvedId = "keycloak";
      }
    }

    // Save the expensive resolution to Redis for 7 days
    try {
      await redis.set(cacheKey, resolvedId, "EX", 86400 * 7);
    } catch (err) {
      // gracefully ignore
    }

    // 8. Return resolved or general standard fallback ("linux")
    return resolvedId;
  }
}
