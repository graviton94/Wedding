/** 렌더 도구들이 공유하는 경로 상수 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export const ROOT = path.resolve(here, '..', '..');
export const PUBLIC_DIR = path.join(ROOT, 'public');
export const FONT_DIR = path.join(ROOT, 'assets', 'fonts');
export const OUT_DIR = path.join(ROOT, 'out');

/**
 * config의 public 상대 경로(`images/1.webp`)를 실제 파일 경로로 바꾼다.
 * 스튜디오가 내보낸 `/Wedding/images/1.webp` 형태도 함께 받아준다.
 */
export const resolveAsset = (src) => {
  if (!src) return null;
  if (path.isAbsolute(src) && !src.startsWith('/Wedding/')) return src;
  const clean = String(src)
    .replace(/^\/Wedding\//, '')
    .replace(/^\/+/, '')
    .replace(/^public\//, '');
  return path.join(PUBLIC_DIR, clean);
};
