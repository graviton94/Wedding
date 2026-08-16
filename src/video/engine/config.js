/**
 * 프로젝트 설정 스키마 + 기본값.
 *
 * 이 JSON 하나가 "웹 디자이너(스튜디오)"와 "Node MP4 렌더러"의 단일 계약이다.
 *   스튜디오에서 편집 → project.json 내보내기 → npm run video:render -- --project project.json
 * 두 실행 환경이 같은 config를 같은 엔진에 넣으므로 미리보기 = 최종 결과물이 된다.
 */

export const PROJECT_VERSION = 1;

/** 자주 쓰는 출력 규격 프리셋 */
export const CANVAS_PRESETS = {
  youtube: { label: 'YouTube 가로 1080p', width: 1920, height: 1080, fps: 30 },
  youtube4k: { label: 'YouTube 가로 4K', width: 3840, height: 2160, fps: 30 },
  shorts: { label: 'Shorts/릴스 세로', width: 1080, height: 1920, fps: 30 },
  square: { label: '인스타 정사각', width: 1080, height: 1080, fps: 30 },
};

/** 청첩장 사이트에서 쓰는 사진들 (public/images) */
export const INVITATION_PHOTOS = [
  'hero.webp', 'main.webp', '1.webp', '2.webp', '3.webp', '4.webp', '5.webp', '6.webp',
  '7.webp', '8.webp', '9.webp', '10.webp', '11.webp', '12.webp', '13.webp', '14.webp', '15.webp',
];

/**
 * 사진 경로 규칙
 *  - 브라우저: import.meta.env.BASE_URL 기준 (`/Wedding/images/1.webp`)
 *  - Node: 프로젝트 루트의 `public/` 기준으로 리졸브 (render.mjs가 처리)
 * config에는 `images/1.webp` 같은 public 상대 경로만 저장한다.
 */
export const defaultPhotos = () =>
  INVITATION_PHOTOS.map((file) => ({
    src: `images/${file}`,
    // 크롭 기준점 (0~1). 인물이 위쪽에 있는 세로 사진은 y를 낮춘다.
    focusX: 0.5,
    focusY: 0.42,
    // 개별 노출 시간(초). null이면 photos.duration을 따른다.
    duration: null,
  }));

