# 💌 Wedding Invitation — 최준영 & 민수영

모바일 청첩장 싱글 페이지 웹앱. 라이트/다크 테마, 갤러리, 방명록, 계좌 안내, 오시는 길, 참석 의사 등을 담았습니다.

**라이브:** https://graviton94.github.io/Wedding/

---

## 기술 스택
- **React 19** + **Vite 7**
- **Tailwind CSS v4** (`@config`로 `tailwind.config.js` 로드, 디자인 토큰은 `src/index.css`의 CSS 변수)
- **Framer Motion** (스크롤 리빌, 로딩/파티클 애니메이션)
- **Swiper** (갤러리 라이트박스)
- **Supabase** (방명록 저장/조회 — REST)

## 주요 기능
- 🌗 **라이트/다크 테마 토글** (우상단, 기본 다크, 선택은 `localStorage` 저장)
- 📸 갤러리(대표컷 + 그리드) · 라이트박스(사진 번호/스와이프)
- ✍️ **방명록** — Supabase에 저장·표시 (등록 시 골드 축하 연출)
- 💳 계좌 안내(양가, 연락처 포함) · 원터치 복사
- 📍 오시는 길 — 카카오맵/네이버 링크, 주소 복사, **캘린더 일정 추가**(iOS `.ics` / 안드로이드 Google 캘린더)
- 📝 참석 의사 — Google Form 링크
- 🔗 링크 공유 · D-day 카운트다운 · 골드 파티클 / Ken Burns / 스크롤 진행바
- 🎬 **웨딩 영상 스튜디오** — 청첩장 사진으로 플레이리스트 영상을 만들어 MP4로 렌더링 ([문서](docs/VIDEO.md))

---

## 🎬 웨딩 영상 만들기

3분할 화면 [사진 | 회전하는 LP | 사진] + 하단 가사 자막 구성의 유튜브 플레이리스트 스타일
영상을 만들고 MP4로 뽑을 수 있습니다.

```bash
npm run dev            # → http://localhost:5173/Wedding/#/studio 에서 구성 편집
npm run video:fonts    # 최초 1회 — 렌더용 한글 폰트 다운로드
npm run video:render   # video.project.json → out/*.mp4 (H.264 + AAC)
```

웹 디자이너와 CLI 렌더러가 **같은 캔버스 엔진**(`src/video/engine`)을 쓰기 때문에
브라우저에서 본 미리보기가 그대로 최종 mp4로 나옵니다.
자세한 사용법·옵션·자막(.lrc) 작성법은 **[docs/VIDEO.md](docs/VIDEO.md)** 참고.

> 가사 텍스트와 음원은 저장소에 포함하지 않습니다. 직접 준비한 `.lrc`/음원을 쓰고,
> 공개 배포 시에는 이용 권리를 확인하세요.

---

## 콘텐츠 수정 (개발 지식 없이)
대부분의 텍스트·이미지·계좌·링크는 **`src/data/content.json`** 한 곳에서 수정합니다.
- 신랑/신부·부모 성함, 날짜/시간, 인사말
- 갤러리 이미지 경로, 예식장/주소/좌표/교통편
- 양가 계좌·연락처, RSVP 폼 URL
- 방명록 Supabase 설정(`supabaseUrl`, `supabaseKey` — publishable 키는 공개돼도 되는 키)

이미지는 `public/images/`, 음악은 `public/music/`.

## 로컬 개발
```bash
npm install
npm run dev      # 개발 서버
npm run build    # 프로덕션 빌드
npm run lint     # 린트

npm run video:fonts     # 영상 렌더용 폰트 받기 (최초 1회)
npm run video:render    # MP4 렌더링
npm run video:preview   # 640x360 저화질 빠른 렌더
```

## 배포 (자동)
`main` 브랜치에 push하면 **GitHub Actions**(`.github/workflows/deploy.yml`)가 빌드 후 자동 배포합니다.
- GitHub 저장소 **Settings → Pages → Source = "GitHub Actions"** 여야 합니다.
- 경로 기준(base)은 `/Wedding/` (`vite.config.js`).

## 방명록(Supabase) 설정
`supabase/guestbook_setup.sql`을 Supabase SQL Editor에 붙여넣어 실행하면 테이블과 보안 정책(익명 insert/select, 길이 제한)이 생성됩니다. 이후 Project URL과 anon(publishable) 키를 `content.json`의 `guestbook`에 넣으면 됩니다. 자세한 절차는 해당 SQL 파일 상단 주석 참고.

## 이미지 최적화 메모
갤러리/히어로 이미지는 WebP로 변환·리사이즈되어 있습니다(약 90% 용량 절감). 새 이미지를 추가할 때도 WebP + 적정 해상도(히어로 ~1600px, 갤러리 ~1200px)를 권장합니다. 공유 썸네일 `og.jpg`만 카카오톡 호환을 위해 JPG로 유지합니다.

## 프로젝트 구조
```text
src/
├── components/
│   ├── layout/     # Footer
│   ├── sections/   # Hero, Greeting, Gallery, Map, Money, RSVP, Guestbook, Share
│   └── ui/         # Button, Modal, Accordion, ThemeToggle, LoadingScreen,
│                   #  GoldDustEffect, ScrollProgress, DDayCounter, CalendarButton ...
├── data/content.json   # ⭐ 모든 콘텐츠
├── hooks/              # useCopyToClipboard, useScrollAnimation
├── video/
│   ├── engine/     # 캔버스 렌더 엔진 (브라우저·Node 공용)
│   └── studio/     # 웹 디자이너 UI (#/studio)
├── index.css           # 디자인 토큰(테마별 CSS 변수)
├── Root.jsx            # 해시 라우팅 (청첩장 / #/studio)
└── App.jsx
tools/video/                   # MP4 렌더러 CLI
supabase/guestbook_setup.sql   # 방명록 테이블/정책
```
