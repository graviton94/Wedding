/**
 * 사진을 사각 영역에 채우는 공용 헬퍼.
 *
 * 새 레이아웃들은 "LP판" 같은 장치 없이 사진을 직접 화면에 앉힌다.
 * 크로스페이드 + 아주 느린 푸시인(켄번즈)은 어느 레이아웃에서나 같으므로
 * 여기 한 곳에 모아둔다.
 */

import { drawCover, roundRectPath, clamp, rgba } from '../util.js';

/**
 * 현재/다음 사진을 rect에 크로스페이드로 그린다.
 *
 * @param {object} state  photoStateAt() 결과 ({current, next, mix, progress})
 * @param {object} opts   { push, drift, radius, dim, seedPhase }
 */
export const paintPhotoRect = (ctx, env, state, rect, opts = {}) => {
  const { x, y, w, h } = rect;
  if (w <= 0 || h <= 0) return;

  const push = opts.push ?? 0.06;
  const drift = opts.drift ?? 0;
  const phase = opts.seedPhase ?? 0;

  ctx.save();
  if (opts.radius) {
    roundRectPath(ctx, x, y, w, h, opts.radius);
    ctx.clip();
  } else {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
  }

  ctx.fillStyle = '#0a0908';
  ctx.fillRect(x, y, w, h);

  // 슬롯이 진행되는 동안 아주 천천히 확대 — 정지 사진이 살아 있게 보이는 최소한의 움직임
  const zoom = 1 + push * (state.progress ?? 0);
  const dw = w * zoom;
  const dh = h * zoom;
  const dx = x - (dw - w) / 2;
  const dy = y - (dh - h) / 2 + Math.sin(phase) * drift;

  /*
   * 색 보정은 검은 막을 덮는 게 아니라 filter로 먼저 건다.
   * 흰 스튜디오 컷에 검정만 얹으면 밤이 아니라 회색이 된다 —
   * 채도를 빼고 밝기를 눌러야 밤 톤으로 내려간다.
   */
  const bright = opts.brightness ?? 1;
  const sat = opts.saturation ?? 1;
  const graded = bright !== 1 || sat !== 1;
  if (graded) ctx.filter = `brightness(${bright}) saturate(${sat})`;

  const paint = (slot, alpha) => {
    if (!slot || alpha <= 0.002) return;
    const img = env.getImage(slot.src);
    if (!img) return;
    ctx.globalAlpha = alpha;
    drawCover(ctx, img, dx, dy, dw, dh, slot.photo?.focusX ?? 0.5, slot.photo?.focusY ?? 0.45);
  };

  paint(state.current, 1);
  paint(state.next, state.mix);
  ctx.globalAlpha = 1;
  if (graded) ctx.filter = 'none';

  // 톤 틴트 — 그림자를 밤색으로 민다
  if (opts.tint && (opts.tintOpacity ?? 0) > 0) {
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = rgba(opts.tint, opts.tintOpacity);
    ctx.fillRect(x, y, w, h);
    ctx.globalCompositeOperation = 'source-over';
  }

  // 밝기 누르기 — 가사가 주인공인 레이아웃에서는 사진을 뒤로 물린다
  const dim = clamp(opts.dim ?? 0, 0, 1);
  if (dim > 0) {
    ctx.fillStyle = `rgba(0,0,0,${dim})`;
    ctx.fillRect(x, y, w, h);
  }

  ctx.restore();
};

/** 아래쪽으로 어두워지는 그라데이션 — 자막이 사진 위에 얹힐 때 */
export const scrimBottom = (ctx, rect, strength = 0.75, from = 0.45) => {
  const { x, y, w, h } = rect;
  const top = y + h * from;
  const g = ctx.createLinearGradient(0, top, 0, y + h);
  g.addColorStop(0, 'rgba(0,0,0,0)');
  g.addColorStop(0.6, `rgba(0,0,0,${strength * 0.6})`);
  g.addColorStop(1, `rgba(0,0,0,${strength})`);
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(x, top, w, y + h - top);
  ctx.restore();
};

/** 좌우로 어두워지는 그라데이션 — 가사가 한쪽 컬럼에 있을 때 */
export const scrimSide = (ctx, rect, side, strength = 0.8) => {
  const { x, y, w, h } = rect;
  const g = ctx.createLinearGradient(x, 0, x + w, 0);
  if (side === 'left') {
    g.addColorStop(0, `rgba(0,0,0,${strength})`);
    g.addColorStop(0.75, 'rgba(0,0,0,0)');
  } else {
    g.addColorStop(0.25, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(0,0,0,${strength})`);
  }
  ctx.save();
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
};
