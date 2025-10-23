# WZRDTech TypeScript Examples (x402/ACP compliant)

## Quick start
```bash
pnpm i # or npm/yarn
cp .env.example .env && edit .env
pnpm --filter ./examples/wzrdtech/typescript build
pnpm --filter ./examples/wzrdtech/typescript examples -- --slug <one-of-the-slugs-below>

Available example slugs
- fal-ai/flux-pro/kontext
- fal-ai/flux/dev/image-to-image
- fal-ai/flux-pro/v1.1-ultra
- fal-ai/recraft/v3/text-to-image
- fal-ai/kling-video/v2/master/image-to-video
- fal-ai/wan-effects
- fal-ai/kling-video/v2.5-turbo/pro/text-to-video
- fal-ai/veo3/fast
- fal-ai/wan-pro/image-to-video
- fal-ai/veo2/image-to-video
- fal-ai/kling-video/v1.6/pro/image-to-video
- fal-ai/minimax/video-01/image-to-video
- fal-ai/wan-25-preview/image-to-video
- fal-ai/kling-video/v2.5-turbo/pro/image-to-video
- fal-ai/flux-krea-trainer
- fal-ai/flux-kontext-trainer
- fal-ai/minimax/hailuo-02/standard/image-to-video
- fal-ai/minimax/hailuo-02/standard/text-to-video
- bria/text-to-image/3.2
- fal-ai/bytedance/seedance/v1/pro/image-to-video
- fal-ai/imagen4/preview/fast
- fal-ai/veo3
- fal-ai/kling-video/v2.1/master/image-to-video
- fal-ai/kling-video/v2.1/image-to-video
- fal-ai/imagen4
- fal-ai/kling-video/v2.0/master/text-to-video
- fal-ai/hidream/i1/full
- fal-ai/hidream/i1/dev
- bria/video/background-removal
- fal-ai/mmaudio-v2
- fal-ai/playai/tts/dialog
- fal-ai/minimax-music/v1.5

### File: `examples/wzrdtech/typescript/test/typecheck.test.ts`
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
