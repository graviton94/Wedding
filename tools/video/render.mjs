#!/usr/bin/env node
/**
 * MP4 렌더러 (Node CLI).
 *
 * 브라우저 스튜디오와 똑같은 엔진(src/video/engine)으로 프레임을 그린 뒤
 * rawvideo 파이프로 ffmpeg에 밀어넣어 H.264 + AAC mp4를 만든다.
 *
 * MediaRecorder(브라우저 녹화) 대신 이 방식을 쓰는 이유
 *   1. 실시간 녹화가 아니라 프레임 단위라 무거운 프레임에서 끊기거나 드랍되지 않는다.
 *   2. 브라우저 MediaRecorder는 사실상 webm만 뱉는다. 여긴 진짜 mp4 + AAC.
 *   3. 결정적 렌더 — 몇 번을 돌려도 같은 결과가 나온다.
 *
 * 사용법
 *   npm run video:render                                  기본 설정으로 렌더
 *   npm run video:render -- --project my.json --out a.mp4
 *   npm run video:render -- --preview                     360p / 15fps 빠른 확인
 *   npm run video:render -- --duration 20                 앞 20초만
 *   npm run video:render -- --still 12.5 --out frame.png  특정 시각 한 장만
 */

import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

import { createCanvas, loadImage, GlobalFonts } from '@napi-rs/canvas';
import ffmpegPath from 'ffmpeg-static';

import { buildScene, mergeProject, requiredSources, drawFrame } from '../../src/video/engine/index.js';
import { FONT_DIR, OUT_DIR, PUBLIC_DIR, resolveAsset } from './paths.mjs';

// ─────────────────────────────── 인자 파싱 ───────────────────────────────

const parseArgs = (argv) => {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) {
      out._.push(a);
      continue;
    }
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
};

const args = parseArgs(process.argv.slice(2));

if (args.help || args.h) {
  console.log(`
사용법: npm run video:render -- [옵션]

  --project <path>   프로젝트 JSON (기본: video.project.json 있으면 사용, 없으면 기본값)
  --out <path>       출력 파일 (기본: out/<name>.mp4)
  --preview          640x360 / 15fps 저화질 빠른 렌더
  --duration <sec>   영상 길이 강제 지정 (테스트용)
  --start <sec>      시작 지점 (테스트용)
  --still <sec>      해당 시각 프레임 한 장만 PNG로 저장
  --fps <n>          프레임레이트 덮어쓰기
  --width <n>        가로 해상도 덮어쓰기 (세로는 비율 유지)
  --crf <n>          H.264 품질, 낮을수록 고화질 (기본 18)
  --no-audio         오디오 없이 렌더
  --contact-sheet    타임라인 썸네일 시트 PNG 생성 (검수용)
`);
  process.exit(0);
}

// ─────────────────────────────── 폰트 등록 ───────────────────────────────

/**
 * assets/fonts의 모든 ttf/otf를 등록한다.
 * 파일명 → config의 theme.font* 값과 매칭되도록 family를 명시적으로 지정한다.
 */
const FAMILY_BY_FILE = {
  'NotoSerifKR-VF.ttf': 'Noto Serif KR',
  'NotoSansKR-VF.ttf': 'Noto Sans KR',
  'CormorantGaramond.ttf': 'Cormorant Garamond',
  'GreatVibes-Regular.ttf': 'Great Vibes',
};

const registerFonts = async () => {
  let files = [];
  try {
    files = await readdir(FONT_DIR);
  } catch {
    console.warn('⚠ assets/fonts 가 없습니다. `npm run video:fonts` 를 먼저 실행하세요.');
    console.warn('  (폰트 없이도 렌더는 되지만 한글이 네모로 깨집니다)');
    return [];
  }

  const registered = [];
  for (const file of files) {
    if (!/\.(ttf|otf|ttc)$/i.test(file)) continue;
    const family = FAMILY_BY_FILE[file] || path.parse(file).name;
    const ok = GlobalFonts.registerFromPath(path.join(FONT_DIR, file), family);
    if (ok) registered.push(family);
  }

  if (!registered.length) {
    console.warn('⚠ 등록된 폰트가 없습니다. `npm run video:fonts` 를 실행하세요.');
  } else {
    console.log(`폰트: ${registered.join(', ')}`);
  }
  return registered;
};

