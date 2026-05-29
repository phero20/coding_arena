FROM oven/bun:1

WORKDIR /app

<<<<<<< HEAD
# Install dependencies
COPY api/package.json api/bun.lock ./
RUN bun install --production

# Copy source code
COPY api/src ./src

# Expose application port (must match PORT env)
EXPOSE 3000

# Start Hono app with Bun
CMD ["bun", "run", "src/index.ts"]

=======
# 1. Copy Monorepo configuration
COPY package.json bun.lock ./
COPY api/package.json ./api/
COPY driver/package.json ./driver/
COPY web/package.json ./web/

# 2. Install dependencies for the entire workspace
# (This ensures the @slavecode/driver link is created)
RUN bun install

# 3. Copy source code for both the API and the shared Driver
COPY api/src ./api/src
COPY driver ./driver
COPY data ./data

# 4. Final step: run from the API directory
WORKDIR /app/api
EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
>>>>>>> prod-deploy
