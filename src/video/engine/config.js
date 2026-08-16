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

  /**
   * 화면 구조. layouts/index.js의 키.
   * 'cinema' | 'marquee' | 'defile' | 'carte' | 'duplex' | 'vinyl3'
   */
  layout: 'vinyl3',

  /** 레이아웃별 세부 값. 쓰지 않는 레이아웃의 값은 무시된다. */
  layouts: {
    /** 시네마 자막 — 2.39:1 풀블리드 + 하단 자막 */
    cinema: {
      aspect: 2.39,
      // 2.39:1은 가장 납작한 틀이라 세로 사진을 cover로 넣으면 3배 넘게 확대된다.
      // blur 채움이라야 사진 전체가 보인다.
      fit: 'blur',
      blurDim: 0.75,
      edgeFeather: 0.06,
      pushIn: 0.09,        // 슬롯 동안 서서히 확대
      brightness: 0.72,    // 색 보정 — 검은 막보다 먼저 걸어야 밤 톤이 된다
      saturation: 0.82,
      tint: '#101828',
      tintOpacity: 0.22,
      dim: 0.14,           // 마지막으로 살짝 더 누르기
      edgeShade: 0.45,     // 프레임 위아래 가장자리 음영
      subtitleInset: 0.1,  // 프레임 아래에서 자막까지의 거리 (프레임 높이 대비)
      slate: 'Our Wedding Playlist', // 좌상단 작은 라벨 (비우면 없음)
    },

    /** 밤의 간판 — 가사가 화면 한가운데, 사진은 배경으로만 */
    marquee: {
      // 세로 사진 전체를 가운데 두고 양옆은 같은 사진을 흐리게 늘려 메운다.
      // cover로 자르면 인물이 잘리고, contain으로 두면 양옆이 텅 빈다.
      fit: 'blur',
      blurDim: 0.9,     // 배경과 본 사진의 밝기 차가 크면 이음새가 보인다
      edgeFeather: 0.07,
      // 흰 스튜디오 컷을 밤으로 내리려면 밝기를 확실히 떨어뜨려야 한다.
      // dim(검은 막)만 올리면 밤이 아니라 회색이 된다.
      brightness: 0.3,
      saturation: 0.38,
      tint: '#0b1220',
      tintOpacity: 0.4,
      dim: 0.1,
      centerY: 0.5,
      fontSize: 0.058,     // 캔버스 높이 대비 — 다섯 안 중 가장 큼
      halo: 0.1,           // 글자 뒤 은은한 빛
      rule: 0.35,          // 위아래 규칙선 진하기 (0=없음)
      ruleWidth: 0.19,     // 규칙선 길이 (반폭 비율)
      ruleGap: 0.135,      // 중심에서 규칙선까지 거리
    },

    /** 흐르는 가사 — 세로 스크롤 목록 + 옆 사진 컬럼 */
    defile: {
      photoSide: 'right',  // 'left' | 'right'
      // 컬럼이 세로로 길어(0.36×1080 → 세로비 1.56) 2:3 사진이 잘 들어간다
      fit: 'cover',
      photoWidth: 0.36,
      brightness: 0.66,
      saturation: 0.7,
      tint: '#0d1420',
      tintOpacity: 0.26,
      photoDim: 0.1,
      blend: 0.75,         // 사진을 글자 쪽으로 녹이는 정도
      rule: 0.16,
      fontSize: 0.042,
      lineGap: 2.15,       // 줄 간격 (글자 크기 배수)
      visibleLines: 3,     // 현재 줄 위아래로 보여줄 줄 수
    },

    /** 엽서 — 기울인 사진 카드 + 옆 가사 컬럼 */
    carte: {
      cardSide: 'right',
      cardWidth: 0.3,
      cardAspect: 0.78,    // 카드 가로/세로
      cardInset: 0.075,    // 화면 가장자리 여백
      cardY: 0.47,
      tilt: -2.6,          // 기울기(도)
      matte: 0.045,        // 종이 여백 (카드 폭 대비)
      matteBottom: 2.6,    // 아래 여백 배수 (폴라로이드 느낌)
      paper: '#efe7d8',
      caption: 'No. {n}',  // {n} → 사진 번호. 비우면 없음
      groundBrightness: 0.42,  // 바탕에 깔린 사진
      groundSaturation: 0.5,
      groundDim: 0.42,
      wash: 0.1,           // 위에서 떨어지는 조명
      textWidth: 0.36,
      textInset: 0.075,
      textY: 0.55,
      fontSize: 0.04,
    },

    /**
     * 2단 — 사진 / 가사 패널.
     * vertical  : [사진(전체 높이) | 패널] — 세로 사진이 거의 안 잘린다 (기본)
     * horizontal: [위 사진 / 아래 패널] — 가로 사진용
     */
    duplex: {
      orientation: 'vertical',
      photoSide: 'left',
      /*
       * vertical일 때는 사진 영역의 '가로' 비율.
       * 0.42 × 1920 = 806 × 1080 → 세로비 0.75. 2:3(0.67) 사진이
       * 세로의 90% 넘게 그대로 들어간다. (가로 띠였다면 25%만 남았다)
       */
      photoRatio: 0.42,
      fit: '',             // 비우면 방향에 맞는 기본값 (vertical=cover, horizontal=blur)
      pushIn: 0.07,
      brightness: 0.82,
      saturation: 0.88,
      tint: '#121a26',
      tintOpacity: 0.16,
      photoDim: 0.04,
      panelColor: '',      // 비우면 theme.bg
      feather: 0.05,       // 사진→패널 경계를 녹이는 폭/높이
      rule: 0.4,
      textY: 0.46,         // 패널 안에서 가사 위치
      fontSize: 0.04,
      trackInfo: 'Our Wedding Playlist', // 패널 하단 라벨 (비우면 없음)
    },
  },

  /** 3분할 화면 — [사진 | 중앙 LP | 사진] (layout='vinyl3'일 때만) */
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

    /**
     * 2개 국어 자막. 같은 시각에 놓인 두 줄을 원문+번역 한 쌍으로 묶는다.
     *   [00:24.10]English line
     *   [00:24.10]한국어 번역
     */
    bilingual: true,
    translationFirst: false,  // true면 번역을 위(큰 글씨)로
    translationScale: 0.66,   // 원문 대비 번역 글자 크기
    translationOpacity: 0.7,
    translationColor: '',     // 비우면 원문 색을 따름
    translationGap: 1.45,     // 두 줄 사이 간격 (번역 글자 크기 배수)
    translationFace: 'body',
    translationWeight: 300,

    /** 원문 서체 — theme의 어느 폰트를 쓸지 ('body'|'display'|'accent'|'script') */
    face: 'body',
    weight: 500,
    tracking: 0.012,          // 자간 (글자 크기 배수)

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

  /** 적용된 무드 프리셋 키 (themes.js) — 참고용, 렌더에는 영향 없음 */
  themePreset: 'salon',

  theme: {
    accent: '#b98a52',
    ink: '#f6f1e7',
    bg: '#0d0b09',
    fontDisplay: 'Cormorant Garamond',
    fontBody: 'Noto Serif KR',
    fontAccent: 'Cormorant Garamond',
    accentItalic: true,   // accent 서체를 이탤릭으로 (CSS font-style)
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
