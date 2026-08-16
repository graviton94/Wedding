#!/usr/bin/env node
/**
 * 번역문을 원문 LRC에 짝지어 이중 언어 LRC를 만든다.
 *
 * 입력은 "원문 한 줄 / 번역 한 줄"이 번갈아 오는 평범한 텍스트 파일이다.
 * 원문을 키로 삼아 LRC의 타임스탬프를 찾아 붙이므로, 손으로 시간을
 * 옮겨 적을 필요가 없다.
 *
 *   npm run video:lyrics -- --lrc video/lyrics/photograph.lrc \
 *                           --tr  video/lyrics/photograph.ko.txt \
 *                           --out video/lyrics/photograph.bi.lrc
 *
 * 짝이 안 맞는 곳(원문에는 있는데 번역이 없거나, 번역이 원문에 없는 줄을
 * 가리키는 경우)은 전부 보고한다 — 조용히 빠뜨리면 영상에서야 발견된다.
 */

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { parseLRC, toLrcTime } from '../../src/video/engine/index.js';
import { resolveAsset } from './paths.mjs';

const args = process.argv.slice(2).reduce((acc, a, i, arr) => {
  if (a.startsWith('--')) {
    const next = arr[i + 1];
    acc[a.slice(2)] = next && !next.startsWith('--') ? next : true;
  }
  return acc;
}, {});

/** 비교용 정규화 — 대소문자, 문장부호, 축약형 차이를 흡수 */
const norm = (s) =>
  String(s)
    .toLowerCase()
    .replace(/['’`]/g, "'")
    .replace(/\bholdin'\b/g, 'holding')
    .replace(/\btil\b|\b'til\b/g, 'till')
    .replace(/[.,!?"“”]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const hasHangul = (s) => /[ㄱ-힝]/.test(s);

const main = async () => {
  const lrcPath = resolveAsset(args.lrc || 'video/lyrics/photograph.lrc');
  const trPath = resolveAsset(args.tr || 'video/lyrics/photograph.ko.txt');
  const outPath = resolveAsset(args.out || 'video/lyrics/photograph.bi.lrc');

  const lrcRaw = await readFile(lrcPath, 'utf8');
  const { lines } = parseLRC(lrcRaw);
  const sung = lines.filter((l) => l.text);

  // 번역 파일: 빈 줄로 연(verse)을 나누고, 한글이 아닌 줄 = 원문 키
  const trLines = (await readFile(trPath, 'utf8'))
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  /** 원문(정규화) → 번역 */
  const dict = new Map();
  const orphans = [];
  for (let i = 0; i < trLines.length; i++) {
    if (hasHangul(trLines[i])) continue;      // 번역 줄은 다음 차례에 처리
    const ko = trLines[i + 1];
    if (!ko || !hasHangul(ko)) {
      orphans.push(trLines[i]);
      continue;
    }
    dict.set(norm(trLines[i]), ko);
    i++;
  }

  // LRC 각 줄에 번역 붙이기
  const out = [];
  const missing = [];
  const used = new Set();

  for (const meta of ['ti', 'ar', 'al', 'length']) {
    const m = lrcRaw.match(new RegExp(`^\\[${meta}:.*\\]$`, 'mi'));
    if (m) out.push(m[0]);
  }
  out.push('');

  for (const line of lines) {
    const stamp = `[${toLrcTime(line.time)}]`;
    if (!line.text) {
      out.push(stamp);                        // 간주
      continue;
    }
    out.push(stamp + line.text);
    const key = norm(line.text);
    const ko = dict.get(key);
    if (ko) {
      out.push(stamp + ko);                   // 같은 시각 → 원문/번역 한 쌍
      used.add(key);
    } else {
      missing.push({ time: line.time, text: line.text });
    }
  }

  await writeFile(outPath, `${out.join('\n')}\n`, 'utf8');

  // ── 보고 ──
  const paired = sung.length - missing.length;
  console.log(`원문 ${sung.length}줄 중 ${paired}줄 짝지음 → ${path.relative(process.cwd(), outPath)}\n`);

  if (missing.length) {
    console.log(`⚠ 번역이 없는 줄 ${missing.length}개:`);
    for (const m of missing) console.log(`   [${toLrcTime(m.time)}] ${m.text}`);
    console.log('');
  }

  const unused = [...dict.keys()].filter((k) => !used.has(k));
  if (unused.length) {
    console.log(`⚠ 원문 LRC에서 못 찾은 번역 키 ${unused.length}개 (줄이 나뉘거나 합쳐진 경우):`);
    for (const u of unused) console.log(`   "${u}"`);
    console.log('');
  }
  if (orphans.length) {
    console.log(`⚠ 짝이 없는 원문 줄 ${orphans.length}개 (바로 아래에 한글이 없음):`);
    for (const o of orphans) console.log(`   "${o}"`);
    console.log('');
  }

  if (!missing.length && !unused.length && !orphans.length) {
    console.log('전부 짝지어졌습니다.');
  }
};

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
