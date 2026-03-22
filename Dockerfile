# Stage 1: Build
FROM oven/bun:1 AS builder

WORKDIR /app

# Copy dependency files AND the Prisma schema/config files first
COPY package*.json bun.lock ./
COPY src/prisma ./src/prisma
COPY prisma.config.ts ./prisma.config.ts

# Install dependencies (this will automatically trigger `prisma generate`)
RUN bun install

# Copy the rest of the source code
COPY . .

# Build the NestJS app
RUN bun run build

# Stage 2: Production
FROM oven/bun:1 AS production

WORKDIR /app

# Copy dependency files
COPY package*.json bun.lock ./

# Copy Prisma schema and config to the production stage
COPY --from=builder /app/src/prisma ./src/prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Install ONLY production dependencies
RUN bun install --production

# Explicitly generate the Prisma client for production 
RUN bunx prisma generate --schema=./src/prisma/schema.prisma

# Copy the built app from the builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3003

# Run the server using Bun natively
CMD ["bun", "dist/src/main.js"] 