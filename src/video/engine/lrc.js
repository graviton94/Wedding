/**
 * LRC 자막 파서.
 *
 * 지원 문법
 *   [mm:ss.xx] 가사            — 표준 라인 태그
 *   [mm:ss.xx][mm:ss.xx] 가사  — 한 줄에 여러 시각 (후렴 반복)
 *   [offset:-500]              — 전역 오프셋 (ms, 음수면 자막이 빨라짐)
 *   [ti:] [ar:] [al:] [by:]    — 메타데이터 (파싱만 하고 렌더엔 미사용)
 *   빈 가사 라인               — 간주(instrumental) 구간 표시로 사용
 *
 * 저작권 주의: 이 저장소에는 가사 텍스트를 커밋하지 않는다.
 * 사용자가 직접 준비한 .lrc 파일을 public/video/lyrics/ 에 넣어 참조한다.
 */

const TIME_TAG = /\[(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?\]/g;
const META_TAG = /^\[(ti|ar|al|by|offset|length|re|ve):(.*)\]$/i;

const toSeconds = (mm, ss, frac) => {
  let f = 0;
  if (frac != null) {
    // .5 → 0.5초, .50 → 0.50초, .500 → 0.500초
    f = Number(`0.${frac}`);
    if (Number.isNaN(f)) f = 0;
  }
  return Number(mm) * 60 + Number(ss) + f;
};

/**
 * @param {string} text .lrc 원문
 * @returns {{ meta: object, lines: Array<{time:number, end:number, text:string, words:Array}> }}
 */
export const parseLRC = (text) => {
  const meta = {};
  const raw = [];
  if (typeof text !== 'string' || !text.trim()) return { meta, lines: [] };

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line) continue;
    // 주석 — 템플릿 설명문이 자막으로 새어 들어가지 않도록 먼저 걸러낸다
    if (line.startsWith('#') || line.startsWith('//')) continue;

    const metaMatch = line.match(META_TAG);
    if (metaMatch) {
      meta[metaMatch[1].toLowerCase()] = metaMatch[2].trim();
      continue;
    }

    TIME_TAG.lastIndex = 0;
    const stamps = [];
    let m;
    while ((m = TIME_TAG.exec(line)) !== null) {
      // 태그가 줄 앞부분에 연속으로 붙어있는 경우만 시간 태그로 인정
      if (m.index > line.lastIndexOf(']', m.index) + 1 && stamps.length) break;
      stamps.push({ time: toSeconds(m[1], m[2], m[3]), end: m.index + m[0].length });
    }
    if (!stamps.length) continue;

    const body = line.slice(stamps[stamps.length - 1].end);
    const { text: clean, words } = parseWordTags(body);
    for (const s of stamps) {
      raw.push({ time: s.time, text: clean, words: words.map((w) => ({ ...w })) });
    }
  }

  raw.sort((a, b) => a.time - b.time);

  const offset = Number(meta.offset || 0) / 1000;
  const lines = raw.map((l, i) => {
    const time = Math.max(0, l.time - offset);
    const nextTime = raw[i + 1] ? Math.max(0, raw[i + 1].time - offset) : time + 5;
    return {
      time,
      end: nextTime,
      text: l.text,
      words: l.words.map((w) => ({ ...w, time: Math.max(0, w.time - offset) })),
    };
  });

  return { meta, lines };
};

/**
 * Enhanced LRC 워드 태그 파싱: "<00:12.30>사랑 <00:13.10>하는"
 * 워드 타이밍이 없으면 words는 빈 배열 → 라인 단위 렌더로 폴백
 */
const WORD_TAG = /<(\d{1,3}):(\d{1,2})(?:[.:](\d{1,3}))?>/g;

const parseWordTags = (body) => {
  if (!body.includes('<')) return { text: body.trim(), words: [] };

  const words = [];
  let text = '';
  let last = 0;
  let pending = null;
  let m;
  WORD_TAG.lastIndex = 0;

  while ((m = WORD_TAG.exec(body)) !== null) {
    const chunk = body.slice(last, m.index);
    if (pending) {
      pending.text = chunk;
      pending.charEnd = text.length + chunk.length;
      if (chunk) words.push(pending);
    }
    text += chunk;
    pending = { time: toSeconds(m[1], m[2], m[3]), charStart: text.length, charEnd: text.length, text: '' };
    last = m.index + m[0].length;
  }

  const tail = body.slice(last);
  if (pending) {
    pending.text = tail;
    pending.charEnd = text.length + tail.length;
    if (tail.trim()) words.push(pending);
  }
  text += tail;

  return { text: text.trim(), words };
};

/**
 * 현재 시각에 해당하는 자막 인덱스. 없으면 -1.
 * lines는 time 오름차순 정렬 전제 → 이진 탐색.
 */
export const findLineIndex = (lines, time) => {
  if (!lines || !lines.length) return -1;
  let lo = 0;
  let hi = lines.length - 1;
  let found = -1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (lines[mid].time <= time) {
      found = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return found;
};

/** 디버그/스튜디오 목록용 — 초 → "mm:ss.xx" */
export const toLrcTime = (sec) => {
  const s = Math.max(0, sec);
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(Math.floor(s % 60)).padStart(2, '0');
  const cs = String(Math.round((s % 1) * 100)).padStart(2, '0');
  return `${mm}:${ss}.${cs}`;
};

/** 스튜디오에서 편집한 라인 배열을 다시 .lrc 문자열로 직렬화 */
export const serializeLRC = (lines) =>
  (lines || [])
    .slice()
    .sort((a, b) => a.time - b.time)
    .map((l) => `[${toLrcTime(l.time)}]${l.text || ''}`)
    .join('\n');
