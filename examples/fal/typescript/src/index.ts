import 'dotenv/config';
import * as fal_ai__flux_pro__kontext from './generated/image-to-image/fal-ai__flux-pro__kontext.ts';
import * as fal_ai__flux__dev__image_to_image from './generated/image-to-image/fal-ai__flux__dev__image-to-image.ts';
import * as fal_ai__flux_pro__v1_1_ultra from './generated/text-to-image/fal-ai__flux-pro__v1.1-ultra.ts';
import * as fal_ai__recraft__v3__text_to_image from './generated/text-to-image/fal-ai__recraft__v3__text-to-image.ts';
import * as fal_ai__kling_video__v2__master__image_to_video from './generated/image-to-video/fal-ai__kling-video__v2__master__image-to-video.ts';
import * as fal_ai__wan_effects from './generated/image-to-video/fal-ai__wan-effects.ts';
import * as fal_ai__kling_video__v2_5_turbo__pro__text_to_video from './generated/text-to-video/fal-ai__kling-video__v2.5-turbo__pro__text-to-video.ts';
import * as fal_ai__veo3__fast from './generated/text-to-video/fal-ai__veo3__fast.ts';
import * as bria__video__background_removal from './generated/video-to-video/bria__video__background-removal.ts';
import * as fal_ai__mmaudio_v2 from './generated/video-to-video/fal-ai__mmaudio-v2.ts';
import * as fal_ai__playai__tts__dialog from './generated/text-to-audio/fal-ai__playai__tts__dialog.ts';
import * as fal_ai__minimax_music__v1_5 from './generated/text-to-audio/fal-ai__minimax-music__v1.5.ts';

type Runner = () => Promise<unknown>;

const registry = new Map<string, Runner>([
    ['fal-ai/flux-pro/kontext', () => fal_ai__flux_pro__kontext.run()], // image-to-image
    ['fal-ai/flux/dev/image-to-image', () => fal_ai__flux__dev__image_to_image.run()], // image-to-image
    ['fal-ai/flux-pro/v1.1-ultra', () => fal_ai__flux_pro__v1_1_ultra.run()], // text-to-image
    ['fal-ai/recraft/v3/text-to-image', () => fal_ai__recraft__v3__text_to_image.run()], // text-to-image
    ['fal-ai/kling-video/v2/master/image-to-video', () => fal_ai__kling_video__v2__master__image_to_video.run()], // image-to-video
    ['fal-ai/wan-effects', () => fal_ai__wan_effects.run()], // image-to-video
    ['fal-ai/kling-video/v2.5-turbo/pro/text-to-video', () => fal_ai__kling_video__v2_5_turbo__pro__text_to_video.run()], // text-to-video
    ['fal-ai/veo3/fast', () => fal_ai__veo3__fast.run()], // text-to-video
    ['bria/video/background-removal', () => bria__video__background_removal.run()], // video-to-video
    ['fal-ai/mmaudio-v2', () => fal_ai__mmaudio_v2.run()], // video-to-video
    ['fal-ai/playai/tts/dialog', () => fal_ai__playai__tts__dialog.run()], // text-to-audio
    ['fal-ai/minimax-music/v1.5', () => fal_ai__minimax_music__v1_5.run()] // text-to-audio
]);

function help() {
  console.log('Usage: ts-node src/index.ts --slug <slug>');
  console.log('Available slugs:');
  for (const [slug] of registry) {
    console.log('  -', slug);
  }
}

async function main() {
  const args = new Map<string, string>();
  for (let i=2; i<process.argv.length; i+=2) {
    args.set(process.argv[i], process.argv[i+1]);
  }
  const slug = args.get('--slug');
  if (!slug) {
    help();
    process.exit(1);
  }
  const run = registry.get(slug);
  if (!run) {
    console.error('Unknown slug:', slug);
    help();
    process.exit(1);
  }
  const result = await run();
  if (result !== undefined) {
    console.log(JSON.stringify(result, null, 2));
  }
}

if (import.meta.main) {
  void main();
}
