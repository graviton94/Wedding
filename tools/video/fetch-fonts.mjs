#!/usr/bin/env node
/**
 * 렌더러용 폰트 내려받기.
 *
 * 브라우저는 index.html의 Google Fonts를 쓰지만, Node 캔버스에는 폰트가 없다.
 * 미리보기와 최종 mp4의 글자 모양을 맞추려면 같은 폰트를 로컬에 깔아야 한다.
 * 받은 파일은 assets/fonts/ 에 저장되고 .gitignore 처리된다 (Noto CJK는 20MB+).
 *
 *   npm run video:fonts
 */

import { createWriteStream } from 'node:fs';
import { mkdir, stat, rm } from 'node:fs/promises';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';
import { FONT_DIR } from './paths.mjs';

const FONTS = [
  {
    file: 'NotoSerifKR-VF.ttf',
    family: 'Noto Serif KR',
    url: 'https://raw.githubusercontent.com/googlefonts/noto-cjk/main/Serif/Variable/TTF/Subset/NotoSerifKR-VF.ttf',
    note: '국문 본문/가사',
  },
  {
    file: 'CormorantGaramond.ttf',
    family: 'Cormorant Garamond',
    url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond%5Bwght%5D.ttf',
    note: '영문 디스플레이(날짜/캡션)',
  },
  {
    file: 'GreatVibes-Regular.ttf',
    family: 'Great Vibes',
    url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/greatvibes/GreatVibes-Regular.ttf',
    note: '필기체',
  },
  {
    file: 'CormorantGaramond-Italic.ttf',
    family: 'Cormorant Garamond',
    url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/cormorantgaramond/CormorantGaramond-Italic%5Bwght%5D.ttf',
    note: '영문 이탤릭 (감성 강조)',
  },
  {
    file: 'PlayfairDisplay.ttf',
    family: 'Playfair Display',
    url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/playfairdisplay/PlayfairDisplay%5Bwght%5D.ttf',
    note: '고대비 디도네 (Minuit 테마)',
  },
  {
    file: 'Italiana-Regular.ttf',
    family: 'Italiana',
    url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/italiana/Italiana-Regular.ttf',
    note: '아르데코 (Pluie 테마)',
  },
  {
    file: 'Marcellus-Regular.ttf',
    family: 'Marcellus',
    url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/marcellus/Marcellus-Regular.ttf',
    note: '로만 캐피탈 (Bobine 테마)',
  },
  {
    file: 'NanumMyeongjo-Regular.ttf',
    family: 'Nanum Myeongjo',
    url: 'https://raw.githubusercontent.com/google/fonts/main/ofl/nanummyeongjo/NanumMyeongjo-Regular.ttf',
    note: '국문 감성 명조',
  },
];

const human = (bytes) => `${(bytes / 1024 / 1024).toFixed(1)}MB`;

const download = async (font, force) => {
  const dest = path.join(FONT_DIR, font.file);

  if (!force) {
    try {
      const s = await stat(dest);
      if (s.size > 10_000) {
        console.log(`  ✓ ${font.file} (이미 있음, ${human(s.size)})`);
        return true;
      }
    } catch {
      /* 없으면 내려받는다 */
    }
  }

  process.stdout.write(`  … ${font.file} 내려받는 중`);
  const res = await fetch(font.url, { redirect: 'follow' });
  if (!res.ok) {
    process.stdout.write(`\r  ✗ ${font.file} — HTTP ${res.status}\n`);
    return false;
  }
  await pipeline(Readable.fromWeb(res.body), createWriteStream(dest));
  const s = await stat(dest);
  if (s.size < 10_000) {
    await rm(dest, { force: true });
    process.stdout.write(`\r  ✗ ${font.file} — 응답이 너무 작음 (${s.size}B)\n`);
    return false;
  }
  process.stdout.write(`\r  ✓ ${font.file} (${human(s.size)}) — ${font.note}\n`);
  return true;
};

const main = async () => {
  const force = process.argv.includes('--force');
  await mkdir(FONT_DIR, { recursive: true });
  console.log(`폰트 저장 위치: ${FONT_DIR}`);

  const results = [];
  for (const font of FONTS) results.push(await download(font, force));

  const failed = results.filter((ok) => !ok).length;
  if (failed) {
    console.error(`\n${failed}개 폰트를 받지 못했습니다.`);
    console.error('오프라인이라면 .ttf/.otf 파일을 직접 assets/fonts/ 에 넣어주세요.');
    process.exitCode = 1;
  } else {
    console.log('\n폰트 준비 완료. 이제 npm run video:render 를 실행하세요.');
  }
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

export { FONTS };
