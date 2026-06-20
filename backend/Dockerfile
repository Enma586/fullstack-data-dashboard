FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json tsconfig.json ./
COPY prisma/ ./prisma/

RUN npm ci

COPY src/ ./src/
COPY tests/ ./tests/

RUN npm run build

RUN npm prune --production

FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache bash

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package.json ./

EXPOSE 3000

CMD ["node", "dist/server.js"]
