/**
 * Carte Postale — 엽서.
 *
 * 어두운 바탕 위에 사진을 살짝 기울인 카드로 얹고, 가사는 그 옆에
 * 왼쪽 정렬 컬럼으로 세운다. 잡지 편집 지면에 가까운 구성.
 * 사진이 "화면"이 아니라 "물건"으로 보이는 게 이 안의 성격이다.
 */

import { drawLyrics } from '../layers/lyrics.js';
import { paintPhotoRect } from '../layers/photoStage.js';
import { norm, rgba, roundRectPath, smoothstep } from '../util.js';

export const drawCarte = (ctx, scene, env, t) => {
  const { width: W, height: H } = env;
  const cfg = scene.project.layouts.carte;
  const state = env.photoState;
  const theme = scene.project.theme;

  // ── 바탕 ──
  ctx.save();
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, W, H);

  // 아주 흐린 사진을 바탕 질감으로만 깐다
  paintPhotoRect(ctx, env, state, { x: 0, y: 0, w: W, h: H }, {
    push: 0.04,
    brightness: cfg.groundBrightness,
    saturation: cfg.groundSaturation,
    dim: cfg.groundDim,
  });

  // 위에서 아래로 떨어지는 부드러운 조명
  const light = ctx.createLinearGradient(0, 0, W * 0.4, H);
  light.addColorStop(0, rgba(theme.accent, cfg.wash));
  light.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = light;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();

  // ── 사진 카드 ──
  const onRight = cfg.cardSide === 'right';
  const cardW = W * cfg.cardWidth;
  const cardH = cardW / cfg.cardAspect;
  const cardX = onRight ? W * (1 - cfg.cardInset) - cardW : W * cfg.cardInset;
  const cardY = H * cfg.cardY - cardH / 2;
  const tilt = (cfg.tilt * Math.PI) / 180;
  // 아주 느린 흔들림 — 손에 든 종이처럼
  const sway = Math.sin(t * 0.22) * 0.004;

  ctx.save();
  ctx.translate(cardX + cardW / 2, cardY + cardH / 2);
  ctx.rotate(tilt + sway);
  ctx.translate(-cardW / 2, -cardH / 2);

  // 종이 여백 (폴라로이드처럼 아래가 더 두껍다)
  const pad = cardW * cfg.matte;
  const padBottom = pad * cfg.matteBottom;
  const paperW = cardW + pad * 2;
  const paperH = cardH + pad + padBottom;

  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = cardW * 0.09;
  ctx.shadowOffsetY = cardW * 0.025;
  ctx.fillStyle = cfg.paper;
  roundRectPath(ctx, -pad, -pad, paperW, paperH, cardW * 0.012);
  ctx.fill();
  ctx.restore();

  paintPhotoRect(ctx, env, state, { x: 0, y: 0, w: cardW, h: cardH }, {
    push: 0.07,
    radius: cardW * 0.004,
  });

  // 사진 안쪽 테두리 음영
  ctx.strokeStyle = 'rgba(0,0,0,0.28)';
  ctx.lineWidth = Math.max(1, cardW * 0.003);
  ctx.strokeRect(0, 0, cardW, cardH);

  // 종이 아래 여백에 찍는 캡션
  if (cfg.caption) {
    const fs = cardW * 0.045;
    ctx.font = `300 ${fs}px "${theme.fontDisplay}", serif`;
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${fs * 0.22}px`;
    ctx.fillStyle = 'rgba(40,32,24,0.62)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const label = cfg.caption.replace(
      '{n}',
      String((state.slotIndex ?? 0) + 1).padStart(2, '0'),
    );
    ctx.fillText(label.toUpperCase(), cardW / 2, cardH + padBottom * 0.52);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }
  ctx.restore();

  // ── 가사 컬럼 ──
  const textW = W * cfg.textWidth;
  const textX = onRight ? W * cfg.textInset : W * (1 - cfg.textInset) - textW;

  // 컬럼 위 얇은 규칙선
  const appear = smoothstep(norm(t, 0.8, 2.4));
  ctx.save();
  ctx.globalAlpha = appear;
  ctx.strokeStyle = rgba(theme.accent, 0.5);
  ctx.lineWidth = Math.max(1, H * 0.0012);
  ctx.beginPath();
  ctx.moveTo(textX, H * cfg.textY - H * 0.1);
  ctx.lineTo(textX + textW * 0.32, H * cfg.textY - H * 0.1);
  ctx.stroke();
  ctx.restore();

  drawLyrics(ctx, scene, env, t, {
    align: 'left',
    cx: textX,
    baseY: H * cfg.textY,
    maxWidth: textW,
    size: H * cfg.fontSize,
  });
};
