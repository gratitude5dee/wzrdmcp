# Local Development Setup

## Prerequisites

- Node.js 18+
- npm 9+
- Optional: Docker 24+ for containerized workflows

## Installation

```bash
npm install
cp .env.example .env
```

Update `.env` with merchant/PSP credentials and secrets. At minimum provide:

- `MERCHANT_BASE_URL`
- `MERCHANT_API_KEY`
- `PSP_BASE_URL`
- `PSP_API_KEY`
- `ALLOWED_API_KEYS`
- `SIGNATURE_SECRET`

## Running the Server

```bash
npm run dev
```

The server listens on `http://localhost:3112`. SSE clients connect via `GET /mcp` followed by `POST /messages?sessionId=<id>`.

## Quality Checks

```bash
npm run typecheck
npm run test:unit
npm run test:integration
npm run test:coverage
```

## Docker Workflow

```bash
docker compose up --build
```

This starts the MCP server alongside mock merchant and PSP services.
