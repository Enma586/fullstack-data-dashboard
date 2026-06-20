# =============================================================================
# Dockerfile — Construcción multi-stage del backend Olist Dashboard
#
# Stage 1 (builder):
#   - Instala dependencias (npm ci)
#   - Compila TypeScript a JavaScript (tsc)
#   - Copia manualmente archivos .sql al output (no son compilados por tsc)
#   - Elimina devDependencies (npm prune --production)
#
# Stage 2 (runner):
#   - Imagen final mínima con Node.js 20 Alpine + bash + postgresql-client
#   - Copia solo node_modules, dist, prisma, package.json y .env desde builder
#   - Expone puerto 3000
#   - Comando por defecto: node dist/server.js
# =============================================================================

FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
COPY prisma/ ./prisma/

RUN npm ci

COPY src/ ./src/
COPY tests/ ./tests/

RUN npm run build

# Los archivos .sql no son compilados por tsc; se copian manualmente al output
RUN cp -r src/infrastructure/etl/sql dist/infrastructure/etl/sql

RUN npm prune --production

FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache bash postgresql-client

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./
COPY .env.example ./.env

EXPOSE 3000

CMD ["node", "dist/server.js"]
