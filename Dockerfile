FROM node:20-bookworm-slim AS base

RUN apt-get update && apt-get install -y openssl netcat-openbsd curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

RUN chmod +x ./scripts/docker-entrypoint.sh 2>/dev/null || true

CMD ["npm", "start"]