// ────────────────────────────── 프로젝트 로드 ─────────────────────────────

const loadProject = async () => {
  const explicit = typeof args.project === 'string' ? args.project : null;
  const candidate = explicit || path.join(PUBLIC_DIR, '..', 'video.project.json');

  let raw = null;
  try {
    raw = JSON.parse(await readFile(candidate, 'utf8'));
    console.log(`프로젝트: ${path.relative(process.cwd(), candidate)}`);
  } catch (err) {
    if (explicit) throw new Error(`프로젝트 파일을 읽을 수 없습니다: ${explicit}\n${err.message}`);
    console.log('프로젝트: 기본 설정 (video.project.json 없음)');
  }

  const project = mergeProject(raw);

  // .lrc를 인라인 텍스트로 흡수 — 엔진은 lrcText만 본다
  if (project.lyrics.enabled && !project.lyrics.lrcText && project.lyrics.lrcSrc) {
    const lrcPath = resolveAsset(project.lyrics.lrcSrc);
    try {
      project.lyrics.lrcText = await readFile(lrcPath, 'utf8');
    } catch {
      console.warn(`⚠ 가사 파일을 찾지 못했습니다: ${project.lyrics.lrcSrc} — 자막 없이 렌더합니다.`);
    }
  }

  // CLI 덮어쓰기
  if (args.fps) project.canvas.fps = Number(args.fps);
  if (args.width) {
    const w = Number(args.width);
    const ratio = project.canvas.height / project.canvas.width;
    project.canvas.width = w;
    project.canvas.height = Math.round((w * ratio) / 2) * 2; // H.264는 짝수 필요
  }
  if (args.preview) {
    const ratio = project.canvas.height / project.canvas.width;
    project.canvas.width = 640;
    project.canvas.height = Math.round((640 * ratio) / 2) * 2;
    project.canvas.fps = 15;
  }
  if (args['no-audio']) project.audio.src = '';

  return project;
};

// ─────────────────────────────── 오디오 길이 ──────────────────────────────

const probeDuration = async (file) => {
  /*
   * ffmpeg-static에는 ffprobe가 없어서 ffmpeg의 stderr 헤더를 읽는다.
   *
   * `-f null -` 의 마지막 time= 을 보는 방법은 쓰면 안 된다.
   * 앨범 아트가 박힌 mp3는 커버 이미지가 비디오 스트림으로 잡혀서
   * time= 이 오디오가 아니라 정지 이미지 한 장(0초)을 가리킨다.
   * 헤더의 "Duration:" 줄은 컨테이너 기준이라 이 문제가 없다.
   */
  return new Promise((resolve) => {
    const proc = spawn(ffmpegPath, ['-hide_banner', '-i', file], {
      stdio: ['ignore', 'ignore', 'pipe'],
    });
    let stderr = '';
    proc.stderr.on('data', (d) => { stderr += d.toString(); });
    // 입력만 주면 ffmpeg는 "출력 없음"으로 코드 1을 내지만 헤더는 이미 찍혀 있다
    proc.on('close', () => {
      const m = stderr.match(/Duration:\s*(\d+):(\d+):(\d+\.?\d*)/);
      if (!m) return resolve(null);
      resolve(Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]));
    });
    proc.on('error', () => resolve(null));
  });
};

// ─────────────────────────────── 이미지 로딩 ──────────────────────────────

const loadImages = async (sources) => {
  const cache = new Map();
  let failed = 0;
  await Promise.all(sources.map(async (src) => {
    const file = resolveAsset(src);
    try {
      cache.set(src, await loadImage(file));
    } catch (err) {
      failed++;
      console.warn(`⚠ 이미지 로드 실패: ${src} (${err.message})`);
      cache.set(src, null);
    }
  }));
  console.log(`사진: ${sources.length - failed}/${sources.length} 장 로드`);
  return cache;
};

// ──────────────────────────────── 렌더 루프 ───────────────────────────────

