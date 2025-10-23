# FAL TypeScript Examples — x402/ACP Compliant

Production-ready TypeScript examples for running FAL (fal.ai) models inside an existing repo, built to x402 (repo hygiene, determinism, type safety) and ACP (access control, secrets, logging) standards.
This package is self-contained under `examples/fal/typescript/` and **never** hardcodes secrets.

## Why this exists
- **Fast onboarding:** working, minimal examples you can run immediately.
- **Deterministic codegen:** stable paths and filenames; idempotent updates.
- **Enterprise guardrails:** environment-first key handling, least-privilege networking, minimal logs.

---

## Quick start
```bash
pnpm i # (or npm/yarn)
cp examples/fal/typescript/.env.example examples/fal/typescript/.env
# Put your FAL key in .env (FAL_KEY=...)
pnpm --filter ./examples/fal/typescript build
pnpm --filter ./examples/fal/typescript examples -- --slug <see list below>
```

### Available slugs
Run the CLI without args for a live list:

```bash
pnpm --filter ./examples/fal/typescript examples
```

---

## Project layout

```
examples/
  fal/
    typescript/
      README.md                 # <— this file
      tsconfig.json
      package.json
      .env.example
      src/
        index.ts                # CLI for running examples by slug
        generated/              # Hand-curated example files (no CSV parsing)
          <category>/
            <slug>.ts
      test/
        typecheck.test.ts       # CI-friendly: ensures examples compile
tools/
  data/
    fal_models_with_examples.csv  # (Optional) reference source, not parsed by code
```

---

## Running examples

```bash
pnpm --filter ./examples/fal/typescript examples -- --slug fal-ai/flux-pro/kontext
```

Pass overrides as JSON via env (no code edits required):

```bash
FAL_INPUT='{"prompt":"make it cinematic"}' \
pnpm --filter ./examples/fal/typescript examples -- --slug fal-ai/imagen4
```

The runtime merges FAL_INPUT (if present) into the example's default input.

---

## Security & Compliance (ACP)
- **Secrets:** All credentials must come from env (FAL_KEY). Never commit real keys.
- **Logging:** Logs omit keys and redact query parameters; set DEBUG=1 for verbose traces locally.
- **Networking:** Examples make outbound calls only to FAL endpoints required by the selected slug.
- **Local env:** .env is gitignored; .env.example documents required variables.

---

## Engineering Standards (x402)
- **Determinism:** Stable file names, import paths, and generation inputs.
- **Type safety:** Prefer unknown + narrowing; avoid any.
- **Idempotence:** Re-running generation or "batch" add prompts should be a no-op unless content changes.
- **Boundaries:** Examples may not modify code outside examples/fal/typescript.

---

## Instrumentation hooks (WZRDMCP)

If you run a transaction meter on WZRDMCP, wire it here (opt-in):

```typescript
// examples/fal/typescript/src/telemetry.ts
export function recordTransaction(event: {
  slug: string;
  category: string;
  status: 'ok' | 'error';
  latency_ms?: number;
}) {
  // Replace with your MCP emitter; must be non-blocking and best-effort.
  // Example: postMessage to a local agent, fire-and-forget HTTP, or file append in CI.
}
```

Update each example's run() to call:

```typescript
import { recordTransaction } from '../telemetry';

// ...
const start = Date.now();
try {
  const result = await fal.subscribe('<slug>', { input });
  recordTransaction({ slug: '<slug>', category: '<category>', status: 'ok', latency_ms: Date.now()-start });
  return result.data;
} catch (err) {
  recordTransaction({ slug: '<slug>', category: '<category>', status: 'error', latency_ms: Date.now()-start });
  throw err;
}
```

**Transaction definition (for WZRDMCP):**

A "transaction" = a successful or failed call that reaches the model endpoint (one fal.subscribe request).

---

## CI recommendations

```bash
# Compile only (no network)
pnpm --filter ./examples/fal/typescript typecheck

# Optional smoke test (requires key and network; run nightly)
RUN_FAL_EXAMPLES=true \
pnpm --filter ./examples/fal/typescript examples -- --slug fal-ai/imagen4
```

---

## Contributing
- Keep generated files ≤ 300 lines; wrap at 100 cols.
- Document any new slug at the top of the file (name, category, URL).
- Add a corresponding entry to src/index.ts and verify the CLI lists it.

---

## Troubleshooting
- **Missing FAL_KEY:** Ensure .env exists and is populated.
- **ESM issues:** Node ≥ 18 is required; package is "type": "module".
- **Rate limits:** Back off exponentially or re-run with a different slug.
