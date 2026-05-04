# =========================
# BUILD STAGE
# =========================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# gerar prisma client
RUN npx prisma generate

# build do Next.js
RUN npm run build

# =========================
# RUNTIME STAGE
# =========================
FROM node:20-alpine

WORKDIR /app

# copiar somente o necessário
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

ENV NODE_ENV=production

EXPOSE 3000

# 🔥 roda migração + seed antes de subir app
CMD sh -c "npx prisma db push && npx prisma db seed && node server.js"