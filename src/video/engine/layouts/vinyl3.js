/**
 * Vinyl — 3분할 LP (최초 구성).
 *
 * [사진 | 회전하는 원형 LP | 사진] + 하단 자막.
 * 기존 레이어들을 레이아웃 인터페이스에 맞춰 묶기만 한 얇은 래퍼다.
 */

import { drawBackground, drawVignette, drawBottomScrim } from '../layers/background.js';
import { drawSplitColumns } from '../layers/splitColumns.js';
import { drawVinyl } from '../layers/vinyl.js';
import { drawLyrics, drawInterlude } from '../layers/lyrics.js';
import { drawLightLeak } from '../layers/overlays.js';

export const drawVinyl3 = (ctx, scene, env, t) => {
  drawBackground(ctx, scene, env);
  drawSplitColumns(ctx, scene, env, t);
  drawLightLeak(ctx, scene, env, t);
  drawVignette(ctx, scene, env);
  drawVinyl(ctx, scene, env, t);

  const L = scene.project.lyrics;
  env.lyricAnchor = {
    cx: env.width / 2,
    baseY: env.height * (1 - L.bottomRatio),
    maxWidth: env.width * L.maxWidthRatio,
    size: Math.min(env.width, env.height) * L.fontSize,
    align: 'center',
  };

  if (L.enabled) {
    drawBottomScrim(ctx, env, 0.34, 0.72);
    drawLyrics(ctx, scene, env, t);
    drawInterlude(ctx, scene, env, t);
  }
};
