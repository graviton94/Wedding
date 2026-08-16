/**
 * 하단 가사 자막 레이어.
 *
 * - 현재 줄: 크게, 밝게. 등장할 때 아래에서 올라오며 페이드 인.
 * - 다음 줄: 작고 흐리게 미리보기.
 * - enhanced LRC(<mm:ss.xx> 워드 태그)가 있으면 단어 단위 하이라이트(가라오케).
 *
 * 가사 텍스트 자체는 저장소에 포함하지 않는다. 사용자가 준비한 .lrc를 읽어 렌더한다.
 */

import { clamp, cssFont, norm, rgba, smoothstep, wrapText } from '../util.js';
import { findLineIndex } from '../lrc.js';

const fontFor = (scene, px, weight = 400, face = 'body') =>
  cssFont(scene.project.theme, px, weight, face);

/** 한 줄을 그리고 그린 높이를 돌려준다 */
const paintLines = (ctx, lines, cx, baselineY, lineHeight, align) => {
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  lines.forEach((text, i) => {
    ctx.fillText(text, cx, baselineY + i * lineHeight);
  });
};

/**
 * 가라오케: 이미 지나간 글자만 강조색으로 덧칠한다.
 * clip으로 "지나간 폭"만큼 잘라 같은 텍스트를 한 번 더 그리는 방식.
 */
const paintKaraoke = (ctx, line, text, x, y, t, color, maxWidth, fontSize) => {
  if (!line.words?.length) return;
  const width = Math.min(ctx.measureText(text).width, maxWidth);

  // 현재 시각이 몇 번째 단어까지 지났는지 → 문자 진행률
  let charProgress = 0;
  for (let i = 0; i < line.words.length; i++) {
    const w = line.words[i];
    const nextTime = line.words[i + 1]?.time ?? line.end;
    if (t >= nextTime) {
      charProgress = w.charEnd;
    } else if (t >= w.time) {
      const inner = norm(t, w.time, nextTime);
      charProgress = w.charStart + (w.charEnd - w.charStart) * inner;
      break;
    } else {
      break;
    }
  }
  const ratio = clamp(charProgress / Math.max(1, text.length));
  if (ratio <= 0) return;

  // 진행한 폭만큼만 잘라서 같은 글자를 강조색으로 덧그린다.
  // 세로 범위는 글자 크기 기준 — 폭을 높이로 쓰면 짧은 줄에서 잘린다.
  const left = ctx.textAlign === 'center' ? x - width / 2 : ctx.textAlign === 'right' ? x - width : x;
  ctx.save();
  ctx.beginPath();
  ctx.rect(left - 4, y - fontSize * 1.4, width * ratio + 4, fontSize * 2.2);
  ctx.clip();
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  ctx.restore();
};

