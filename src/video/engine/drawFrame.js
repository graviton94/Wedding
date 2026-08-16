/**
 * 프레임 합성기 — 엔진의 단일 진입점.
 *
 * drawFrame()은 순수 함수처럼 동작한다: 같은 (scene, t)면 항상 같은 픽셀.
 * 브라우저 미리보기와 Node MP4 렌더러가 이 함수 하나를 공유하므로
 * "스튜디오에서 본 화면 = 최종 mp4"가 성립한다.
 *
 * env 계약:
 *   { width, height, createCanvas(w,h), getImage(src) -> image|null }
 *   getImage은 동기 함수여야 한다 (사전 로딩된 이미지 캐시 조회).
 */

import { photoStateAt } from './timeline.js';
import { drawBackground, drawVignette, drawBottomScrim } from './layers/background.js';
import { drawSplitColumns } from './layers/splitColumns.js';
import { drawVinyl } from './layers/vinyl.js';
import { drawLyrics, drawInterlude } from './layers/lyrics.js';
import {
  drawBokeh, drawGrain, drawIntro, drawLetterbox, drawLightLeak,
  drawMasterFade, drawOutro, drawProgressBar, drawWatermark,
} from './layers/overlays.js';

/**
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} scene  buildScene()의 결과
 * @param {object} env    { width, height, createCanvas, getImage }
 * @param {number} t      영상 시작 기준 경과 초
 */
export const drawFrame = (ctx, scene, env, t) => {
  const time = Math.max(0, Math.min(t, scene.total));

  // 이 프레임의 사진 상태를 한 번만 계산해 모든 레이어가 공유한다
  env.photoState = photoStateAt(scene.timeline, scene.project, time);

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.filter = 'none';

  // 뒤 → 앞 순서
  drawBackground(ctx, scene, env);
  // 3분할 좌/우 컬럼이 배경 위를 덮는다 (중앙은 블러 배경이 그대로 보인다)
  drawSplitColumns(ctx, scene, env, time);
  drawLightLeak(ctx, scene, env, time);
  drawVignette(ctx, scene, env);
  drawVinyl(ctx, scene, env, time);
  drawBokeh(ctx, scene, env, time);

  if (scene.project.lyrics.enabled) {
    drawBottomScrim(ctx, env, 0.34, 0.72);
    drawLyrics(ctx, scene, env, time);
    drawInterlude(ctx, scene, env, time);
  }

  drawIntro(ctx, scene, env, time);
  drawOutro(ctx, scene, env, time);
  drawWatermark(ctx, scene, env);
  drawProgressBar(ctx, scene, env, time);
  drawGrain(ctx, scene, env, time);
  drawLetterbox(ctx, scene, env);
  drawMasterFade(ctx, scene, env, time);

  ctx.restore();
};

/** 지정 시각에 필요한 이미지 src 목록 — 렌더러가 미리 로딩할 때 사용 */
export const requiredSources = (scene) => {
  const set = new Set();
  for (const slot of scene.timeline.slots) set.add(slot.src);
  return [...set];
};
