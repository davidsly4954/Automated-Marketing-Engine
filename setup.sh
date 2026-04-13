#!/bin/bash
# Automated Marketing Engine — Quick Setup
# Generates .env and config.js from templates with secure random keys

set -e

echo "=== Automated Marketing Engine Setup ==="
echo ""

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Error: Docker is not installed. Install it from https://docs.docker.com/get-docker/"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "Error: Node.js is not installed. Install v18+ from https://nodejs.org/"; exit 1; }

NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "Error: Node.js 18+ required (found v$(node -v))"
  exit 1
fi

# Create .env if it doesn't exist
if [ -f .env ]; then
  echo ".env already exists — skipping (delete it and re-run to regenerate)"
else
  POSTGRES_PASSWORD=$(openssl rand -hex 16)
  N8N_ENCRYPTION_KEY=$(openssl rand -hex 16)

  sed "s/^POSTGRES_PASSWORD=$/POSTGRES_PASSWORD=$POSTGRES_PASSWORD/" .env.example | \
  sed "s/^N8N_ENCRYPTION_KEY=$/N8N_ENCRYPTION_KEY=$N8N_ENCRYPTION_KEY/" > .env

  echo "Created .env with secure random keys"
fi

# Create config.js if it doesn't exist
if [ -f config.js ]; then
  echo "config.js already exists — skipping"
else
  cp config.example.js config.js
  echo "Created config.js — edit it with your brand details"
fi

echo ""
echo "=== Next steps ==="
echo "1. Edit config.js with your company name, blog URL, and niche"
echo "2. Run: docker compose up -d"
echo "3. Run: node n8n/scripts/build-workflow.js"
echo "4. Open http://localhost:5678 and import n8n/workflows/content-repurposing-pipeline.json"
echo "5. Add your ANTHROPIC_API_KEY to .env and run: docker compose restart"
echo ""
