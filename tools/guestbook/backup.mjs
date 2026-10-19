/**
 * Supabase 방명록 → src/data/guestbook.json 백업
 *
 * 사이트는 이 JSON 파일만 읽는다(Supabase 호출 없음).
 * 사용: npm run guestbook:backup
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const CONTENT_PATH = path.join(ROOT, 'src', 'data', 'content.json');
const BACKUP_PATH = path.join(ROOT, 'src', 'data', 'guestbook.json');
const PAGE_SIZE = 1000;

const content = JSON.parse(await fs.readFile(CONTENT_PATH, 'utf8'));
const { supabaseUrl, supabaseKey } = content.guestbook;
if (!supabaseUrl || !supabaseKey) {
  console.error('content.json 의 guestbook.supabaseUrl / supabaseKey 가 비어 있습니다.');
  process.exit(1);
}

const headers = { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}` };
const rows = [];
for (let offset = 0; ; offset += PAGE_SIZE) {
  const url =
    `${supabaseUrl}/rest/v1/guestbook?select=id,name,message,created_at` +
    `&order=created_at.desc,id.desc&limit=${PAGE_SIZE}&offset=${offset}`;
  const res = await fetch(url, { headers });
  if (!res.ok) {
    console.error(`HTTP ${res.status} ${await res.text()}`);
    process.exit(1);
  }
  const page = await res.json();
  rows.push(...page);
  if (page.length < PAGE_SIZE) break;
}

// 이미 받아둔 백업보다 적게 오면(프로젝트 일시정지·삭제 등) 덮어쓰지 않는다.
const previous = JSON.parse(await fs.readFile(BACKUP_PATH, 'utf8').catch(() => '[]'));
if (rows.length < previous.length) {
  console.error(`가져온 글(${rows.length})이 기존 백업(${previous.length})보다 적어 중단합니다.`);
  process.exit(1);
}

await fs.writeFile(BACKUP_PATH, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`방명록 ${rows.length}건 → ${path.relative(ROOT, BACKUP_PATH)}`);
