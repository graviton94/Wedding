/**
 * 화면 전체 효과 + 타이틀 카드.
 * 보케, 광선 누출, 필름 그레인, 진행 바, 인트로/아웃트로 텍스트, 워터마크.
 * 모든 랜덤값은 시드 기반이라 같은 프레임은 항상 같은 그림이 나온다.
 */

import { clamp, cssFont, easeOutCubic, fadeEnvelope, makeRng, norm, rgba, smoothstep, formatTime } from '../util.js';

const TAU = Math.PI * 2;

/** 보케 파티클 배치는 시드로 한 번만 만들고 캐싱 */
const bokehCache = new WeakMap();

const getBokeh = (scene, W, H) => {
  const key = scene;
  const cached = bokehCache.get(key);
  const count = scene.project.effects.bokehCount;
  if (cached && cached.count === count && cached.W === W && cached.H === H) return cached.items;

  const rng = makeRng((scene.seed ?? 1) + 7777);
  const items = Array.from({ length: count }, () => ({
    x: rng(),
    y: rng(),
    r: 0.006 + rng() * 0.028,      // 캔버스 짧은 변 대비
    speed: 0.008 + rng() * 0.03,   // 초당 화면 높이 대비 상승량
    drift: 0.02 + rng() * 0.06,
    phase: rng() * TAU,
    alpha: 0.15 + rng() * 0.5,
    warm: rng(),
  }));
  bokehCache.set(key, { items, count, W, H });
  return items;
};

export const drawBokeh = (ctx, scene, env, t) => {
  const strength = scene.project.effects.bokeh;
  if (!strength) return;
  const { width: W, height: H } = env;
  const short = Math.min(W, H);
  const accent = scene.project.theme.accent;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (const b of getBokeh(scene, W, H)) {
    // 위로 천천히 떠오르며 화면을 벗어나면 아래에서 다시 들어온다
    const y = ((b.y - t * b.speed) % 1 + 1) % 1;
    const x = b.x + Math.sin(t * b.drift * TAU + b.phase) * 0.03;
    const r = short * b.r;
    const px = x * W;
    const py = y * H;

    const grad = ctx.createRadialGradient(px, py, 0, px, py, r);
    const core = b.warm > 0.45 ? accent : '#ffffff';
    grad.addColorStop(0, rgba(core, b.alpha * strength * 0.55));
    grad.addColorStop(0.55, rgba(core, b.alpha * strength * 0.16));
    grad.addColorStop(1, rgba(core, 0));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(px, py, r, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
};

/** 화면 모서리에서 스며드는 따뜻한 빛 — 천천히 밝기가 오르내린다 */
export const drawLightLeak = (ctx, scene, env, t) => {
  const strength = scene.project.effects.lightLeak;
  if (!strength) return;
  const { width: W, height: H } = env;
  const accent = scene.project.theme.accent;

  const pulseA = 0.5 + 0.5 * Math.sin(t * 0.18);
  const pulseB = 0.5 + 0.5 * Math.sin(t * 0.13 + 2.1);

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const g1 = ctx.createRadialGradient(W * 0.08, H * 0.1, 0, W * 0.08, H * 0.1, W * 0.55);
  g1.addColorStop(0, rgba(accent, strength * 0.5 * pulseA));
  g1.addColorStop(1, rgba(accent, 0));
  ctx.fillStyle = g1;
  ctx.fillRect(0, 0, W, H);

  const g2 = ctx.createRadialGradient(W * 0.95, H * 0.82, 0, W * 0.95, H * 0.82, W * 0.5);
  g2.addColorStop(0, rgba('#ffd9a8', strength * 0.38 * pulseB));
  g2.addColorStop(1, rgba('#ffd9a8', 0));
  ctx.fillStyle = g2;
  ctx.fillRect(0, 0, W, H);

  ctx.restore();
};

/**
 * 필름 그레인.
 * 픽셀 단위 노이즈는 4K에서 너무 느려서, 작은 노이즈 타일을 만들어 타일링한다.
 * 프레임마다 타일 오프셋만 바꿔 흔들리는 느낌을 낸다.
 */
const grainCache = new WeakMap();

export const drawGrain = (ctx, scene, env, t) => {
  const strength = scene.project.effects.grain;
  if (!strength) return;
  const { width: W, height: H } = env;

  let tile = grainCache.get(scene);
  if (!tile) {
    const size = 256;
    const canvas = env.createCanvas(size, size);
    const tctx = canvas.getContext('2d');
    const img = tctx.createImageData(size, size);
    const rng = makeRng((scene.seed ?? 1) + 31337);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 110 + rng() * 90;
      img.data[i] = v;
      img.data[i + 1] = v;
      img.data[i + 2] = v;
      img.data[i + 3] = 255;
    }
    tctx.putImageData(img, 0, 0);
    tile = { canvas, size };
    grainCache.set(scene, tile);
  }

  // 프레임마다 8단계로 순환하는 오프셋 (완전 랜덤이면 결정성이 깨진다)
  const step = Math.floor(t * 24) % 8;
  const ox = -(step * 37) % tile.size;
  const oy = -(step * 61) % tile.size;

  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = strength;
  const pattern = ctx.createPattern(tile.canvas, 'repeat');
  if (pattern) {
    ctx.translate(ox, oy);
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, W + tile.size, H + tile.size);
  }
  ctx.restore();
};

