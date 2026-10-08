# Stage 1: Build stage
FROM oven/bun:1.2-alpine AS builder

WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run check && bun run build

# Stage 2: Production runner
FROM oven/bun:1.2-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

COPY package.json bun.lock ./
RUN bun install --production --frozen-lockfile

COPY --from=builder /app/build ./build
COPY --from=builder /app/.nodely-published.json ./.nodely-published.json

EXPOSE 3000

CMD ["bun", "./build/index.js"]
