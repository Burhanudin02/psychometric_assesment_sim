#!/bin/sh
set -e

echo "[Entrypoint] Waiting for PostgreSQL to be available at db:5432..."
until nc -z db 5432; do
  sleep 1
done
echo "[Entrypoint] PostgreSQL is up and accepting connections."

echo "[Entrypoint] Applying Prisma database schema..."
npx prisma db push --accept-data-loss

echo "[Entrypoint] Seeding database with original questions and 21-module curriculum..."
npx tsx prisma/seed.ts

echo "[Entrypoint] Starting Next.js server on port 3000..."
exec npm start
