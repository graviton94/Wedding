#!/usr/bin/env node
/**
 * 사진을 원하는 비율로 미리 잘라 마스터를 만든다.
 *
 * 렌더 중에 crop 값을 조절하는 대신, 아예 잘린 파일을 만들어두면
 * "화면에 뭐가 나올지"를 눈으로 확정할 수 있다. 컷마다 인물 위치가
 * 다른 경우 이쪽이 훨씬 다루기 쉽다.
 *
 *   npm run video:crops                      1:1, 위 10% 기준 (기본)
 *   npm run video:crops -- --ratio 1.333     4:3
 *   npm run video:crops -- --top 0.05        위에서 5% 지점부터
 *   npm run video:crops -- --out images/sq   저장 위치
 *
 * 세로가 남을 때는 top 비율로 어디서 자를지 정하고, 가로가 남을 때는
 * (가로 사진) 가운데를 기준으로 좌우를 자른다.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { createCanvas, loadImage } from '@napi-rs/canvas';

import { INVITATION_PHOTOS } from '../../src/video/engine/index.js';
import { PUBLIC_DIR, OUT_DIR, resolveAsset } from './paths.mjs';

const args = process.argv.slice(2).reduce((acc, a, i, arr) => {
  if (a.startsWith('--')) {
    const next = arr[i + 1];
    acc[a.slice(2)] = next && !next.startsWith('--') ? next : true;
  }
  return acc;
}, {});

const RATIO = Number(args.ratio || 1);        // 가로/세로
const TOP = Number(args.top ?? 0.1);          // 세로를 자를 때 위에서 버릴 비율
const OUT_REL = typeof args.out === 'string' ? args.out : 'images/crop';

/**
 * 목표 비율에 맞는 소스 사각형을 구한다.
 * @returns {{sx,sy,sw,sh, cutTop, cutBottom}} cut*은 보고용 (원본 대비 잘라낸 비율)
 */
const cropRect = (w, h, ratio, top) => {
  const targetH = w / ratio;
  if (targetH <= h) {
    // 세로가 남는다 — 위/아래를 자른다
    const sy = Math.min(Math.max(0, top * h), h - targetH);
    return {
      sx: 0, sy, sw: w, sh: targetH,
      cutTop: sy / h,
      cutBottom: (h - sy - targetH) / h,
    };
  }
  // 가로가 남는다 (가로 사진) — 가운데 기준 좌우를 자른다
  const targetW = h * ratio;
  const sx = (w - targetW) / 2;
  return {
    sx, sy: 0, sw: targetW, sh: h,
    cutTop: 0, cutBottom: 0,
    cutSide: sx / w,
  };
};

const main = async () => {
  const outDir = path.join(PUBLIC_DIR, OUT_REL);
  await mkdir(outDir, { recursive: true });
  await mkdir(OUT_DIR, { recursive: true });

  console.log(`목표 비율 ${RATIO.toFixed(3)}:1 · 위 기준점 ${(TOP * 100).toFixed(0)}%`);
  console.log(`저장 위치 public/${OUT_REL}/\n`);

  const made = [];

  for (const file of INVITATION_PHOTOS) {
    const img = await loadImage(resolveAsset(`images/${file}`));
    const r = cropRect(img.width, img.height, RATIO, TOP);

    const canvas = createCanvas(Math.round(r.sw), Math.round(r.sh));
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = true;
    if ('imageSmoothingQuality' in ctx) ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, r.sx, r.sy, r.sw, r.sh, 0, 0, r.sw, r.sh);

    const outName = file.replace(/\.[^.]+$/, '.webp');
    await writeFile(path.join(outDir, outName), await canvas.encode('webp', 92));

    const note = r.cutSide !== undefined
      ? `좌우 각 ${(r.cutSide * 100).toFixed(1)}% 잘림`
      : `위 ${(r.cutTop * 100).toFixed(1)}% / 아래 ${(r.cutBottom * 100).toFixed(1)}% 잘림`;
    console.log(`  ${file.padEnd(11)} ${img.width}x${img.height} → ${Math.round(r.sw)}x${Math.round(r.sh)}   ${note}`);
    made.push({ file: outName, canvas });
  }

  // 검수용 컨택트 시트
  const cols = 4;
  const cell = 420;
  const cellH = Math.round(cell / RATIO);
  const rows = Math.ceil(made.length / cols);
  const sheet = createCanvas(cols * cell, rows * cellH);
  const sctx = sheet.getContext('2d');
  sctx.fillStyle = '#111';
  sctx.fillRect(0, 0, sheet.width, sheet.height);
  made.forEach((m, i) => {
    const x = (i % cols) * cell;
    const y = Math.floor(i / cols) * cellH;
    sctx.drawImage(m.canvas, x, y, cell, cellH);
    sctx.fillStyle = 'rgba(0,0,0,0.6)';
    sctx.fillRect(x, y, 110, 24);
    sctx.fillStyle = '#fff';
    sctx.font = '15px sans-serif';
    sctx.fillText(m.file, x + 8, y + 17);
  });

  const sheetName = `crops-${RATIO.toFixed(2).replace('.', '_')}.png`;
  await writeFile(path.join(OUT_DIR, sheetName), sheet.toBuffer('image/png'));
  console.log(`\n${made.length}장 완료. 검수 시트 → out/${sheetName}`);
  console.log(`프로젝트에서 쓰려면 사진 경로를 "${OUT_REL}/..." 로 바꾸세요.`);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