/** 하단 재생 진행 바 — 유튜브 플레이어 느낌 */
export const drawProgressBar = (ctx, scene, env, t) => {
  if (!scene.project.effects.progressBar) return;
  const { width: W, height: H } = env;
  const h = Math.max(3, H * 0.005);
  const y = H - h;
  const p = clamp(t / scene.total);

  ctx.save();
  ctx.fillStyle = 'rgba(255,255,255,0.16)';
  ctx.fillRect(0, y, W, h);
  ctx.fillStyle = scene.project.theme.accent;
  ctx.fillRect(0, y, W * p, h);

  // 진행 위치 손잡이
  ctx.beginPath();
  ctx.arc(W * p, y + h / 2, h * 1.5, 0, TAU);
  ctx.fillStyle = scene.project.theme.ink;
  ctx.globalAlpha = 0.9;
  ctx.fill();

  // 경과/전체 시간
  const fs = Math.max(11, H * 0.016);
  ctx.globalAlpha = 0.55;
  ctx.font = cssFont(scene.project.theme, fs, 400, 'display');
  ctx.fillStyle = scene.project.theme.ink;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`${formatTime(t)} / ${formatTime(scene.total)}`, W - W * 0.02, y - h * 1.6);
  ctx.restore();
};

/** 카드가 지금 얼마나 진하게 떠 있는지 (0~1) */
const cardAlpha = (card, startT, t) => {
  if (!card?.enabled) return 0;
  const dur = card.duration;
  const local = t - startT;
  if (local < -0.2 || local > dur + 0.2) return 0;
  return fadeEnvelope(local, dur, Math.min(1.4, dur * 0.3), Math.min(1.6, dur * 0.35));
};

/**
 * 인트로/아웃트로 문구가 가사 자리를 얼마나 차지하고 있는지.
 *
 * 문구와 가사가 같은 자리에 앉으므로 둘이 겹치면 글자가 포개진다.
 * 레이아웃이 가사를 그리기 전에 이 값을 알아야 해서 따로 뽑아둔다.
 */
export const titleCardOcclusion = (scene, t) => {
  const { intro, outro } = scene.project;
  let a = 0;
  if (intro?.enabled && intro.placement !== 'center') {
    a = Math.max(a, cardAlpha(intro, 0, t));
  }
  if (outro?.enabled && outro.placement !== 'center') {
    a = Math.max(a, cardAlpha(outro, scene.total - outro.duration, t));
  }
  return clamp(a);
};