const makeEnv = (W, H, images) => ({
  width: W,
  height: H,
  createCanvas: (w, h) => createCanvas(w, h),
  getImage: (src) => (src ? images.get(src) || null : null),
});

const renderStill = async (scene, env, canvas, ctx, time, outPath) => {
  drawFrame(ctx, scene, env, time);
  await writeFile(outPath, canvas.toBuffer('image/png'));
  console.log(`\n스틸 저장: ${path.relative(process.cwd(), outPath)} (t=${time}s)`);
};

/** 검수용 컨택트 시트 — 영상 전체를 4x3 썸네일로 한 장에 */
const renderContactSheet = async (scene, env, canvas, ctx, outPath) => {
  const cols = 4;
  const rows = 3;
  const cellW = 480;
  const cellH = Math.round((cellW * scene.project.canvas.height) / scene.project.canvas.width);
  const sheet = createCanvas(cols * cellW, rows * cellH);
  const sctx = sheet.getContext('2d');
  sctx.fillStyle = '#000';
  sctx.fillRect(0, 0, sheet.width, sheet.height);

  const count = cols * rows;
  for (let i = 0; i < count; i++) {
    const t = (scene.total * (i + 0.5)) / count;
    drawFrame(ctx, scene, env, t);
    sctx.drawImage(canvas, (i % cols) * cellW, Math.floor(i / cols) * cellH, cellW, cellH);
    sctx.fillStyle = 'rgba(0,0,0,0.6)';
    sctx.fillRect((i % cols) * cellW, Math.floor(i / cols) * cellH, 62, 22);
    sctx.fillStyle = '#fff';
    sctx.font = '13px sans-serif';
    sctx.fillText(`${t.toFixed(1)}s`, (i % cols) * cellW + 8, Math.floor(i / cols) * cellH + 16);
  }

  await writeFile(outPath, sheet.toBuffer('image/png'));
  console.log(`컨택트 시트: ${path.relative(process.cwd(), outPath)}`);
};

const buildFfmpegArgs = (project, W, H, fps, totalFrames, audioFile, outPath) => {
  const a = [
    // 진행률은 이 스크립트가 직접 찍으므로 ffmpeg 자체 통계는 끈다
    '-hide_banner', '-loglevel', 'error', '-y',
    // 입력 0: stdin으로 들어오는 raw RGBA 프레임
    '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(fps), '-i', 'pipe:0',
  ];

  if (audioFile) {
    // 음원 시작 지점을 잘라 입력
    if (project.audio.startAt > 0) a.push('-ss', String(project.audio.startAt));
    a.push('-i', audioFile);
  }

  a.push(
    '-map', '0:v:0',
    '-c:v', 'libx264',
    '-preset', args.preview ? 'veryfast' : 'slow',
    '-crf', String(args.crf ? Number(args.crf) : args.preview ? 28 : 18),
    '-pix_fmt', 'yuv420p',
    // 유튜브 권장: 2초 GOP + faststart
    '-g', String(fps * 2),
    '-movflags', '+faststart',
    '-frames:v', String(totalFrames),
  );

  if (audioFile) {
    const dur = totalFrames / fps;
    const { fadeIn, fadeOut, volume } = project.audio;
    const filters = [`volume=${volume}`];
    if (fadeIn > 0) filters.push(`afade=t=in:st=0:d=${fadeIn}`);
    if (fadeOut > 0) filters.push(`afade=t=out:st=${Math.max(0, dur - fadeOut)}:d=${fadeOut}`);

    a.push(
      '-map', '1:a:0',
      '-af', filters.join(','),
      '-c:a', 'aac', '-b:a', '256k', '-ar', '48000', '-ac', '2',
      // 음원이 영상보다 짧아도 길어도 영상 길이에 맞춘다
      '-shortest', '-fflags', '+shortest', '-max_interleave_delta', '0',
    );
  }

  a.push(outPath);
  return a;
};

