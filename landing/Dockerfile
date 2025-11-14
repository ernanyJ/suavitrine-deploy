# Usar imagem oficial Node.js leve
FROM node:20-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json (ou pnpm-lock.yaml)
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar todo o restante do projeto
COPY . .

# Build do Next.js
RUN npm run build

# ---- Stage final mais leve ----
FROM node:20-alpine AS runner
WORKDIR /app

# Copiar apenas o build e node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

# Rodar o Next.js
CMD ["npm", "start"]