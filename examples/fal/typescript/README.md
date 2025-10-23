# FAL TypeScript Examples (x402/ACP compliant)

## Quick start
```bash
pnpm i # or npm/yarn
cp .env.example .env && edit .env
pnpm --filter ./examples/fal/typescript build
pnpm --filter ./examples/fal/typescript examples -- --slug <one-of-the-slugs-below>

Available example slugs
•fal-ai/flux-pro/kontext
•fal-ai/flux/dev/image-to-image
•fal-ai/flux-pro/v1.1-ultra
•fal-ai/recraft/v3/text-to-image
•fal-ai/kling-video/v2/master/image-to-video
•fal-ai/wan-effects
•fal-ai/kling-video/v2.5-turbo/pro/text-to-video
•fal-ai/veo3/fast
•bria/video/background-removal
•fal-ai/mmaudio-v2
•fal-ai/playai/tts/dialog
•fal-ai/minimax-music/v1.5

### File: `examples/fal/typescript/test/typecheck.test.ts`
```ts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';

describe('typecheck only', () => {
  it('generated files exist', () => {
    const base = path.resolve(__dirname, '../src/generated');
    assert.ok(fs.existsSync(base));
  });
});
```
