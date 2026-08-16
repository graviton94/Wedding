/**
 * 배경 레이어 — 현재 사진을 화면 가득 블러 처리 + 켄번즈 확대 + 컬러 그레이딩.
 * 사진 전환 시 다음 사진과 크로스페이드된다.
 */

import { drawCover, rgba, clamp } from '../util.js';

/**
 * 블러는 ctx.filter 대신 "축소 → 확대" 방식으로 낸다.
 * 이유: filter='blur(46px)'는 4K에서 프레임당 수십 ms를 먹고,
 *       브라우저/Skia 구현 차이로 미리보기와 최종물이 미세하게 달라진다.
 *       다운스케일 방식은 두 환경에서 픽셀 단위로 동일하고 훨씬 빠르다.
 */
const blurCanvasCache = new WeakMap();

const getScratch = (ctx, key, w, h, createCanvas) => {
  let store = blurCanvasCache.get(ctx);
  if (!store) {
    store = {};
    blurCanvasCache.set(ctx, store);
  }
  const entry = store[key];
  if (entry && entry.canvas.width === w && entry.canvas.height === h) return entry;
  const canvas = createCanvas(w, h);
  const created = { canvas, ctx: canvas.getContext('2d') };
  store[key] = created;
  return created;
};

/**
 * @param {object} env  { createCanvas } — 환경별 오프스크린 캔버스 팩토리
 */
export const drawBackground = (ctx, scene, env) => {
  const { project } = scene;
  const bg = project.background;
  const { width: W, height: H } = env;

  ctx.save();
  ctx.fillStyle = project.theme.bg;
  ctx.fillRect(0, 0, W, H);

  if (!bg.enabled) {
    ctx.restore();
    return;
  }

  const state = env.photoState;
  const imgA = env.getImage(state.current?.src);
  const imgB = state.next ? env.getImage(state.next.src) : null;

  // 블러 강도를 축소 배율로 환산: blur 46px ≈ 1/23 크기로 줄였다가 다시 키우기
  const divisor = clamp(bg.blur / 2, 1, 64);
  const bw = Math.max(8, Math.round(W / divisor));
  const bh = Math.max(8, Math.round(H / divisor));
  const scratch = getScratch(ctx, 'bgblur', bw, bh, env.createCanvas);
  const sctx = scratch.ctx;

  sctx.clearRect(0, 0, bw, bh);
  if (imgA) {
    sctx.globalAlpha = 1;
    drawCover(sctx, imgA, 0, 0, bw, bh, state.current.photo.focusX ?? 0.5, state.current.photo.focusY ?? 0.5);
  }
  if (imgB && state.mix > 0) {
    sctx.globalAlpha = state.mix;
    drawCover(sctx, imgB, 0, 0, bw, bh, state.next.photo.focusX ?? 0.5, state.next.photo.focusY ?? 0.5);
    sctx.globalAlpha = 1;
  }

  // 켄번즈: 슬롯 진행도에 따라 서서히 확대 + 미세 팬
  const kb = bg.kenBurns || 0;
  const zoom = bg.scale * (1 + kb * (state.progress || 0));
  const dw = W * zoom;
  const dh = H * zoom;
  const panX = (W - dw) / 2 - kb * W * 0.12 * ((state.slotIndex % 2 === 0 ? 1 : -1) * (state.progress || 0));
  const panY = (H - dh) / 2;

  ctx.imageSmoothingEnabled = true;
  if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';
  ctx.filter = `brightness(${bg.brightness}) saturate(${bg.saturation})`;
  ctx.drawImage(scratch.canvas, panX, panY, dw, dh);
  ctx.filter = 'none';

  // 컬러 틴트 (따뜻한 톤 통일)
  if (bg.tintOpacity > 0) {
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = rgba(bg.tint, bg.tintOpacity);
    ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'source-over';
  }

  ctx.restore();
};

/** 화면 가장자리 어둡게 — 중앙 LP판에 시선을 모은다 */
export const drawVignette = (ctx, scene, env) => {
  const strength = scene.project.background.vignette;
  if (!strength) return;
  const { width: W, height: H } = env;
  const grad = ctx.createRadialGradient(
    W / 2, H * 0.46, Math.min(W, H) * 0.18,
    W / 2, H * 0.5, Math.max(W, H) * 0.72,
  );
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.6, `rgba(0,0,0,${strength * 0.35})`);
  grad.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.save();
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
};

/** 하단 자막 가독성 확보용 그라데이션 */
export const drawBottomScrim = (ctx, env, height, opacity = 0.7) => {
  const { width: W, height: H } = env;
  const top = H * (1 - height);
  const grad = ctx.createLinearGradient(0, top, 0, H);
  grad.addColorStop(0, 'rgba(0,0,0,0)');
  grad.addColorStop(0.55, `rgba(0,0,0,${opacity * 0.55})`);
  grad.addColorStop(1, `rgba(0,0,0,${opacity})`);
  ctx.save();
  ctx.fillStyle = grad;
  ctx.fillRect(0, top, W, H - top);
  ctx.restore();
};
