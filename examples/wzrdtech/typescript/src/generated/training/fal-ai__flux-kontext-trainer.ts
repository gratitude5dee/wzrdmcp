/**
 * Model: Flux Kontext Trainer | Slug: fal-ai/flux-kontext-trainer | Category: training | https://fal.ai/models/fal-ai/flux-kontext-trainer
 * Train a Kontext-flavored Flux adapter for style-consistent image transformations.
 */
import 'dotenv/config';
import { fal } from '@fal-ai/client';

if (!process.env.FAL_KEY) {
  throw new Error('Missing FAL_KEY. Copy .env.example to .env and set your key.');
}
fal.config({ credentials: process.env.FAL_KEY! });

type Input = Record<string, unknown>;
type Output = unknown;

export async function run(customInput?: Partial<Input>) {
  const input: Input = {
    ...customInput
  } as Input;

  try {
    const result: { data: Output } = await fal.subscribe('fal-ai/flux-kontext-trainer', { input });
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
