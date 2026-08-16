/**
 * 사진 슬롯 타임라인 계산.
 * 시간 t를 넣으면 "지금 몇 번째 사진이고, 다음 사진으로 얼마나 넘어갔는지"를 돌려준다.
 * 렌더러/스튜디오 양쪽이 이 결과만 보고 그리므로 프레임 결정성이 보장된다.
 */

import { clamp, makeRng, norm, smoothstep } from './util.js';
import { parseLRC } from './lrc.js';

/** order:'shuffle'일 때 시드 기반 Fisher-Yates (Math.random 미사용) */
const shuffled = (arr, seed) => {
  const out = arr.slice();
  const rng = makeRng(seed);
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

/**
 * @param {object} project
 * @param {number} totalDuration 영상 전체 길이(초)
 * @returns {{ slots: Array, photos: Array, total: number }}
 */
export const buildPhotoTimeline = (project, totalDuration) => {
  const p = project.photos;
  const source = (p.items || []).filter((it) => it && it.src);
  if (!source.length) return { slots: [], photos: [], total: totalDuration };

  const ordered = p.order === 'shuffle' ? shuffled(source, project.seed ?? 1) : source;

  const introEnd = project.intro?.enabled ? Math.max(0, project.intro.duration) : 0;
  const outroStart = totalDuration - (project.outro?.enabled ? Math.max(0, project.outro.duration) : 0);
  // 사진 슬라이드쇼는 인트로가 끝나기 전에 미리 깔려 있어야 자연스럽다
  const showStart = Math.max(0, introEnd * 0.45);
  const showEnd = Math.max(showStart + 1, outroStart + (project.outro?.enabled ? 1.5 : 0));

  const slots = [];
  let t = showStart;
  let i = 0;
  const guard = 2000; // 무한 루프 방지

  while (t < showEnd && slots.length < guard) {
    const photo = ordered[i % ordered.length];
    if (!p.loop && i >= ordered.length) break;
    const dur = Math.max(0.5, photo.duration || p.duration);
    slots.push({
      index: slots.length,
      photo,
      src: photo.src,
      start: t,
      end: Math.min(t + dur, showEnd),
      duration: dur,
    });
    t += dur;
    i++;
  }

  // loop=false로 사진이 일찍 끝나면 마지막 사진을 끝까지 늘린다
  if (slots.length && slots[slots.length - 1].end < showEnd) {
    slots[slots.length - 1].end = showEnd;
  }

  return { slots, photos: ordered, total: totalDuration };
};

/**
 * 시각 t에서의 사진 상태.
 * @returns {{ current, next, prev, mix, slotIndex, localT, progress }}
 *   mix: 0=current 전체, 1=next로 완전히 전환됨 (크로스페이드 진행도)
 */
export const photoStateAt = (timeline, project, t) => {
  const { slots } = timeline;
  if (!slots.length) {
    return { current: null, next: null, prev: null, mix: 0, slotIndex: -1, localT: 0, progress: 0 };
  }

  // 선형 스캔 대신 이진 탐색 (긴 영상에서 프레임당 비용 절감)
  let lo = 0;
  let hi = slots.length - 1;
  let idx = 0;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (slots[mid].start <= t) {
      idx = mid;
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }

  const slot = slots[idx];
  const nextSlot = slots[idx + 1] || null;
  const prevSlot = slots[idx - 1] || null;
  const cf = Math.max(0, Math.min(project.photos.crossfade, slot.end - slot.start));

  // 슬롯 끝 cf초 동안 다음 사진으로 크로스페이드
  const mix = nextSlot && cf > 0 ? smoothstep(norm(t, slot.end - cf, slot.end)) : 0;

  return {
    current: slot,
    next: nextSlot,
    prev: prevSlot,
    mix,
    slotIndex: idx,
    localT: t - slot.start,
    progress: clamp(norm(t, slot.start, slot.end)),
  };
};

/**
 * 3분할 화면의 좌/우 컬럼용 타임라인.
 *
 * 슬롯을 짝/홀로 갈라 각 컬럼에 준다 — 좌우가 번갈아 바뀌므로
 * 한쪽이 크로스페이드하는 동안 반대쪽은 가만히 있어 화면이 차분하다.
 *
 * @param {Array} slots buildPhotoTimeline의 슬롯
 * @param {0|1} parity 0=왼쪽(짝수 슬롯), 1=오른쪽(홀수 슬롯)
 */
export const buildColumnTimeline = (slots, parity) => {
  const picked = slots.filter((_, i) => i % 2 === parity);
  return picked.map((slot, j) => {
    const nextPicked = picked[j + 1];
    return {
      src: slot.src,
      photo: slot.photo,
      // 이 컬럼의 사진은 같은 패리티의 다음 사진이 올 때까지 머문다
      start: j === 0 ? 0 : slot.start,
      end: nextPicked ? nextPicked.start : Infinity,
    };
  });
};

/** 컬럼 타임라인에서 시각 t의 상태 (crossfade 진행도 포함) */
export const columnStateAt = (column, t, crossfade) => {
  if (!column.length) return { current: null, next: null, mix: 0 };

  let idx = 0;
  for (let i = 0; i < column.length; i++) {
    if (column[i].start <= t) idx = i;
    else break;
  }

  const current = column[idx];
  const next = column[idx + 1] || null;
  const cf = Math.max(0, crossfade);
  const mix = next && cf > 0 ? smoothstep(norm(t, next.start - cf, next.start)) : 0;

  return { current, next, mix, index: idx };
};

/**
 * project → 렌더에 필요한 모든 파생 데이터를 한 번만 계산해 캐싱.
 * 프레임 루프 안에서는 절대 재계산하지 않는다.
 */
export const buildScene = (project, totalDuration) => {
  const total = Math.max(1, totalDuration || project.duration || 60);
  const timeline = buildPhotoTimeline(project, total);
  const lrcText = project.lyrics?.lrcText || '';
  const parsed = project.lyrics?.enabled ? parseLRC(lrcText) : { meta: {}, lines: [] };

  const offset = project.lyrics?.offset || 0;
  const lines = parsed.lines.map((l) => ({
    ...l,
    time: l.time + offset,
    end: l.end + offset,
    words: l.words.map((w) => ({ ...w, time: w.time + offset })),
  }));

  return {
    project,
    total,
    timeline,
    /** 3분할 좌/우 컬럼 타임라인 (짝/홀 슬롯을 번갈아 배정) */
    columns: {
      left: buildColumnTimeline(timeline.slots, 0),
      right: buildColumnTimeline(timeline.slots, 1),
    },
    lyrics: { meta: parsed.meta, lines },
    /** 사진별 고유 시드 — 보케/드리프트 위상 결정용 */
    seed: project.seed ?? 1,
  };
};

/** 사진이 바뀌는 순간마다 1→0으로 감쇠하는 펄스 (LP 살짝 튀는 효과 등) */
export const transitionPulse = (timeline, t, decay = 0.9) => {
  let pulse = 0;
  for (const slot of timeline.slots) {
    const dt = t - slot.start;
    if (dt >= 0 && dt < decay) pulse = Math.max(pulse, 1 - dt / decay);
  }
  return pulse;
};
