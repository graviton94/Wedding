/**
 * 사진을 사각 영역에 앉히는 공용 헬퍼.
 *
 * 이 프로젝트 사진은 17장 중 16장이 2:3 세로다. 16:9 화면에 cover로 넣으면
 * 배율이 2.4배까지 올라가 사진 세로의 1/4 남짓만 남는다 — 머리도 발도 잘린다.
 * 그래서 채우는 방식(fit)을 고를 수 있게 했다.
 *
 *   'cover'  상자를 꽉 채우고 넘치는 부분은 자른다. 가로 사진이나
 *            상자가 세로로 길 때 적합.
 *   'blur'   사진 전체를 담고(contain), 남는 자리는 같은 사진을 크게 흐린
 *            것으로 메운다. 잘리는 곳도 빈 곳도 없고 경계선도 안 보인다.
 *            세로 사진을 가로 화면에 넣을 때 기본으로 쓸 방식.
 *   'contain' 사진 전체를 담고 남는 자리는 그대로 둔다(단색 여백).
 */

import { clamp, drawContain, drawCover, rgba, roundRectPath } from '../util.js';

/**
 * 블러 배경은 ctx.filter 대신 "축소 → 확대"로 만든다.
 * 4K에서 filter='blur(60px)'는 프레임당 수십 ms를 먹고 구현마다 결과가 달라서,
 * 미리보기와 최종 mp4가 미세하게 어긋난다. 이 방식은 두 환경에서 동일하다.
 */
const scratchCache = new WeakMap();

const getScratch = (ctx, env, w, h) => {
  let store = scratchCache.get(ctx);
  if (!store) {
    store = {};
    scratchCache.set(ctx, store);
  }
  const key = `${w}x${h}`;
  if (!store[key]) {
    const canvas = env.createCanvas(w, h);
    store[key] = { canvas, ctx: canvas.getContext('2d') };
  }
  return store[key];
};

/**
 * 현재/다음 사진을 rect에 크로스페이드로 그린다.
 *
 * @param {object} state photoStateAt() 결과 ({current, next, mix, progress})
 * @param {object} opts  { fit, push, drift, radius, dim, brightness, saturation,
 *                         tint, tintOpacity, seedPhase, blurDim, blurScale }
 */
export const paintPhotoRect = (ctx, env, state, rect, opts = {}) => {
  const { x, y, w, h } = rect;
  if (w <= 0 || h <= 0) return;

  const fit = opts.fit ?? 'cover';
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

  ctx.fillStyle = opts.backdrop || '#0a0908';
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
   * 채도를 빼고 밝기를 떨어뜨려야 밤 톤으로 내려간다.
   */
  const bright = opts.brightness ?? 1;
  const sat = opts.saturation ?? 1;
  const graded = bright !== 1 || sat !== 1;

  // ── 1. 블러 배경 (fit='blur'일 때만) ──
  if (fit === 'blur') {
    const divisor = opts.blurScale ?? 22;
    const bw = Math.max(8, Math.round(w / divisor));
    const bh = Math.max(8, Math.round(h / divisor));
    const scratch = getScratch(ctx, env, bw, bh);
    const sctx = scratch.ctx;

    sctx.clearRect(0, 0, bw, bh);
    const paintSmall = (slot, alpha) => {
      if (!slot || alpha <= 0.002) return;
      const img = env.getImage(slot.src);
      if (!img) return;
      sctx.globalAlpha = alpha;
      drawCover(sctx, img, 0, 0, bw, bh, slot.photo?.focusX ?? 0.5, slot.photo?.focusY ?? 0.5);
    };
    paintSmall(state.current, 1);
    paintSmall(state.next, state.mix);
    sctx.globalAlpha = 1;

    ctx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';
    // 배경은 본 사진보다 더 어둡게 — 가운데 선명한 사진이 앞으로 나온다
    ctx.filter = `brightness(${bright * (opts.blurDim ?? 0.55)}) saturate(${sat * 0.85})`;
    // 살짝 키워서 그려야 가장자리에 빈 픽셀이 안 남는다
    ctx.drawImage(scratch.canvas, dx - w * 0.04, dy - h * 0.04, dw * 1.08, dh * 1.08);
    ctx.filter = 'none';
  }

  // ── 2. 본 사진 ──
  if (graded) ctx.filter = `brightness(${bright}) saturate(${sat})`;

  if (fit === 'cover') {
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
  } else {
    /*
     * contain 배치는 사진 가장자리가 직선으로 드러난다. 그 선이 보이는 순간
     * "사진이 화면에 안 맞는다"는 인상이 생기므로, 오프스크린에 그린 뒤
     * destination-out 그라데이션으로 가장자리 알파를 깎아 블러 배경에 녹인다.
     * 여백이 없는 축은 깎지 않는다 — 프레임에 딱 붙은 변까지 흐려지면 안 된다.
     */
    const layer = getScratch(ctx, env, Math.round(w), Math.round(h));
    const lctx = layer.ctx;
    lctx.clearRect(0, 0, w, h);

    let placed = null;
    const paint = (slot, alpha) => {
      if (!slot || alpha <= 0.002) return;
      const img = env.getImage(slot.src);
      if (!img) return;
      lctx.globalAlpha = alpha;
      const r = drawContain(lctx, img, dx - x, dy - y, dw, dh);
      if (r && (!placed || alpha >= 0.5)) placed = r;
    };
    paint(state.current, 1);
    paint(state.next, state.mix);
    lctx.globalAlpha = 1;

    if (fit === 'blur' && placed) {
      const feather = Math.max(2, Math.min(w, h) * (opts.edgeFeather ?? 0.05));
      const gapX = placed.x > 0.5;                 // 좌우에 여백이 있나
      const gapY = placed.y > 0.5;                 // 위아래에 여백이 있나
      lctx.globalCompositeOperation = 'destination-out';

      const carve = (x0, y0, x1, y1, rx, ry, rw, rh) => {
        const g = lctx.createLinearGradient(x0, y0, x1, y1);
        g.addColorStop(0, 'rgba(0,0,0,1)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        lctx.fillStyle = g;
        lctx.fillRect(rx, ry, rw, rh);
      };

      if (gapX) {
        carve(placed.x, 0, placed.x + feather, 0, placed.x, placed.y, feather, placed.h);
        const right = placed.x + placed.w;
        carve(right, 0, right - feather, 0, right - feather, placed.y, feather, placed.h);
      }
      if (gapY) {
        carve(0, placed.y, 0, placed.y + feather, placed.x, placed.y, placed.w, feather);
        const bottom = placed.y + placed.h;
        carve(0, bottom, 0, bottom - feather, placed.x, bottom - feather, placed.w, feather);
      }
      lctx.globalCompositeOperation = 'source-over';
    }

    ctx.drawImage(layer.canvas, x, y);
  }

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
