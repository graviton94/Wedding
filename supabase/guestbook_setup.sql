-- =====================================================================
-- 방명록(Guestbook) Supabase 설정
-- =====================================================================
-- 사용법:
--   1. https://supabase.com 에서 무료 프로젝트 생성
--   2. 좌측 메뉴 "SQL Editor" → "New query" → 이 파일 내용 전체 붙여넣기 → Run
--   3. Project Settings → API 에서 아래 2개를 복사해 담당자에게 전달:
--        - Project URL          (예: https://xxxxx.supabase.co)
--        - anon public key      (JWT 형태의 긴 문자열)
--      → src/data/content.json 의 guestbook.supabaseUrl / supabaseAnonKey 에 입력
--
-- anon public key는 "공개되어도 되는" 키입니다. 아래 RLS 정책이
-- 익명 사용자에게 오직 "이 테이블에 insert / select"만 허용하고,
-- 길이 제한으로 스팸을 막습니다. (삭제/수정/타 테이블 접근 불가)
-- =====================================================================

-- 1) 테이블
create table if not exists public.guestbook (
  id          bigint generated always as identity primary key,
  name        text        not null,
  message     text        not null,
  created_at  timestamptz not null default now()
);

-- 2) Row Level Security 활성화
alter table public.guestbook enable row level security;

-- 3) 누구나 읽기 가능
drop policy if exists "guestbook_public_read" on public.guestbook;
create policy "guestbook_public_read"
  on public.guestbook
  for select
  to anon, authenticated
  using (true);

-- 4) 누구나 작성 가능(단, 이름 1~30자 / 메시지 1~300자 제한)
drop policy if exists "guestbook_public_insert" on public.guestbook;
create policy "guestbook_public_insert"
  on public.guestbook
  for insert
  to anon, authenticated
  with check (
    char_length(name)    between 1 and 30
    and char_length(message) between 1 and 300
  );

-- (수정/삭제 정책은 만들지 않음 → 익명 사용자는 수정/삭제 불가)
