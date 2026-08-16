/**
 * 렌더 엔진 공용 유틸 — 브라우저/Node 양쪽에서 동일하게 동작해야 하므로
 * DOM 전용 API와 Math.random()을 절대 쓰지 않는다. (프레임 결정성 보장)
 */

export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a, b, t) => a + (b - a) * t;

/** a→b 구간을 0→1로 정규화 (a===b면 0) */
export const norm = (v, a, b) => (b === a ? 0 : clamp((v - a) / (b - a)));

/** smoothstep 보간 — 페이드/드리프트 기본값 */
export const smoothstep = (t) => {
  const x = clamp(t);
  return x * x * (3 - 2 * x);
};

export const easeOutCubic = (t) => 1 - Math.pow(1 - clamp(t), 3);
export const easeInCubic = (t) => Math.pow(clamp(t), 3);
export const easeInOutCubic = (t) => {
  const x = clamp(t);
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
};
export const easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  const x = clamp(t);
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};

export const EASINGS = {
  linear: (t) => clamp(t),
  smoothstep,
  easeOutCubic,
  easeInCubic,
  easeInOutCubic,
  easeOutBack,
};

/** 0→1→0 사다리꼴 페이드. dur 전체 길이에서 앞뒤 fade초씩 인/아웃 */
export const fadeEnvelope = (t, dur, fadeIn, fadeOut = fadeIn) => {
  if (dur <= 0) return 0;
  const rise = fadeIn > 0 ? norm(t, 0, fadeIn) : t >= 0 ? 1 : 0;
  const fall = fadeOut > 0 ? norm(t, dur, dur - fadeOut) : t <= dur ? 1 : 0;
  return smoothstep(clamp(Math.min(rise, fall)));
};

/**
 * 시드 기반 결정적 난수 (mulberry32).
 * 파티클/보케 배치에 사용 — 같은 시드면 브라우저와 Node가 같은 그림을 그린다.
 */
export const makeRng = (seed) => {
  let a = (seed >>> 0) || 1;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/** #rrggbb / #rgb → {r,g,b}. 실패 시 흰색 */
export const hexToRgb = (hex) => {
  if (typeof hex !== 'string') return { r: 255, g: 255, b: 255 };
  let h = hex.trim().replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length !== 6 || /[^0-9a-f]/i.test(h)) return { r: 255, g: 255, b: 255 };
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
};

export const rgba = (hex, alpha) => {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
};

/**
 * 이미지를 지정 사각형에 cover 배치할 때의 소스 crop 계산.
 * focusX/focusY(0~1)로 크롭 기준점 이동 (인물 사진은 보통 0.5, 0.4)
 */
export const coverRect = (imgW, imgH, boxW, boxH, focusX = 0.5, focusY = 0.5) => {
  const scale = Math.max(boxW / imgW, boxH / imgH);
  const sw = boxW / scale;
  const sh = boxH / scale;
  const sx = clamp(focusX, 0, 1) * (imgW - sw);
  const sy = clamp(focusY, 0, 1) * (imgH - sh);
  return { sx, sy, sw, sh };
};

/** 이미지를 (x,y,w,h)에 cover로 그린다 */
export const drawCover = (ctx, img, x, y, w, h, focusX = 0.5, focusY = 0.5) => {
  if (!img || !img.width || !img.height) return;
  const { sx, sy, sw, sh } = coverRect(img.width, img.height, w, h, focusX, focusY);
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
};

/**
 * 이미지 전체가 들어가는 배치(contain) 계산.
 * 사진 비율과 상자 비율이 다르면 남는 쪽에 여백이 생긴다.
 */
export const containRect = (imgW, imgH, boxW, boxH) => {
  const scale = Math.min(boxW / imgW, boxH / imgH);
  const w = imgW * scale;
  const h = imgH * scale;
  return { x: (boxW - w) / 2, y: (boxH - h) / 2, w, h };
};

/** 이미지 전체를 (x,y,w,h) 안에 담아 그린다. 그린 실제 사각형을 돌려준다. */
export const drawContain = (ctx, img, x, y, w, h) => {
  if (!img || !img.width || !img.height) return null;
  const r = containRect(img.width, img.height, w, h);
  ctx.drawImage(img, x + r.x, y + r.y, r.w, r.h);
  return { x: x + r.x, y: y + r.y, w: r.w, h: r.h };
};

/** 둥근 사각형 path (roundRect 폴리필 겸용) */
export const roundRectPath = (ctx, x, y, w, h, r) => {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  if (typeof ctx.roundRect === 'function') {
    ctx.roundRect(x, y, w, h, radius);
    return;
  }
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
};

/**
 * 텍스트 줄바꿈 — 공백 단위로 자르되, 한 어절이 폭을 넘으면 글자 단위로 쪼갠다.
 * (한국어는 어절이 길어 글자 단위 폴백이 필요)
 */
export const wrapText = (ctx, text, maxWidth) => {
  const src = String(text ?? '').trim();
  if (!src) return [];
  if (ctx.measureText(src).width <= maxWidth) return [src];

  const lines = [];
  let line = '';
  const pushLine = () => {
    if (line) lines.push(line);
    line = '';
  };

  for (const word of src.split(/\s+/)) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      line = candidate;
      continue;
    }
    pushLine();
    if (ctx.measureText(word).width <= maxWidth) {
      line = word;
      continue;
    }
    // 한 어절이 통째로 넘칠 때: 글자 단위로 강제 분할
    let chunk = '';
    for (const ch of word) {
      if (ctx.measureText(chunk + ch).width > maxWidth && chunk) {
        lines.push(chunk);
        chunk = ch;
      } else {
        chunk += ch;
      }
    }
    line = chunk;
  }
  pushLine();
  return lines;
};

/**
 * CSS font 문자열 생성.
 *
 * 반드시 국문 폰트를 폴백으로 붙인다 — Cormorant Garamond 같은 라틴 전용 폰트에
 * 한글을 넣으면 두부(□□□)로 렌더된다. 영문 우선/국문 우선만 순서로 구분한다.
 *
 * @param {object} theme
 * @param {number} px
 * @param {number|string} weight
 * @param {'display'|'body'|'script'} face 우선 적용할 서체
 */
export const cssFont = (theme, px, weight = 400, face = 'body') => {
  const display = `"${theme.fontDisplay}"`;
  const body = `"${theme.fontBody}"`;
  const script = `"${theme.fontScript}"`;
  const accent = theme.fontAccent ? `"${theme.fontAccent}"` : display;

  const stacks = {
    display: `${display}, ${body}, serif`,
    script: `${script}, ${display}, ${body}, serif`,
    accent: `${accent}, ${display}, ${body}, serif`,
    body: `${body}, ${display}, serif`,
  };

  /*
   * 이탤릭은 가짜 패밀리명("... Italic")이 아니라 CSS font-style로 낸다.
   * 브라우저에는 그런 패밀리가 없어서, 이름을 지어내면 미리보기는 로만으로
   * 떨어지고 mp4만 이탤릭이 되어 둘이 어긋난다.
   * Node 쪽은 로만/이탤릭 파일을 같은 패밀리명으로 등록해두면 이 키워드를 따른다.
   */
  const italic = face === 'accent' && theme.accentItalic ? 'italic ' : '';
  return `${italic}${weight} ${px}px ${stacks[face] || stacks.body}`;
};

/** 초 → "M:SS" */
export const formatTime = (sec) => {
  const s = Math.max(0, Math.floor(sec || 0));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
