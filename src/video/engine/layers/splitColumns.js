/**
 * 3분할 화면 레이어.
 *
 * 화면을 세로 3등분해서 [사진 | 중앙(LP) | 사진] 구성으로 만든다.
 * 좌/우 컬럼은 컬럼 높이를 꽉 채우고, 사진 순서에 따라 크로스페이드된다.
 * 좌우가 짝/홀 슬롯을 나눠 가지므로 한 번에 한쪽만 바뀐다.
 */

import { columnStateAt } from '../timeline.js';
import { clamp, drawCover, norm, rgba, smoothstep } from '../util.js';

/**
 * 컬럼 x 좌표 계산.
 * centerRatio = 중앙 컬럼이 차지하는 폭 비율, 나머지를 좌우가 반씩 나눠 갖는다.
 */
export const columnRects = (W, H, split) => {
  const gap = split.gap || 0;
  const center = clamp(split.centerRatio, 0.15, 0.8) * W;
  const side = (W - center - gap * 2) / 2;
  return {
    left: { x: 0, y: 0, w: side, h: H },
    center: { x: side + gap, y: 0, w: center, h: H },
    right: { x: side + gap + center + gap, y: 0, w: side, h: H },
  };
};

/** 컬럼 하나에 사진을 크로스페이드로 채운다 */
const paintColumn = (ctx, env, rect, state, split, t, phase) => {
  const { x, y, w, h } = rect;
  if (w <= 0) return;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  ctx.fillStyle = '#0d0b09';
  ctx.fillRect(x, y, w, h);

  // 켄번즈 — 컬럼 안에서 아주 천천히 확대되며 위아래로 밀린다
  const kb = split.kenBurns || 0;
  const drift = Math.sin(t * 0.12 + phase) * h * kb * 0.35;
  const zoom = 1 + kb + Math.sin(t * 0.07 + phase) * kb * 0.5;
  const dw = w * zoom;
  const dh = h * zoom;
  const dx = x - (dw - w) / 2;
  const dy = y - (dh - h) / 2 + drift;

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

  // 밝기 보정 — 중앙 LP가 앞으로 나와 보이게 좌우를 살짝 누른다
  const dim = 1 - clamp(split.brightness, 0.2, 1.2);
  if (dim > 0) {
    ctx.fillStyle = `rgba(0,0,0,${dim})`;
    ctx.fillRect(x, y, w, h);
  }

  // 안쪽(중앙) 방향으로 어두워지는 그라데이션 — 3분할 경계를 부드럽게
  const inward = split.edgeFade || 0;
  if (inward > 0) {
    const toCenter = x < 1; // 왼쪽 컬럼이면 오른쪽 끝이 안쪽
    const g = ctx.createLinearGradient(x, 0, x + w, 0);
    if (toCenter) {
      g.addColorStop(0, 'rgba(0,0,0,0)');
      g.addColorStop(1, `rgba(0,0,0,${inward})`);
    } else {
      g.addColorStop(0, `rgba(0,0,0,${inward})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
    }
    ctx.fillStyle = g;
    ctx.fillRect(x, y, w, h);
  }

  ctx.restore();
};

export const drawSplitColumns = (ctx, scene, env, t) => {
  const split = scene.project.split;
  if (!split.enabled) return;

  const { width: W, height: H } = env;
  const rects = columnRects(W, H, split);
  const cf = scene.project.photos.crossfade;

  // 인트로/아웃트로에서는 좌우 컬럼이 접힌다
  let alpha = 1;
  const intro = scene.project.intro;
  if (intro?.enabled) alpha *= smoothstep(norm(t, intro.duration * 0.55, intro.duration + 0.6));
  const outro = scene.project.outro;
  if (outro?.enabled) {
    const outStart = scene.total - outro.duration;
    alpha *= 1 - smoothstep(norm(t, outStart - 0.3, outStart + 1.2));
  }
  if (alpha <= 0.002) return;

  // 오른쪽 컬럼은 stagger만큼 늦은 시간축을 본다 — 좌우 전환이 겹치지 않게
  const leftState = columnStateAt(scene.columns.left, t, cf);
  const rightState = columnStateAt(scene.columns.right, t - (split.stagger || 0), cf);

  ctx.save();
  ctx.globalAlpha = alpha;
  paintColumn(ctx, env, rects.left, leftState, split, t, 0);
  paintColumn(ctx, env, rects.right, rightState, split, t, Math.PI);
  ctx.restore();

  // 컬럼 사이 구분선
  if (split.divider > 0) {
    ctx.save();
    ctx.globalAlpha = alpha;
    const accent = scene.project.theme.accent;
    for (const x of [rects.center.x, rects.center.x + rects.center.w]) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, rgba(accent, 0));
      g.addColorStop(0.35, rgba(accent, split.divider));
      g.addColorStop(0.65, rgba(accent, split.divider));
      g.addColorStop(1, rgba(accent, 0));
      ctx.fillStyle = g;
      ctx.fillRect(x - 0.5, 0, Math.max(1, W * 0.0008), H);
    }
    ctx.restore();
  }
};

/**
 * 배경(블러 사진)이 중앙 컬럼에만 보이도록 잘라주는 클립 영역.
 * 3분할이 켜져 있으면 좌우는 crisp 사진이 덮으므로 중앙만 그리면 된다.
 */
export const centerClip = (ctx, scene, env) => {
  const split = scene.project.split;
  if (!split.enabled) return false;
  const { center } = columnRects(env.width, env.height, split);
  ctx.beginPath();
  ctx.rect(center.x, center.y, center.w, center.h);
  ctx.clip();
  return true;
};
