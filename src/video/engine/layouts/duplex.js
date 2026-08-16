/**
 * Duplex — 위 사진 / 아래 가사 2단.
 *
 * 화면을 가로로 나눠 위는 사진, 아래는 단색 패널에 가사를 앉힌다.
 * 글자가 사진 위에 겹치지 않아 다섯 안 중 가독성이 가장 높다.
 * 구조가 단순한 만큼 사진 자체를 크게 보여줄 수 있다.
 */

import { drawLyrics } from '../layers/lyrics.js';
import { paintPhotoRect } from '../layers/photoStage.js';
import { formatTime, hexToRgb, norm, rgba, smoothstep } from '../util.js';

export const drawDuplex = (ctx, scene, env, t) => {
  const { width: W, height: H } = env;
  const cfg = scene.project.layouts.duplex;
  const state = env.photoState;
  const theme = scene.project.theme;

  const photoH = H * cfg.photoRatio;
  const panelY = photoH;
  const panelH = H - photoH;

  // ── 사진 (위) ──
  paintPhotoRect(ctx, env, state, { x: 0, y: 0, w: W, h: photoH }, {
    push: cfg.pushIn,
    brightness: cfg.brightness,
    saturation: cfg.saturation,
    tint: cfg.tint,
    tintOpacity: cfg.tintOpacity,
    dim: cfg.photoDim,
  });

  // 사진 아래쪽을 패널 색으로 녹여 경계를 부드럽게
  const { r, g, b } = hexToRgb(cfg.panelColor || theme.bg);
  ctx.save();
  const blend = ctx.createLinearGradient(0, photoH - H * cfg.feather, 0, photoH);
  blend.addColorStop(0, `rgba(${r},${g},${b},0)`);
  blend.addColorStop(1, `rgba(${r},${g},${b},1)`);
  ctx.fillStyle = blend;
  ctx.fillRect(0, photoH - H * cfg.feather, W, H * cfg.feather);
  ctx.restore();

  // ── 패널 (아래) ──
  ctx.save();
  ctx.fillStyle = cfg.panelColor || theme.bg;
  ctx.fillRect(0, panelY, W, panelH);

  // 경계 규칙선
  if (cfg.rule > 0) {
    const grad = ctx.createLinearGradient(W * 0.1, 0, W * 0.9, 0);
    grad.addColorStop(0, rgba(theme.accent, 0));
    grad.addColorStop(0.5, rgba(theme.accent, cfg.rule));
    grad.addColorStop(1, rgba(theme.accent, 0));
    ctx.fillStyle = grad;
    ctx.fillRect(0, panelY - 1, W, Math.max(1, H * 0.0012));
  }
  ctx.restore();

  // ── 가사 (패널 안 중앙) ──
  drawLyrics(ctx, scene, env, t, {
    baseY: panelY + panelH * cfg.textY,
    maxWidth: W * 0.8,
    size: H * cfg.fontSize,
  });

  // ── 패널 하단 트랙 정보 ──
  // 유튜브 플레이어를 흉내낸 얇은 진행 표시. 재생 중이라는 감각만 준다.
  if (cfg.trackInfo) {
    const fs = H * 0.0155;
    const y = H - panelH * 0.13;
    const appear = smoothstep(norm(t, 0.5, 2));

    ctx.save();
    ctx.globalAlpha = 0.42 * appear;
    ctx.font = `300 ${fs}px "${theme.fontDisplay}", serif`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${fs * 0.2}px`;
    ctx.fillStyle = theme.ink;
    ctx.textBaseline = 'middle';

    ctx.textAlign = 'left';
    ctx.fillText(cfg.trackInfo.toUpperCase(), W * 0.06, y);

    ctx.textAlign = 'right';
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    ctx.fillText(`${formatTime(t)} / ${formatTime(scene.total)}`, W * 0.94, y);

    // 가운데 가느다란 진행 바
    const barX = W * 0.06;
    const barW = W * 0.88;
    const barY = y + fs * 1.5;
    ctx.globalAlpha = 0.16 * appear;
    ctx.fillStyle = theme.ink;
    ctx.fillRect(barX, barY, barW, Math.max(1, H * 0.0016));
    ctx.globalAlpha = 0.75 * appear;
    ctx.fillStyle = theme.accent;
    ctx.fillRect(barX, barY, barW * (t / scene.total), Math.max(1, H * 0.0016));
    ctx.restore();
  }
};
