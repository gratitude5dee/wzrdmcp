/**
 * Model: MiniMax Hailuo 02 [Standard] (Text to Video) | Slug: fal-ai/minimax/hailuo-02/standard/text-to-video | Category: text-to-video | https://fal.ai/models/fal-ai/minimax/hailuo-02/standard/text-to-video
 * Text-to-video generation with Hailuo 02 (Standard), emphasizing narrative motion and scene coherence.
 */
import 'dotenv/config';
import { fal } from '@fal-ai/client';

if (!process.env.FAL_KEY) {
  throw new Error('Missing FAL_KEY. Copy .env.example to .env and set your key.');
}
fal.config({ credentials: process.env.FAL_KEY! });

interface Input {
  prompt: string;
}
type Output = unknown;

export async function run(customInput?: Partial<Input>) {
  const input: Input = {
    prompt: "A beautiful sunset over the mountains",
    ...customInput
  } as Input;

  try {
    const result: { data: Output } = await fal.subscribe('fal-ai/minimax/hailuo-02/standard/text-to-video', { input });
    console.log(result.data);
    return result.data;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('FAL example failed:', message);
    throw err;
  }
}

async function main() {
  await run();
}
if (import.meta.main) { void main(); }