const main = async () => {
  if (!ffmpegPath) throw new Error('ffmpeg 바이너리를 찾을 수 없습니다. `npm install` 을 실행하세요.');

  await registerFonts();
  const project = await loadProject();

  const W = project.canvas.width;
  const H = project.canvas.height;
  const fps = project.canvas.fps;

  // 영상 길이 결정: --duration > project.duration > 음원 길이
  const audioFile = project.audio.src ? resolveAsset(project.audio.src) : null;
  let total = args.duration ? Number(args.duration) : project.duration;
  if (!total && audioFile) {
    const probed = await probeDuration(audioFile);
    if (probed) {
      total = Math.max(5, probed - project.audio.startAt);
      console.log(`음원 길이: ${probed.toFixed(1)}s → 영상 ${total.toFixed(1)}s`);
    }
  }
  if (!total) total = 60;

  const scene = buildScene(project, total);
  console.log(
    `출력: ${W}x${H} @${fps}fps, ${total.toFixed(1)}초 ` +
    `(사진 ${scene.timeline.slots.length}컷, 자막 ${scene.lyrics.lines.length}줄)`,
  );

  const images = await loadImages(requiredSources(scene));
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  const env = makeEnv(W, H, images);

  await mkdir(OUT_DIR, { recursive: true });

  // ── 스틸 / 컨택트 시트 모드 ──
  if (args.still !== undefined && args.still !== true) {
    const outPath = typeof args.out === 'string' ? args.out : path.join(OUT_DIR, 'still.png');
    await renderStill(scene, env, canvas, ctx, Number(args.still), outPath);
    return;
  }
  if (args['contact-sheet']) {
    const outPath = typeof args.out === 'string' ? args.out : path.join(OUT_DIR, 'contact-sheet.png');
    await renderContactSheet(scene, env, canvas, ctx, outPath);
    return;
  }

  // ── 영상 렌더 ──
  const outPath = typeof args.out === 'string'
    ? args.out
    : path.join(OUT_DIR, `${project.name}${args.preview ? '-preview' : ''}.mp4`);
  await mkdir(path.dirname(outPath), { recursive: true });

  const startAt = args.start ? Number(args.start) : 0;
  const totalFrames = Math.max(1, Math.round((total - startAt) * fps));

  const ffArgs = buildFfmpegArgs(project, W, H, fps, totalFrames, audioFile, outPath);
  const ff = spawn(ffmpegPath, ffArgs, { stdio: ['pipe', 'inherit', 'inherit'] });

  let ffmpegClosed = false;
  const done = new Promise((resolve, reject) => {
    ff.on('close', (code) => {
      ffmpegClosed = true;
      code === 0 ? resolve() : reject(new Error(`ffmpeg 종료 코드 ${code}`));
    });
    ff.on('error', reject);
  });
  // stdin이 먼저 닫히면 EPIPE가 난다 — ffmpeg 종료 코드로 판단하므로 여기선 삼킨다
  ff.stdin.on('error', () => {});

  const t0 = Date.now();
  let lastLog = 0;

  for (let f = 0; f < totalFrames; f++) {
    if (ffmpegClosed) break;

    const t = startAt + f / fps;
    drawFrame(ctx, scene, env, t);

    // RGBA 원본 픽셀을 그대로 파이프로 — PNG 인코딩 왕복이 없어 3~4배 빠르다
    const buffer = Buffer.from(ctx.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buffer)) {
      await new Promise((res) => ff.stdin.once('drain', res));
    }

    const now = Date.now();
    if (now - lastLog > 1000 || f === totalFrames - 1) {
      lastLog = now;
      const pct = ((f + 1) / totalFrames) * 100;
      const elapsed = (now - t0) / 1000;
      const rate = (f + 1) / elapsed;
      const eta = rate > 0 ? (totalFrames - f - 1) / rate : 0;
      process.stdout.write(
        `\r렌더 ${pct.toFixed(1)}%  ${f + 1}/${totalFrames} 프레임  ` +
        `${rate.toFixed(1)} fps  남은 시간 ${Math.round(eta)}s   `,
      );
    }
  }

  ff.stdin.end();
  await done;

  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`\n\n완료: ${path.relative(process.cwd(), outPath)} (${elapsed}초 소요)`);
};

main().catch((err) => {
  console.error(`\n렌더 실패: ${err.message}`);
  process.exit(1);
});
