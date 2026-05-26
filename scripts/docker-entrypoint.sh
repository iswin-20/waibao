#!/bin/sh
set -e

mkdir -p /app/data /app/public/uploads/wardrobe

echo "Applying database schema..."
npx prisma db push --skip-generate

echo "Starting Waibao app..."
exec "$@"