export const createDefaultProject = (overrides = {}) => ({
  version: PROJECT_VERSION,
  name: 'wedding-playlist',

  canvas: { ...CANVAS_PRESETS.youtube },

  /** 오디오: public 상대 경로. duration=null이면 음원 길이 전체를 쓴다 */
  audio: {
    src: 'music/1.mp3',
    startAt: 0,      // 음원에서 잘라낼 시작 지점(초)
    volume: 1,
    fadeIn: 1.5,
    fadeOut: 4,
  },

  /** 영상 길이(초). null이면 음원 길이 - startAt */
  duration: null,

  photos: {
    items: defaultPhotos(),
    duration: 7,        // 사진 1장당 기본 노출 시간
    crossfade: 1.6,     // 사진 전환 크로스페이드
    loop: true,         // 사진이 모자라면 처음부터 반복
    order: 'sequence',  // 'sequence' | 'shuffle'
    shuffleSeed: 20260920,
  },

  /**
   * 중앙 LP — 검은 판 없이 "사진 한 장이 원 전체".
   * photo는 고정이고 시계 방향으로 천천히 돈다.
   */
  vinyl: {
    enabled: true,
    photo: 'images/hero.webp', // 원에 들어갈 고정 사진 (비우면 첫 번째 사진)
    rpm: 4,             // 실제 33rpm은 너무 빨라서 느리게
    sizeRatio: 0.68,    // 캔버스 짧은 변 대비 지름
    centerX: 0.5,       // 캔버스 폭 대비 위치
    centerY: 0.45,
    grooves: false,     // 사진 위에 얹는 옅은 LP 홈 질감
    sheen: true,        // 회전하는 광택
    tonearm: true,      // 은/금 톤암
    spindle: true,      // 가운데 축 구멍
    ringColor: '#c9a267',
    beatPulse: 0.01,    // 사진 전환 때 살짝 커지는 정도 (0이면 off)
    entrance: 'drop',   // 'drop' | 'fade' | 'none'
  },

  /** 배경: 현재 사진을 크게 블러 */
  background: {
    enabled: true,
    blur: 46,
    scale: 1.18,
    // 흰 배경 스튜디오 컷이 섞여 있어 이 정도로 눌러야 자막/LP판이 살아난다
    brightness: 0.46,
    saturation: 1.12,
    kenBurns: 0.06,     // 배경 서서히 확대되는 양
    tint: '#1a1410',
    tintOpacity: 0.34,
    vignette: 0.55,
  },

  /** 3분할 화면 — [사진 | 중앙 LP | 사진] */
  split: {
    enabled: true,
    centerRatio: 0.44,  // 중앙 컬럼 폭 비율 (나머지를 좌우가 반씩)
    gap: 0,             // 컬럼 사이 간격 px
    divider: 0.3,       // 경계선 진하기 (0=없음)
    brightness: 0.82,   // 좌우 컬럼 밝기 — 중앙이 앞으로 나와 보이게 살짝 누른다
    edgeFade: 0.35,     // 안쪽 가장자리 그라데이션
    kenBurns: 0.07,     // 컬럼 안에서 서서히 확대/이동
    stagger: 0,         // 오른쪽 컬럼 전환 지연 (초)
  },

  /** 하단 가사 자막 */
  lyrics: {
    enabled: true,
    /** public 상대 경로의 .lrc 파일. 스튜디오에서 불러오면 lrcText에 인라인된다 */
    lrcSrc: 'video/lyrics/sample.lrc',
    lrcText: '',
    offset: 0,          // 초 단위 미세 보정 (+면 자막이 늦게)
    fontSize: 0.042,    // 캔버스 높이 대비 비율
    lineHeight: 1.35,
    maxWidthRatio: 0.78,
    bottomRatio: 0.14,  // 아래에서 띄울 거리 (캔버스 높이 대비)
    color: '#ffffff',
    dimColor: '#ffffff',
    dimOpacity: 0.38,
    showNext: true,     // 다음 줄 미리보기
    align: 'center',
    animation: 'rise',  // 'rise' | 'fade' | 'none'
    glow: 0.5,
    plate: 0.0,         // 자막 뒤 반투명 판 (0=없음)
    karaoke: true,      // enhanced LRC 워드 태그가 있으면 단어별 하이라이트
    karaokeColor: '#f0c98a',
  },

  /** 인트로/아웃트로 타이틀 */
  intro: {
    enabled: true,
    duration: 5,
    title: '최준영 ♥ 민수영',
    subtitle: '2026. 09. 20',
    caption: 'Our Wedding Playlist',
  },
  outro: {
    enabled: true,
    duration: 6,
    title: 'Thank You',
    subtitle: '함께해 주셔서 감사합니다',
    caption: '',
  },

  /** 화면 전체 효과 */
  effects: {
    bokeh: 0.55,        // 떠다니는 빛망울 강도 (0=off)
    bokehCount: 26,
    grain: 0.05,
    lightLeak: 0.22,
    progressBar: true,
    letterbox: 0,       // 위아래 검은 띠 비율 (0=없음)
    watermark: '',
  },

  theme: {
    accent: '#b98a52',
    ink: '#f6f1e7',
    bg: '#0d0b09',
    fontDisplay: 'Cormorant Garamond',
    fontBody: 'Noto Serif KR',
    fontScript: 'Great Vibes',
  },

  seed: 20260920,

  ...overrides,
});

/** 저장된 project.json을 기본값과 깊게 병합 (스키마 확장에도 구버전 파일이 열리도록) */
export const mergeProject = (saved) => {
  const base = createDefaultProject();
  if (!saved || typeof saved !== 'object') return base;

  const deepMerge = (a, b) => {
    if (Array.isArray(b)) return b;
    if (b === null || typeof b !== 'object') return b === undefined ? a : b;
    const out = { ...a };
    for (const key of Object.keys(b)) {
      out[key] = key in a && a[key] && typeof a[key] === 'object' && !Array.isArray(a[key])
        ? deepMerge(a[key], b[key])
        : b[key];
    }
    return out;
  };

  const merged = deepMerge(base, saved);
  if (!merged.photos.items?.length) merged.photos.items = defaultPhotos();
  return merged;
};
