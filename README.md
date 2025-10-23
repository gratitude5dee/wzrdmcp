# ACP Commerce MCP Server

A production-ready Model Context Protocol (MCP) server that implements the x402 protocol (version 2025-09-29) and the Agentic Commerce Protocol (ACP). The server enables AI agents to perform commerce operations through a standardized, type-safe interface built on Node.js, TypeScript, and Express.

## Key Features

- Full compliance with x402 request/response header requirements
- ACP-compliant flat response and error structures
- SSE-based MCP transport with session-aware tooling
- Merchant session, product feed/search, and payment orchestration services
- Idempotency, rate limiting, signature validation, and structured logging
- Comprehensive unit, integration, and compliance tests
- Dockerized deployment with GitHub Actions CI pipeline

## Getting Started

```bash
npm install
npm run build
npm start
```

During development you can run the server with live reload:

```bash
npm run dev
```

Run quality checks:

```bash
npm run typecheck
npm run test:unit
npm run test:integration
npm run test:coverage
```

## Repository Structure

```
src/
  index.ts
  types/
  services/
  tools/
  routes/
  middleware/
  utils/
docs/
  API.md
  MCP_TOOLS.md
  SETUP.md
  DEPLOYMENT.md
  TROUBLESHOOTING.md
```

For detailed setup and usage instructions, see [docs/SETUP.md](docs/SETUP.md).
