FROM oven/bun:1

WORKDIR /app

# Install dependencies
COPY api/package.json api/bun.lock ./
RUN bun install --production

# Copy source code
COPY api/src ./src

# Expose application port (must match PORT env)
EXPOSE 3000

# Start Hono app with Bun
CMD ["bun", "run", "src/index.ts"]

