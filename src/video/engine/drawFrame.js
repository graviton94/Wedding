/**
 * 프레임 합성기 — 엔진의 단일 진입점.
 *
 * drawFrame()은 순수 함수처럼 동작한다: 같은 (scene, t)면 항상 같은 픽셀.
 * 브라우저 미리보기와 Node MP4 렌더러가 이 함수 하나를 공유하므로
 * "스튜디오에서 본 화면 = 최종 mp4"가 성립한다.
 *
 * 구조는 두 층이다.
 *   1. 레이아웃 (layouts/) — 사진과 가사가 화면에 앉는 방식. 안마다 완전히 다르다.
 *   2. 공통 오버레이      — 보케·그레인·타이틀·페이드. 어느 레이아웃에나 똑같이 얹힌다.
 *
 * env 계약:
 *   { width, height, createCanvas(w,h), getImage(src) -> image|null }
 *   getImage은 동기 함수여야 한다 (사전 로딩된 이미지 캐시 조회).
 */

import { photoStateAt } from './timeline.js';
import { drawLayout } from './layouts/index.js';
import {
  drawBokeh, drawGrain, drawIntro, drawLetterbox,
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

  // 이 프레임의 사진 상태를 한 번만 계산해 모든 레이어가 공유한다.
  // env.time은 슬롯별 팬 위치를 따로 계산할 때 쓴다.
  env.time = time;
  env.photoState = photoStateAt(scene.timeline, scene.project, time);

  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.filter = 'none';

  // ── 1. 레이아웃 ──
  drawLayout(ctx, scene, env, time);

  // ── 2. 공통 오버레이 ──
  drawBokeh(ctx, scene, env, time);
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
  if (scene.project.vinyl?.photo) set.add(scene.project.vinyl.photo);
  return [...set];
};
