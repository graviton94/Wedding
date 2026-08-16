/**
 * Marquee — 밤의 간판.
 *
 * 가사가 화면 한가운데 크게 놓이고, 사진은 아주 어둡게 깐 배경으로만 존재한다.
 * 다섯 안 중 글자 비중이 가장 크다 — 사실상 가사 영상.
 */

import { drawLyrics } from '../layers/lyrics.js';
import { paintPhotoRect } from '../layers/photoStage.js';
import { rgba } from '../util.js';

export const drawMarquee = (ctx, scene, env, t) => {
  const { width: W, height: H } = env;
  const cfg = scene.project.layouts.marquee;
  const state = env.photoState;
  const accent = scene.project.theme.accent;

  ctx.save();
  ctx.fillStyle = scene.project.theme.bg;
  ctx.fillRect(0, 0, W, H);

  // 사진은 화면 전체지만 거의 지워질 만큼 어둡게 — 형태만 남는다
  paintPhotoRect(ctx, env, state, { x: 0, y: 0, w: W, h: H }, {
    fit: cfg.fit,
    panStart: cfg.panStart,
    panEnd: cfg.panEnd,
    push: 0,
    transition: scene.project.photos.transition,
    panHold: scene.project.photos.crossfade,
    brightness: cfg.brightness,
    saturation: cfg.saturation,
    tint: cfg.tint,
    tintOpacity: cfg.tintOpacity,
    dim: cfg.dim,
  });

  // 중앙에서 바깥으로 어두워지는 반대 비네트 — 글자 뒤만 살짝 밝다
  const glow = ctx.createRadialGradient(
    W / 2, H * cfg.centerY, 0,
    W / 2, H * cfg.centerY, W * 0.62,
  );
  glow.addColorStop(0, rgba(accent, cfg.halo));
  glow.addColorStop(0.45, rgba(accent, cfg.halo * 0.18));
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  ctx.globalCompositeOperation = 'source-over';
  ctx.restore();

  const cy = H * cfg.centerY;

  /*
   * 자막 뒤 가로 띠 그림자.
   * 사진 전체를 어둡게 눌러 가독성을 얻으면 사진이 죽는다 —
   * 글자가 놓이는 띠만 눌러서 사진은 밝게 두고 대비를 만든다.
   */
  if (cfg.textBand > 0) {
    const bandH = H * (cfg.textBandHeight ?? 0.34);
    const band = ctx.createLinearGradient(0, cy - bandH / 2, 0, cy + bandH / 2);
    band.addColorStop(0, 'rgba(0,0,0,0)');
    band.addColorStop(0.35, `rgba(0,0,0,${cfg.textBand})`);
    band.addColorStop(0.65, `rgba(0,0,0,${cfg.textBand})`);
    band.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save();
    ctx.fillStyle = band;
    ctx.fillRect(0, cy - bandH / 2, W, bandH);
    ctx.restore();
  }

  // 가사 위아래 얇은 규칙선 — 글자를 판에 앉힌 느낌
  if (cfg.rule > 0) {
    const halfW = W * cfg.ruleWidth;
    ctx.save();
    ctx.strokeStyle = rgba(accent, cfg.rule);
    ctx.lineWidth = Math.max(1, H * 0.0011);
    for (const dy of [-H * cfg.ruleGap, H * cfg.ruleGap]) {
      ctx.beginPath();
      ctx.moveTo(W / 2 - halfW, cy + dy);
      ctx.lineTo(W / 2 + halfW, cy + dy);
      ctx.stroke();
    }
    ctx.restore();
  }

  // 가사를 화면 한가운데로
  drawLyrics(ctx, scene, env, t, {
    baseY: cy,
    maxWidth: W * 0.68,
    size: Math.min(W, H) * cfg.fontSize,
  });
};
