/**
 * Défilé — 흐르는 가사.
 *
 * 유튜브 가사 영상에서 가장 익숙한 형태. 여러 줄이 세로로 쌓여 흐르고
 * 현재 줄만 밝다. 사진은 한쪽에 세로 컬럼으로 서서 배경 역할만 한다.
 * 앞뒤 가사가 같이 보이므로 "지금 어디쯤"이 읽힌다.
 */

import { drawLyricScroll } from '../layers/lyricScroll.js';
import { paintPhotoRect, scrimSide } from '../layers/photoStage.js';
import { rgba } from '../util.js';

export const drawDefile = (ctx, scene, env, t) => {
  const { width: W, height: H } = env;
  const cfg = scene.project.layouts.defile;
  const state = env.photoState;
  const onRight = cfg.photoSide === 'right';

  const photoW = W * cfg.photoWidth;
  const photoRect = { x: onRight ? W - photoW : 0, y: 0, w: photoW, h: H };
  const textX = onRight ? (W - photoW) / 2 : photoW + (W - photoW) / 2;

  ctx.save();
  ctx.fillStyle = scene.project.theme.bg;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // 사진 컬럼
  paintPhotoRect(ctx, env, state, photoRect, {
    fit: cfg.fit,
    push: 0.09,
    transition: scene.project.photos.transition,
    brightness: cfg.brightness,
    saturation: cfg.saturation,
    tint: cfg.tint,
    tintOpacity: cfg.tintOpacity,
    dim: cfg.photoDim,
    drift: H * 0.012,
    seedPhase: t * 0.15,
  });
  // 글자 쪽으로 페이드시켜 경계를 지운다
  scrimSide(ctx, photoRect, onRight ? 'left' : 'right', cfg.blend);

  // 사진 컬럼 안쪽 경계선
  if (cfg.rule > 0) {
    const x = onRight ? photoRect.x : photoRect.x + photoRect.w;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, rgba(scene.project.theme.accent, 0));
    g.addColorStop(0.4, rgba(scene.project.theme.accent, cfg.rule));
    g.addColorStop(0.6, rgba(scene.project.theme.accent, cfg.rule));
    g.addColorStop(1, rgba(scene.project.theme.accent, 0));
    ctx.save();
    ctx.fillStyle = g;
    ctx.fillRect(x - 0.5, 0, Math.max(1, W * 0.0007), H);
    ctx.restore();
  }

  // 흐르는 가사 목록
  drawLyricScroll(ctx, scene, env, t, {
    cx: textX,
    top: H * 0.1,
    height: H * 0.8,
    size: Math.min(W, H) * cfg.fontSize,
    gap: cfg.lineGap,
    visible: cfg.visibleLines,
    align: 'center',
    maxWidth: (W - photoW) * 0.82,
  });
};
