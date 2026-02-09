# Frontend Dockerfile for Hugging Face Spaces

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

# Build-time environment variables (NEXT_PUBLIC_* must be set at build time)
# These are hardcoded for Hugging Face deployment
ENV NEXT_PUBLIC_API_URL=https://zeeshan353-todo-backend.hf.space
ENV NEXT_PUBLIC_BETTER_AUTH_URL=https://zeeshan353-todo-frontend.hf.space
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=7860

# Runtime environment variables will be provided by HF Spaces secrets
# DATABASE_URL and BETTER_AUTH_SECRET are read at runtime

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 7860

CMD ["node", "server.js"]