/** 인트로/아웃트로 타이틀 카드 */
const drawTitleCard = (ctx, scene, env, card, startT, t, dimBackdrop) => {
  const alpha = cardAlpha(card, startT, t);
  if (alpha <= 0.002) return;
  const local = t - startT;

  const { width: W, height: H } = env;
  const { theme } = scene.project;

  /*
   * 문구는 가사가 놓이는 자리에 그대로 앉힌다.
   * 화면 한가운데에 따로 띄우면 인트로만 다른 화면처럼 붕 떠 보이고,
   * 곡이 시작되는 순간 글자가 아래로 순간이동한다.
   * 레이아웃이 남긴 앵커를 쓰면 첫 가사가 바로 그 자리에서 이어진다.
   */
  const anchor = card.placement === 'center' ? null : env.lyricAnchor;
  const align = anchor?.align || 'center';
  const cx = anchor?.cx ?? W / 2;
  const baseY = anchor?.baseY ?? H * 0.52;
  const unit = anchor?.size ?? Math.min(W, H) * 0.04;
  const rise = (1 - easeOutCubic(clamp(local / 1.2))) * unit * 0.6;

  ctx.save();
  ctx.globalAlpha = alpha;

  if (dimBackdrop > 0) {
    ctx.fillStyle = `rgba(0,0,0,${dimBackdrop})`;
    ctx.fillRect(0, 0, W, H);
  }

  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = unit * 0.5;

  // 가사 한 줄이 앉는 자리에 제목을, 번역이 앉는 자리에 부제를 둔다
  const titleSize = unit * 1.25;
  const subSize = unit * 0.7;
  const capSize = unit * 0.5;
  const titleY = baseY - subSize * 1.5 + rise;

  if (card.caption) {
    ctx.font = cssFont(theme, capSize, 400, 'display');
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${capSize * 0.32}px`;
    ctx.fillStyle = rgba(theme.accent, 0.95);
    ctx.fillText(card.caption.toUpperCase(), cx, titleY - titleSize * 0.95);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }

  if (card.title) {
    ctx.font = cssFont(theme, titleSize, 300, 'body');
    ctx.fillStyle = theme.ink;
    ctx.fillText(card.title, cx, titleY);
  }

  if (card.subtitle) {
    ctx.font = cssFont(theme, subSize, 300, 'display');
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${subSize * 0.14}px`;
    ctx.fillStyle = rgba(theme.ink, 0.82);
    ctx.fillText(card.subtitle, cx, baseY + subSize * 0.35 + rise);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  }

  ctx.restore();
};

export const drawIntro = (ctx, scene, env, t) => {
  const intro = scene.project.intro;
  if (!intro?.enabled) return;
  // 인트로는 초반에 배경을 좀 더 어둡게 눌러준다
  const dim = 0.3 * (1 - smoothstep(norm(t, intro.duration * 0.5, intro.duration)));
  drawTitleCard(ctx, scene, env, intro, 0, t, dim);
};

export const drawOutro = (ctx, scene, env, t) => {
  const outro = scene.project.outro;
  if (!outro?.enabled) return;
  const start = scene.total - outro.duration;
  const dim = 0.35 * smoothstep(norm(t, start, start + 1.5));
  drawTitleCard(ctx, scene, env, outro, start, t, dim);
};

/** 위아래 시네마 레터박스 */
export const drawLetterbox = (ctx, scene, env) => {
  const ratio = scene.project.effects.letterbox;
  if (!ratio) return;
  const { width: W, height: H } = env;
  const bar = H * clamp(ratio, 0, 0.25);
  ctx.save();
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, bar);
  ctx.fillRect(0, H - bar, W, bar);
  ctx.restore();
};

export const drawWatermark = (ctx, scene, env) => {
  const text = scene.project.effects.watermark;
  if (!text) return;
  const { width: W, height: H } = env;
  const fs = H * 0.019;
  ctx.save();
  ctx.globalAlpha = 0.42;
  ctx.font = cssFont(scene.project.theme, fs, 300, 'display');
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${fs * 0.2}px`;
  ctx.fillStyle = scene.project.theme.ink;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(text, W * 0.025, H * 0.028);
  ctx.restore();
};

/** 전체 페이드 인/아웃 (영상 맨 앞뒤 검은 화면) */
export const drawMasterFade = (ctx, scene, env, t) => {
  const fadeIn = 0.8;
  const fadeOut = 1.2;
  const a = 1 - fadeEnvelope(t, scene.total, fadeIn, fadeOut);
  if (a <= 0.002) return;
  const { width: W, height: H } = env;
  ctx.save();
  ctx.fillStyle = `rgba(0,0,0,${a})`;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
};