export const drawLyrics = (ctx, scene, env, t) => {
  const L = scene.project.lyrics;
  if (!L.enabled) return;
  const lines = scene.lyrics.lines;
  if (!lines.length) return;

  const { width: W, height: H } = env;
  const idx = findLineIndex(lines, t);
  if (idx < 0) return;

  const line = lines[idx];
  const next = lines[idx + 1];
  const maxWidth = W * L.maxWidthRatio;
  const size = H * L.fontSize;
  const lineHeight = size * L.lineHeight;
  const cx = L.align === 'left' ? W * 0.11 : L.align === 'right' ? W * 0.89 : W / 2;
  const baseY = H * (1 - L.bottomRatio);

  // 줄 등장 애니메이션 (0.45초)
  const inT = smoothstep(norm(t, line.time, line.time + 0.45));
  // 줄이 끝나기 직전 살짝 흐려짐
  const outT = line.end > line.time
    ? 1 - smoothstep(norm(t, line.end - 0.25, line.end)) * 0.35
    : 1;

  ctx.save();

  // 자막 뒤 반투명 판 (선택)
  if (L.plate > 0) {
    const plateH = lineHeight * 2.6;
    ctx.fillStyle = `rgba(0,0,0,${L.plate})`;
    ctx.fillRect(0, baseY - plateH * 0.72, W, plateH);
  }

  const rise = L.animation === 'rise' ? (1 - inT) * size * 0.5 : 0;
  const alpha = (L.animation === 'none' ? 1 : inT) * outT;
  const hasTranslation = Boolean(line.translation);

  // ---- 현재 줄 (원문) ----
  if (line.text) {
    ctx.font = fontFor(scene, size, L.weight ?? 500, L.face ?? 'body');
    if ('letterSpacing' in ctx) ctx.letterSpacing = `${size * (L.tracking ?? 0.012)}px`;

    const wrapped = wrapText(ctx, line.text, maxWidth);
    // 번역이 붙으면 원문을 그만큼 위로 올려 두 줄이 자막 영역 안에 들어오게 한다
    const tSize = size * (L.translationScale ?? 0.68);
    const shift = hasTranslation ? tSize * (L.translationGap ?? 1.5) : 0;
    const y = baseY - (wrapped.length - 1) * lineHeight - shift + rise;

    ctx.globalAlpha = alpha;

    if (L.glow > 0) {
      ctx.shadowColor = `rgba(0,0,0,${0.75 * L.glow + 0.25})`;
      ctx.shadowBlur = size * 0.55;
      ctx.shadowOffsetY = size * 0.04;
    }
    ctx.fillStyle = L.color;
    paintLines(ctx, wrapped, cx, y, lineHeight, L.align);

    // 가라오케 하이라이트 — 한 줄로 떨어질 때만 (줄바꿈되면 글자 위치가 어긋남)
    if (L.karaoke && line.words?.length && wrapped.length === 1) {
      ctx.shadowBlur = size * 0.3;
      ctx.shadowColor = rgba(L.karaokeColor, 0.5);
      paintKaraoke(ctx, line, wrapped[0], cx, y, t, L.karaokeColor, maxWidth, size);
    }

    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';

    // ---- 번역 줄 ----
    if (hasTranslation) {
      ctx.font = fontFor(scene, tSize, L.translationWeight ?? 300, L.translationFace ?? 'body');
      if ('letterSpacing' in ctx) ctx.letterSpacing = `${tSize * 0.01}px`;
      ctx.globalAlpha = alpha * (L.translationOpacity ?? 0.72);
      ctx.shadowColor = `rgba(0,0,0,${0.7 * L.glow + 0.25})`;
      ctx.shadowBlur = tSize * 0.5;
      ctx.fillStyle = L.translationColor || L.color;
      paintLines(
        ctx,
        wrapText(ctx, line.translation, maxWidth),
        cx,
        baseY + rise,
        tSize * 1.3,
        L.align,
      );
      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';
    }
  }

  // ---- 다음 줄 미리보기 ----
  // 번역까지 떠 있을 때는 생략한다 — 세 줄이 겹치면 산만해진다
  if (L.showNext && !hasTranslation && next?.text) {
    const nSize = size * 0.68;
    ctx.font = fontFor(scene, nSize, 400);
    if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
    const nWrapped = wrapText(ctx, next.text, maxWidth).slice(0, 1);
    // 다음 줄이 다가올수록 진해진다
    const approach = 0.55 + 0.45 * smoothstep(norm(t, next.time - 1.4, next.time));
    ctx.globalAlpha = L.dimOpacity * approach * inT;
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = nSize * 0.5;
    ctx.fillStyle = L.dimColor;
    paintLines(ctx, nWrapped, cx, baseY + lineHeight * 1.05, lineHeight, L.align);
  }

  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.restore();
};

/** 간주 구간에서 보여줄 음표 인디케이터 (가사 없는 라인 = 간주) */
export const drawInterlude = (ctx, scene, env, t) => {
  const L = scene.project.lyrics;
  if (!L.enabled) return;
  const lines = scene.lyrics.lines;
  const idx = findLineIndex(lines, t);
  if (idx < 0) return;
  const line = lines[idx];
  if (line.text) return;

  const span = line.end - line.time;
  if (span < 2.5) return;

  const { width: W, height: H } = env;
  const size = H * L.fontSize;
  const cx = W / 2;
  const y = H * (1 - L.bottomRatio);
  const alpha = smoothstep(norm(t, line.time, line.time + 0.5))
    * (1 - smoothstep(norm(t, line.end - 0.5, line.end)));

  ctx.save();
  ctx.globalAlpha = alpha * 0.75;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  for (let i = 0; i < 3; i++) {
    // 세 점이 순서대로 커졌다 작아진다
    const beat = 0.5 + 0.5 * Math.sin(t * 2.4 - i * 0.9);
    const r = size * (0.13 + 0.07 * beat);
    ctx.globalAlpha = alpha * (0.35 + 0.5 * beat);
    ctx.fillStyle = scene.project.theme.accent;
    ctx.beginPath();
    ctx.arc(cx + (i - 1) * size * 0.7, y - size * 0.25, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
};
