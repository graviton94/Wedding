/**
 * Cinéma — 시네마 자막.
 *
 * 사진을 화면 가득 깔고 2.39:1 로 위아래를 잘라낸 뒤,
 * 가사를 영화 자막처럼 화면 아래쪽에 앉힌다.
 * 장치는 거의 없다 — 사진 한 장, 자막 한 줄. 가장 담백한 안.
 */

import { drawLyrics } from '../layers/lyrics.js';
import { paintPhotoRect, scrimBottom } from '../layers/photoStage.js';
import { norm, rgba, smoothstep } from '../util.js';

export const drawCinema = (ctx, scene, env, t) => {
  const { width: W, height: H } = env;
  const cfg = scene.project.layouts.cinema;
  const state = env.photoState;

  // 시네마스코프 비율로 잘라낸 실제 화면 영역
  const frameH = Math.min(H, W / cfg.aspect);
  const barH = (H - frameH) / 2;
  const frame = { x: 0, y: barH, w: W, h: frameH };

  ctx.save();
  ctx.fillStyle = scene.project.theme.bg;
  ctx.fillRect(0, 0, W, H);

  paintPhotoRect(ctx, env, state, frame, {
    fit: cfg.fit,
    panStart: cfg.panStart,
    panEnd: cfg.panEnd,
    push: cfg.pushIn,
    transition: scene.project.photos.transition,
    panHold: scene.project.photos.crossfade,
    brightness: cfg.brightness,
    saturation: cfg.saturation,
    tint: cfg.tint,
    tintOpacity: cfg.tintOpacity,
    dim: cfg.dim,
  });

  // 위아래 가장자리를 눌러 프레임 안으로 시선을 모은다
  const edge = ctx.createLinearGradient(0, frame.y, 0, frame.y + frame.h);
  edge.addColorStop(0, `rgba(0,0,0,${cfg.edgeShade})`);
  edge.addColorStop(0.3, 'rgba(0,0,0,0)');
  edge.addColorStop(0.68, 'rgba(0,0,0,0)');
  edge.addColorStop(1, `rgba(0,0,0,${cfg.edgeShade})`);
  ctx.fillStyle = edge;
  ctx.fillRect(frame.x, frame.y, frame.w, frame.h);

  scrimBottom(ctx, frame, 0.72, 0.5);
  ctx.restore();

  // 자막은 프레임 안쪽 아래에 — 실제 영화 자막이 앉는 자리
  env.lyricAnchor = {
    cx: W / 2,
    baseY: frame.y + frame.h * (1 - cfg.subtitleInset),
    maxWidth: W * 0.74,
    align: 'center',
  };
  drawLyrics(ctx, scene, env, t, env.lyricAnchor);

  // 좌상단 트랙 표기 — 유튜브 플레이리스트 특유의 작은 라벨
  if (cfg.slate) {
    const fs = H * 0.0165;
    const appear = smoothstep(norm(t, 0.6, 2.2));
    ctx.save();
    ctx.globalAlpha = 0.5 * appear;
    ctx.font = `300 ${fs}px "${scene.project.theme.fontDisplay}", serif`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${fs * 0.28}px`;
    ctx.fillStyle = rgba(scene.project.theme.accent, 1);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(cfg.slate.toUpperCase(), W * 0.045, frame.y + frame.h * 0.06);
    ctx.restore();
  }

  // 레터박스 바
  ctx.save();
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, barH);
  ctx.fillRect(0, H - barH, W, barH);
  ctx.restore();
};
