/**
 * Duplex — 사진 / 가사 2단.
 *
 * 두 가지 방향이 있다.
 *
 *   'vertical'   [ 사진(전체 높이) | 가사 패널 ]
 *                사진 영역이 세로로 길어져 2:3 세로 사진이 거의 잘리지 않고 들어간다.
 *                이 프로젝트 사진이 대부분 세로라 이쪽이 기본.
 *
 *   'horizontal' [ 위 사진 / 아래 가사 패널 ]
 *                가로 사진에 맞는 형태. 세로 사진은 blur 채움으로 전체를 보여준다.
 *
 * 어느 쪽이든 글자가 사진 위에 겹치지 않아 가독성이 가장 높다.
 */

import { drawLyrics } from '../layers/lyrics.js';
import { paintPhotoRect } from '../layers/photoStage.js';
import { formatTime, hexToRgb, norm, rgba, smoothstep } from '../util.js';

/** 패널 하단 트랙 정보 + 진행 바 */
const drawTrackInfo = (ctx, scene, cfg, theme, rect, t) => {
  if (!cfg.trackInfo) return;
  const { x, y, w, h } = rect;
  const fs = Math.min(h * 0.075, w * 0.02);
  const appear = smoothstep(norm(t, 0.5, 2));
  const lineY = y + h - Math.max(fs * 2.6, h * 0.14);

  ctx.save();
  ctx.globalAlpha = 0.45 * appear;
  ctx.font = `300 ${fs}px "${theme.fontDisplay}", "${theme.fontBody}", serif`;
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${fs * 0.2}px`;
  ctx.fillStyle = theme.ink;
  ctx.textBaseline = 'middle';

  const pad = w * 0.08;
  ctx.textAlign = 'left';
  ctx.fillText(cfg.trackInfo.toUpperCase(), x + pad, lineY);

  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.textAlign = 'right';
  ctx.fillText(`${formatTime(t)} / ${formatTime(scene.total)}`, x + w - pad, lineY);

  // 가느다란 진행 바
  const barY = lineY + fs * 1.5;
  const barH = Math.max(1, h * 0.004);
  ctx.globalAlpha = 0.16 * appear;
  ctx.fillStyle = theme.ink;
  ctx.fillRect(x + pad, barY, w - pad * 2, barH);
  ctx.globalAlpha = 0.8 * appear;
  ctx.fillStyle = theme.accent;
  ctx.fillRect(x + pad, barY, (w - pad * 2) * (t / scene.total), barH);
  ctx.restore();
};

export const drawDuplex = (ctx, scene, env, t) => {
  const { width: W, height: H } = env;
  const cfg = scene.project.layouts.duplex;
  const state = env.photoState;
  const theme = scene.project.theme;
  const vertical = cfg.orientation !== 'horizontal';

  const panelHex = cfg.panelColor || theme.bg;
  const { r, g, b } = hexToRgb(panelHex);

  // 사진/패널 영역 나누기
  const photoRect = vertical
    ? { x: cfg.photoSide === 'right' ? W * (1 - cfg.photoRatio) : 0, y: 0, w: W * cfg.photoRatio, h: H }
    : { x: 0, y: 0, w: W, h: H * cfg.photoRatio };

  const panelRect = vertical
    ? { x: cfg.photoSide === 'right' ? 0 : W * cfg.photoRatio, y: 0, w: W * (1 - cfg.photoRatio), h: H }
    : { x: 0, y: H * cfg.photoRatio, w: W, h: H * (1 - cfg.photoRatio) };

  // ── 바탕 ──
  ctx.save();
  ctx.fillStyle = panelHex;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // ── 사진 ──
  paintPhotoRect(ctx, env, state, photoRect, {
    // 가로 배치는 가로맞춤 + 세로 팬으로 사진 전체를 시간에 걸쳐 훑는다.
    // 세로 배치는 영역 자체가 세로로 길어 cover로 충분하다.
    fit: cfg.fit || (vertical ? 'cover' : 'width'),
    panStart: cfg.panStart,
    panEnd: cfg.panEnd,
    push: cfg.pushIn,
    brightness: cfg.brightness,
    saturation: cfg.saturation,
    tint: cfg.tint,
    tintOpacity: cfg.tintOpacity,
    dim: cfg.photoDim,
    transition: scene.project.photos.transition,
    panHold: scene.project.photos.crossfade,
    backdrop: panelHex,
  });

  // ── 경계 녹이기 ──
  // 사진과 패널이 맞닿는 선을 그라데이션으로 지운다 — 딱 떨어지는 직선이
  // 보이면 "사진이 잘려 붙어 있다"는 인상이 생긴다.
  ctx.save();
  const fade = (vertical ? W : H) * cfg.feather;
  if (vertical) {
    const toLeft = cfg.photoSide === 'right';
    const edge = toLeft ? photoRect.x : photoRect.x + photoRect.w;
    const grad = ctx.createLinearGradient(
      toLeft ? edge + fade : edge - fade, 0,
      toLeft ? edge : edge, 0,
    );
    grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},1)`);
    ctx.fillStyle = grad;
    ctx.fillRect(toLeft ? edge : edge - fade, 0, fade, H);
  } else {
    const edge = photoRect.y + photoRect.h;
    const grad = ctx.createLinearGradient(0, edge - fade, 0, edge);
    grad.addColorStop(0, `rgba(${r},${g},${b},0)`);
    grad.addColorStop(1, `rgba(${r},${g},${b},1)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, edge - fade, W, fade);
  }
  ctx.restore();

  // ── 경계 규칙선 ──
  if (cfg.rule > 0) {
    ctx.save();
    const accentA = rgba(theme.accent, 0);
    const accentB = rgba(theme.accent, cfg.rule);
    if (vertical) {
      const edge = cfg.photoSide === 'right' ? photoRect.x : photoRect.x + photoRect.w;
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, accentA);
      grad.addColorStop(0.4, accentB);
      grad.addColorStop(0.6, accentB);
      grad.addColorStop(1, accentA);
      ctx.fillStyle = grad;
      ctx.fillRect(edge - 0.5, 0, Math.max(1, W * 0.0008), H);
    } else {
      const edge = photoRect.y + photoRect.h;
      const grad = ctx.createLinearGradient(W * 0.1, 0, W * 0.9, 0);
      grad.addColorStop(0, accentA);
      grad.addColorStop(0.5, accentB);
      grad.addColorStop(1, accentA);
      ctx.fillStyle = grad;
      ctx.fillRect(0, edge - 1, W, Math.max(1, H * 0.0012));
    }
    ctx.restore();
  }

  // ── 가사 ──
  // 인트로/아웃트로 문구도 같은 자리에 앉히도록 앵커를 남긴다
  env.lyricAnchor = {
    cx: panelRect.x + panelRect.w / 2,
    baseY: panelRect.y + panelRect.h * cfg.textY,
    maxWidth: panelRect.w * 0.82,
    size: Math.min(W, H) * cfg.fontSize,
    align: 'center',
  };
  drawLyrics(ctx, scene, env, t, env.lyricAnchor);

  drawTrackInfo(ctx, scene, cfg, theme, panelRect, t);
};
