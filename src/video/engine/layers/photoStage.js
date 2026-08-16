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

import { clamp, drawContain, drawCover, norm, rgba, roundRectPath, smoothstep } from '../util.js';

/**
 * fit='width' 배치 — 사진에서 쓸 구간만 잘라내고, 그 안에서만 훑는다.
 *
 * cropTop~cropBottom (사진 세로 높이 기준 비율)이 "쓸 구간"이다.
 * 그 바깥 — 위쪽 천장·하늘, 아래쪽 치맛단·바닥 같은 무의미한 영역 — 은
 * 아예 잘라버리고 화면에 한 번도 나오지 않는다.
 *
 * 잘라낸 구간을 상자에 cover로 채운 뒤, 남는 세로만큼만 슬롯 진행에 따라
 * 위로 밀어올린다. 가로는 항상 꽉 차므로 여백도 이음새도 없다.
 *
 *   cropTop 0.2 ─┐
 *                │  ← 이 구간만 화면에 나온다. 시작은 위쪽,
 *                │     시간이 지나며 아래쪽으로 밀려 올라간다.
 *   cropBottom 0.6 ┘
 */
const paintWidthPan = (ctx, img, slot, box, progress, opts, yOffset = 0) => {
  const { x, y: y0, w, h } = box;
  const y = y0 + yOffset;

  // 사진별 값이 있으면 우선 — 인물 위치가 컷마다 달라서 구간도 달라져야 한다
  const rawTop = slot.photo?.cropTop ?? opts.cropTop ?? 0.2;
  const rawBottom = slot.photo?.cropBottom ?? opts.cropBottom ?? 0.6;
  const top = clamp(Math.min(rawTop, rawBottom));
  const bottom = clamp(Math.max(rawTop, rawBottom));

  // 잘라낸 소스 영역
  const sy = top * img.height;
  const sh = Math.max(1, (bottom - top) * img.height);
  const sw = img.width;

  // 그 조각으로 상자를 채운다 (가로가 모자라면 세로를 잘라서라도 채움)
  const scale = Math.max(w / sw, h / sh);
  const drawW = sw * scale;
  const drawH = sh * scale;

  // 세로로 남는 만큼만 밀어올린다. 0이면 정지 — 구간이 상자 비율과 같다는 뜻
  const overflow = Math.max(0, drawH - h);
  const eased = opts.panEase === 'linear' ? clamp(progress) : smoothstep(clamp(progress));
  const offsetY = -overflow * eased;
  // 세로가 기준이 되어 가로가 넘칠 때는 focusX로 좌우 위치를 잡는다
  const offsetX = (w - drawW) * (slot.photo?.focusX ?? 0.5);

  ctx.drawImage(img, 0, sy, sw, sh, x + offsetX, y + offsetY, drawW, drawH);
};

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

  if (fit === 'cover' || fit === 'width') {
    /*
     * 팬 위치는 슬롯마다 따로 계산한다.
     * 크로스페이드 중에는 현재 슬롯이 팬 끝(0.85)에, 다음 슬롯이 팬 시작(0.15)에
     * 있어야 한다. 하나의 progress를 공유하면 슬롯이 바뀌는 순간 사진이 튄다.
     */
    /*
     * 팬은 전환이 시작되기 전에 끝나야 한다.
     * 슬롯 끝까지 팬을 돌리면 사진이 아직 미끄러지는 중에 페이드가 겹쳐
     * "다 보여주지 않고 넘어간" 느낌이 난다. panHold(=전환 시간)만큼
     * 앞당겨 끝내고 그 뒤로는 멈춰 선 채로 넘어간다.
     */
    const hold = opts.panHold ?? 0;
    const slotProgress = (slot) => {
      if (!slot || env.time == null) return state.progress ?? 0;
      const stop = Math.max(slot.start + 0.1, slot.end - hold);
      return clamp(norm(env.time, slot.start, stop));
    };

    /*
     * 전환 효과.
     *   crossfade  겹쳐서 페이드 (기본)
     *   slide      현재 컷이 위로 밀려나가고 다음 컷이 아래에서 올라온다.
     *              세로 팬과 방향이 같아 움직임이 이어져 보인다.
     *   dip        검게 떨어졌다가 다음 컷이 떠오른다. 가장 담백하다.
     */
    const mix = state.mix;
    const trans = opts.transition || 'crossfade';
    let curAlpha = 1;
    let nextAlpha = mix;
    let curY = 0;
    let nextY = 0;

    if (trans === 'slide') {
      const e = smoothstep(mix);
      curY = -dh * e;
      nextY = dh * (1 - e);
      nextAlpha = mix > 0 ? 1 : 0;
    } else if (trans === 'dip') {
      /*
       * 현재 컷이 먼저 빠지고 다음 컷이 올라온다.
       * 완전히 검게 떨어뜨리면 뚝 끊기므로 overlap만큼 겹쳐서
       * 잠깐 어두워졌다 밝아지는 정도로만 둔다.
       */
      const ov = opts.dipOverlap ?? 0.18;
      curAlpha = 1 - smoothstep(clamp(mix / (0.5 + ov)));
      nextAlpha = smoothstep(clamp((mix - (0.5 - ov)) / (0.5 + ov)));
    }

    const paint = (slot, alpha, yOff) => {
      if (!slot || alpha <= 0.002) return;
      const img = env.getImage(slot.src);
      if (!img) return;
      ctx.globalAlpha = alpha;
      if (fit === 'width') {
        paintWidthPan(ctx, img, slot, { x: dx, y: dy, w: dw, h: dh }, slotProgress(slot), opts, yOff);
      } else {
        drawCover(ctx, img, dx, dy + yOff, dw, dh, slot.photo?.focusX ?? 0.5, slot.photo?.focusY ?? 0.45);
      }
    };
    // slide는 들어오는 컷이 위에 놓여야 자연스럽다
    if (trans === 'slide') {
      paint(state.current, curAlpha, curY);
      paint(state.next, nextAlpha, nextY);
    } else {
      paint(state.current, curAlpha, 0);
      paint(state.next, nextAlpha, 0);
    }
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
