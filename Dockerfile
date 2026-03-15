# Stage 1: Build
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy only dependency files first (better caching)
COPY package*.json bun.lock ./

# Install dependencies with Bun
RUN bun install

# Copy source code
COPY . .

# Build NestJS app
RUN bun run build

# Stage 2: Production
FROM oven/bun:1 AS production

WORKDIR /app

# Copy only production dependencies
COPY package*.json bun.lock ./
RUN bun install --production

# Copy built app from builder
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3003

# Run the server
CMD ["node", "dist/main"]