# ========================
# STAGE 1 - BUILD
# ========================
FROM node:20 AS builder

WORKDIR /app

# Dependências
COPY package*.json ./
RUN npm install

# Copia TODO o projeto (ESSENCIAL)
COPY . .

# Build (se for Next.js)
RUN npm run build || echo "No build step"

# ========================
# STAGE 2 - RUN
# ========================
FROM node:20-alpine

WORKDIR /app

# Copia TUDO do builder
COPY --from=builder /app ./

# Prisma precisa disso
RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "start"]