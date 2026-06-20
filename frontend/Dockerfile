# =============================================================================
# Dockerfile — Construcción multi-stage del frontend Olist Dashboard (Next.js)
#
# Stage 1 (deps):
#   - Instala dependencias con npm install
# Stage 2 (builder):
#   - Construye la aplicación Next.js (next build)
# Stage 3 (runner):
#   - Imagen final mínima con Node.js 20 Alpine
#   - Copia el output standalone generado por Next.js
#   - Expone puerto 5173
#   - Comando por defecto: node server.js
# =============================================================================

FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json ./
RUN npm install

FROM node:20-alpine AS builder

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

WORKDIR /app

COPY package.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY public/ ./public/
COPY src/ ./src/
COPY next.config.mjs tsconfig.json ./

RUN npm run build

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 5173

ENV PORT=5173
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
