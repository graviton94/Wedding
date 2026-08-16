/**
 * 세로로 흐르는 가사 목록.
 *
 * 유튜브 가사 영상에서 가장 익숙한 형태 — 여러 줄이 한꺼번에 보이고,
 * 현재 줄만 밝게, 지나간 줄과 올 줄은 흐리게. 곡이 진행되면 목록 전체가
 * 위로 부드럽게 밀려 올라간다.
 *
 * "한 줄씩 갈아끼우는" 하단 자막과 달리 앞뒤 맥락이 같이 보여서
 * 가사가 주인공인 구성에 맞는다.
 */

import { clamp, cssFont, norm, smoothstep, wrapText } from '../util.js';
import { findLineIndex } from '../lrc.js';

/**
 * @param {object} opts
 *   cx, top, height  자막이 차지할 영역
 *   size             기준 글자 크기(px)
 *   gap              줄 간격 (글자 크기 배수)
 *   align            'left' | 'center' | 'right'
 *   visible          위아래로 몇 줄까지 보여줄지
 */
export const drawLyricScroll = (ctx, scene, env, t, opts) => {
  const L = scene.project.lyrics;
  if (!L.enabled) return;
  const lines = scene.lyrics.lines;
  if (!lines.length) return;

  const idx = findLineIndex(lines, t);
  if (idx < 0) return;

  const { cx, top, height, size, align = 'center' } = opts;
  const fade = env.lyricFade ?? 1;
  if (fade <= 0.002) return;
  const gap = opts.gap ?? 2.05;
  const visible = opts.visible ?? 3;
  const step = size * gap;
  const centerY = top + height / 2;

  /*
   * 스크롤 위치를 "현재 줄 인덱스"로만 잡으면 줄이 바뀔 때 뚝 끊긴다.
   * 현재 줄에서 다음 줄로 넘어가는 구간을 보간해 목록이 미끄러지게 만든다.
   */
  const next = lines[idx + 1];
  const slide = next
    ? smoothstep(norm(t, next.time - 0.55, next.time))
    : 0;
  const scrollPos = idx + slide;

  ctx.save();
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';

  for (let i = idx - visible; i <= idx + visible + 1; i++) {
    if (i < 0 || i >= lines.length) continue;
    const item = lines[i];
    if (!item.text) continue; // 간주(빈 줄)는 목록에서 자리만 차지하지 않게 건너뛴다

    const offset = i - scrollPos;
    const y = centerY + offset * step;
    if (y < top - step || y > top + height + step) continue;

    // 중앙에서 멀어질수록 흐려지고 살짝 작아진다
    const dist = Math.abs(offset);
    const focus = clamp(1 - dist / (visible + 0.6));
    const isActive = i === idx;

    const scale = isActive ? 1 : 0.82 + 0.12 * focus;
    const px = size * scale;
    const alpha = isActive
      ? 1
      : clamp(0.14 + 0.42 * focus * focus);

    ctx.globalAlpha = alpha * fade;
    ctx.font = cssFont(
      scene.project.theme,
      px,
      isActive ? (L.weight ?? 500) : 300,
      isActive ? (L.face ?? 'body') : 'body',
    );
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${px * (L.tracking ?? 0.02)}px`;

    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = px * 0.5;
    ctx.fillStyle = isActive ? L.color : (L.dimColor || L.color);

    // 긴 줄은 두 줄까지만 접어서 목록 리듬이 무너지지 않게 한다
    const wrapped = wrapText(ctx, item.text, opts.maxWidth).slice(0, 2);
    wrapped.forEach((txt, k) => {
      ctx.fillText(txt, cx, y + (k - (wrapped.length - 1) / 2) * px * 1.18);
    });

    // 현재 줄에만 번역을 붙인다 — 전부 붙이면 목록이 두 배로 길어져 산만하다
    if (isActive && item.translation) {
      const tPx = px * (L.translationScale ?? 0.62);
      ctx.font = cssFont(scene.project.theme, tPx, 300, L.translationFace ?? 'body');
      if ('letterSpacing' in ctx) ctx.letterSpacing = `${tPx * 0.01}px`;
      ctx.globalAlpha = alpha * fade * (L.translationOpacity ?? 0.7);
      ctx.fillStyle = L.translationColor || L.color;
      const tWrapped = wrapText(ctx, item.translation, opts.maxWidth).slice(0, 2);
      const base = y + (wrapped.length * px * 1.18) / 2 + tPx * 0.85;
      tWrapped.forEach((txt, k) => ctx.fillText(txt, cx, base + k * tPx * 1.25));
    }

    ctx.shadowBlur = 0;
  }

  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.restore();
};
