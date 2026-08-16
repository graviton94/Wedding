#!/usr/bin/env node
/**
 * 무드 프리셋 시안 렌더러.
 *
 * themes.js의 각 테마를 정지 이미지로 뽑아 한눈에 비교한다.
 * 영상을 다 뽑기 전에 무드부터 고르는 용도.
 *
 *   npm run video:themes                    모든 테마 (기본 시각)
 *   npm run video:themes -- --at 38         38초 지점으로
 *   npm run video:themes -- --theme minuit  하나만
 *   npm run video:themes -- --lrc my.lrc    자기 자막으로 미리보기
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';

import {
  applyTheme, buildScene, createDefaultProject, drawFrame, requiredSources, THEME_PRESETS,
} from '../../src/video/engine/index.js';
import { FONT_DIR, OUT_DIR, resolveAsset } from './paths.mjs';

const args = process.argv.slice(2).reduce((acc, a, i, arr) => {
  if (a.startsWith('--')) {
    const next = arr[i + 1];
    acc[a.slice(2)] = next && !next.startsWith('--') ? next : true;
  }
  return acc;
}, {});

const FAMILY_BY_FILE = {
  'NotoSerifKR-VF.ttf': 'Noto Serif KR',
  'NanumMyeongjo-Regular.ttf': 'Nanum Myeongjo',
  'CormorantGaramond.ttf': 'Cormorant Garamond',
  // 로만과 같은 패밀리로 등록 → `italic` 키워드로 선택된다 (브라우저와 동일)
  'CormorantGaramond-Italic.ttf': 'Cormorant Garamond',
  'PlayfairDisplay.ttf': 'Playfair Display',
  'Italiana-Regular.ttf': 'Italiana',
  'Marcellus-Regular.ttf': 'Marcellus',
  'GreatVibes-Regular.ttf': 'Great Vibes',
};

/**
 * 시안용 임시 자막.
 *
 * 실제 곡 가사는 저장소에 넣지 않는다 — 여기서는 2개 국어 자막이 어떻게
 * 쌓이는지 보여주기 위한 자리표시자 문장만 쓴다.
 * 같은 시각에 두 줄을 두면 위=원문 / 아래=번역으로 묶인다.
 */
const PLACEHOLDER_LRC = `
[00:00.00]
[00:20.00]This is where the lyric line goes
[00:20.00]여기에 번역 자막이 들어갑니다
[00:34.00]A second line, a little longer than the first
[00:34.00]두 번째 줄, 조금 더 긴 문장이 들어갈 때의 모습
[00:50.00]
[00:58.00]The chorus lands right about here
[00:58.00]후렴이 시작되는 지점
`.trim();

const registerFonts = async () => {
  const { readdir } = await import('node:fs/promises');
  let files = [];
  try {
    files = await readdir(FONT_DIR);
  } catch {
    console.warn('⚠ `npm run video:fonts` 를 먼저 실행하세요. 글자가 깨집니다.');
    return;
  }
  for (const file of files) {
    if (!/\.(ttf|otf|ttc)$/i.test(file)) continue;
    GlobalFonts.registerFromPath(path.join(FONT_DIR, file), FAMILY_BY_FILE[file] || path.parse(file).name);
  }
};

const main = async () => {
  await registerFonts();
  await mkdir(OUT_DIR, { recursive: true });

  let lrcText = PLACEHOLDER_LRC;
  if (typeof args.lrc === 'string') {
    lrcText = await readFile(resolveAsset(args.lrc), 'utf8');
  }

  // 줄이 막 시작하는 시각은 페이드인 알파가 0이라 자막이 안 보인다 — 줄 중간을 잡는다
  const at = args.at ? Number(args.at) : 38;
  const total = Number(args.duration || 90);
  const keys = typeof args.theme === 'string' ? [args.theme] : Object.keys(THEME_PRESETS);

  const shots = [];

  for (const key of keys) {
    const preset = THEME_PRESETS[key];
    if (!preset) {
      console.warn(`알 수 없는 테마: ${key}`);
      continue;
    }

    const project = applyTheme(createDefaultProject(), key);
    project.lyrics.lrcText = lrcText;
    project.intro.enabled = false; // 시안은 본편 화면을 봐야 하므로 인트로 끔
    project.outro.enabled = false;

    const { width: W, height: H } = project.canvas;
    const scene = buildScene(project, total);

    const images = new Map();
    const sources = requiredSources(scene);
    if (project.vinyl.photo && !sources.includes(project.vinyl.photo)) sources.push(project.vinyl.photo);
    await Promise.all(sources.map(async (src) => {
      try {
        images.set(src, await loadImage(resolveAsset(src)));
      } catch {
        images.set(src, null);
      }
    }));

    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext('2d');
    const env = {
      width: W,
      height: H,
      createCanvas: (w, h) => createCanvas(w, h),
      getImage: (src) => (src ? images.get(src) || null : null),
    };

    drawFrame(ctx, scene, env, at);

    const outPath = path.join(OUT_DIR, `theme-${key}.png`);
    await writeFile(outPath, canvas.toBuffer('image/png'));
    shots.push({ key, preset, canvas });
    console.log(`✓ ${preset.label} → ${path.relative(process.cwd(), outPath)}`);
  }

  // 2x2 비교 시트
  if (shots.length > 1) {
    const cellW = 960;
    const cellH = Math.round((cellW * shots[0].canvas.height) / shots[0].canvas.width);
    const cols = 2;
    const rows = Math.ceil(shots.length / cols);
    const sheet = createCanvas(cols * cellW, rows * cellH);
    const sctx = sheet.getContext('2d');
    sctx.fillStyle = '#000';
    sctx.fillRect(0, 0, sheet.width, sheet.height);

    shots.forEach((shot, i) => {
      const x = (i % cols) * cellW;
      const y = Math.floor(i / cols) * cellH;
      sctx.drawImage(shot.canvas, x, y, cellW, cellH);
      sctx.fillStyle = 'rgba(0,0,0,0.65)';
      sctx.fillRect(x, y, 330, 34);
      sctx.fillStyle = '#fff';
      sctx.font = '17px "Nanum Myeongjo", sans-serif';
      sctx.fillText(shot.preset.label, x + 12, y + 23);
    });

    const sheetPath = path.join(OUT_DIR, 'theme-compare.png');
    await writeFile(sheetPath, sheet.toBuffer('image/png'));
    console.log(`\n비교 시트 → ${path.relative(process.cwd(), sheetPath)}`);
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
