/**
 * 무드 프리셋 ("시안").
 *
 * 각 테마는 색·타이포뿐 아니라 레이아웃과 효과 강도까지 함께 바꾼다.
 * 색만 갈아끼우면 결국 같은 영상으로 보이기 때문에, 여백·회전 속도·그레인처럼
 * 분위기를 실제로 결정하는 값들을 한 묶음으로 다룬다.
 *
 * 공통 방향: "감성 있되 화려하지 않게" — 채도를 낮추고, 요소 수를 줄이고,
 * 움직임을 느리게. 진행 바나 워터마크처럼 UI 같은 요소는 기본적으로 뺀다.
 */

export const THEME_PRESETS = {
  /* ───────────────────────────────────────────────────────────
   * Minuit — 미드나잇 파리. 가로등 아래 짙은 남색 밤.
   * 차가운 배경 + 놋쇠빛 조명의 대비가 핵심.
   * ─────────────────────────────────────────────────────────── */
  minuit: {
    label: 'Minuit · 미드나잇 파리',
    description: '짙은 남색 밤에 놋쇠빛 가로등. 차분하고 깊은 톤.',
    patch: {
      layout: 'vinyl3',
      theme: {
        accent: '#c9a063',
        ink: '#efe4cf',
        bg: '#080b12',
        fontDisplay: 'Playfair Display',
        fontBody: 'Nanum Myeongjo',
        fontAccent: 'Cormorant Garamond', accentItalic: true,
        fontScript: 'Great Vibes',
      },
      background: {
        blur: 62, scale: 1.16, brightness: 0.44, saturation: 0.78,
        kenBurns: 0.05, tint: '#0d1424', tintOpacity: 0.44, vignette: 0.7,
      },
      split: {
        enabled: true, centerRatio: 0.46, gap: 0, divider: 0.14,
        brightness: 0.78, edgeFade: 0.42, kenBurns: 0.06, stagger: 0,
      },
      vinyl: {
        sizeRatio: 0.58, centerY: 0.43, rpm: 3, tonearm: true,
        sheen: true, grooves: false, spindle: true,
        ringColor: '#c9a063', beatPulse: 0.008, entrance: 'fade',
      },
      lyrics: {
        fontSize: 0.037, bottomRatio: 0.155, maxWidthRatio: 0.66,
        color: '#f4ead6', face: 'accent', weight: 400, tracking: 0.03,
        translationFace: 'body', translationScale: 0.6, translationOpacity: 0.6,
        translationColor: '#e4d6bd', translationGap: 1.6,
        glow: 0.65, plate: 0, animation: 'rise', showNext: false, lineHeight: 1.3,
      },
      effects: {
        bokeh: 0.32, bokehCount: 16, grain: 0.075, lightLeak: 0.26,
        progressBar: false, letterbox: 0.045, watermark: '',
      },
      photos: { duration: 9, crossfade: 2.2 },
      intro: { caption: 'Minuit à Paris', duration: 6 },
    },
  },

  /* ───────────────────────────────────────────────────────────
   * Salon — 촛불 켠 실내. 세피아와 코냑 톤.
   * 넷 중 가장 따뜻하고 가장 부드럽다.
   * ─────────────────────────────────────────────────────────── */
  salon: {
    label: 'Salon · 촛불 살롱',
    description: '코냑빛 실내 조명. 따뜻하고 부드러운 세피아.',
    patch: {
      layout: 'vinyl3',
      theme: {
        accent: '#c08a4e',
        ink: '#f8eeda',
        bg: '#120b06',
        fontDisplay: 'Cormorant Garamond',
        fontBody: 'Nanum Myeongjo',
        fontAccent: 'Cormorant Garamond', accentItalic: true,
        fontScript: 'Great Vibes',
      },
      background: {
        blur: 52, scale: 1.2, brightness: 0.44, saturation: 1.02,
        kenBurns: 0.08, tint: '#3d2412', tintOpacity: 0.42, vignette: 0.62,
      },
      split: {
        enabled: true, centerRatio: 0.5, gap: 0, divider: 0.2,
        brightness: 0.84, edgeFade: 0.32, kenBurns: 0.08, stagger: 0,
      },
      vinyl: {
        sizeRatio: 0.66, centerY: 0.44, rpm: 5, tonearm: true,
        sheen: true, grooves: false, spindle: true,
        ringColor: '#c08a4e', beatPulse: 0.012, entrance: 'drop',
      },
      lyrics: {
        fontSize: 0.04, bottomRatio: 0.14, maxWidthRatio: 0.72,
        color: '#fbf3e2', face: 'body', weight: 400, tracking: 0.01,
        translationFace: 'body', translationScale: 0.66, translationOpacity: 0.68,
        translationColor: '#f0e0c4', translationGap: 1.45,
        glow: 0.55, plate: 0, animation: 'rise', showNext: false, lineHeight: 1.34,
      },
      effects: {
        bokeh: 0.55, bokehCount: 24, grain: 0.055, lightLeak: 0.34,
        progressBar: false, letterbox: 0, watermark: '',
      },
      photos: { duration: 8, crossfade: 1.8 },
      intro: { caption: 'Our Wedding Playlist', duration: 5.5 },
    },
  },

  /* ───────────────────────────────────────────────────────────
   * Pluie — 비 오는 창가. 3분할을 끄고 원 하나만 남긴 가장 절제된 안.
   * 요소가 적은 만큼 사진과 글자만 남는다.
   * ─────────────────────────────────────────────────────────── */
  pluie: {
    label: 'Pluie · 비 오는 창가',
    description: '3분할 없이 원 하나. 채도를 뺀 가장 조용한 안.',
    patch: {
      layout: 'vinyl3',
      theme: {
        accent: '#a89377',
        ink: '#ece7df',
        bg: '#0c0e10',
        fontDisplay: 'Italiana',
        fontBody: 'Nanum Myeongjo',
        fontAccent: 'Italiana',
        fontScript: 'Great Vibes',
      },
      background: {
        blur: 74, scale: 1.14, brightness: 0.4, saturation: 0.5,
        kenBurns: 0.04, tint: '#141a1f', tintOpacity: 0.4, vignette: 0.66,
      },
      // 3분할을 끄면 배경 블러가 화면 전체로 퍼진다
      split: { enabled: false },
      vinyl: {
        sizeRatio: 0.5, centerY: 0.42, rpm: 2.5, tonearm: false,
        sheen: true, grooves: false, spindle: true,
        ringColor: '#a89377', beatPulse: 0, entrance: 'fade',
      },
      lyrics: {
        fontSize: 0.034, bottomRatio: 0.17, maxWidthRatio: 0.6,
        color: '#f2ede4', face: 'accent', weight: 400, tracking: 0.075,
        translationFace: 'body', translationScale: 0.62, translationOpacity: 0.55,
        translationColor: '#ded7cb', translationGap: 1.7,
        glow: 0.5, plate: 0, animation: 'fade', showNext: false, lineHeight: 1.4,
      },
      effects: {
        bokeh: 0.14, bokehCount: 10, grain: 0.09, lightLeak: 0.08,
        progressBar: false, letterbox: 0.06, watermark: '',
      },
      photos: { duration: 11, crossfade: 2.8 },
      intro: { caption: 'Un Jour de Pluie', duration: 6.5 },
    },
  },

  /* ───────────────────────────────────────────────────────────
   * Bobine — 오래된 필름 릴. 그레인을 세게 올리고 레터박스를 넓게.
   * 색이 살짝 바랜 아카이브 영상 느낌.
   * ─────────────────────────────────────────────────────────── */
  bobine: {
    label: 'Bobine · 오래된 필름',
    description: '바랜 아카이브 필름. 굵은 그레인과 넓은 레터박스.',
    patch: {
      layout: 'vinyl3',
      theme: {
        accent: '#b5834a',
        ink: '#f0e4cd',
        bg: '#0f0c08',
        fontDisplay: 'Marcellus',
        fontBody: 'Nanum Myeongjo',
        fontAccent: 'Marcellus',
        fontScript: 'Great Vibes',
      },
      background: {
        blur: 44, scale: 1.22, brightness: 0.48, saturation: 0.72,
        kenBurns: 0.11, tint: '#4a3018', tintOpacity: 0.38, vignette: 0.7,
      },
      split: {
        enabled: true, centerRatio: 0.4, gap: 14, divider: 0,
        brightness: 0.8, edgeFade: 0.24, kenBurns: 0.1, stagger: 0.6,
      },
      vinyl: {
        sizeRatio: 0.62, centerY: 0.45, rpm: 6, tonearm: true,
        sheen: true, grooves: true, spindle: true,
        ringColor: '#b5834a', beatPulse: 0.016, entrance: 'drop',
      },
      lyrics: {
        fontSize: 0.036, bottomRatio: 0.175, maxWidthRatio: 0.7,
        color: '#f4e9d4', face: 'accent', weight: 400, tracking: 0.05,
        translationFace: 'body', translationScale: 0.64, translationOpacity: 0.66,
        translationColor: '#e6d5b6', translationGap: 1.5,
        glow: 0.45, plate: 0, animation: 'rise', showNext: false, lineHeight: 1.32,
      },
      effects: {
        bokeh: 0.22, bokehCount: 12, grain: 0.11, lightLeak: 0.4,
        progressBar: false, letterbox: 0.08, watermark: '',
      },
      photos: { duration: 7, crossfade: 1.4 },
      intro: { caption: 'Reel No. 1', duration: 5 },
    },
  },
};

/* ═══════════════════════════════════════════════════════════════
 * 가사 중심 컨셉 — LP/3분할 없이 바닥부터 다시 짠 안들.
 *
 * 공통 전제
 *   · 가사가 주인공, 사진은 받쳐주는 역할
 *   · 미드나잇 파리 톤 — 짙은 밤색 + 놋쇠빛, 낮은 채도
 *   · 장치를 줄이고 움직임을 느리게
 * ═══════════════════════════════════════════════════════════════ */

/** 네 안이 공유하는 밤 팔레트 — 안마다 조금씩만 비튼다 */
const NUIT = {
  accent: '#c9a063',
  ink: '#f0e6d4',
  bg: '#07090f',
};

Object.assign(THEME_PRESETS, {
  cinema: {
    label: 'Cinéma · 시네마 자막',
    description: '2.39:1 풀샷에 영화 자막. 사진은 크게, 글자는 담백하게.',
    patch: {
      layout: 'cinema',
      theme: {
        ...NUIT, bg: '#050608',
        fontDisplay: 'Cormorant Garamond',
        fontBody: 'Nanum Myeongjo',
        fontAccent: 'Cormorant Garamond', accentItalic: false,
        fontScript: 'Great Vibes',
      },
      lyrics: {
        fontSize: 0.036, maxWidthRatio: 0.74,
        color: '#f6efe2', face: 'body', weight: 400, tracking: 0.015,
        translationFace: 'body', translationScale: 0.68, translationOpacity: 0.72,
        translationColor: '#e8dcc6', translationGap: 1.35,
        glow: 0.7, plate: 0, animation: 'fade', showNext: false, lineHeight: 1.3,
      },
      effects: {
        bokeh: 0.1, bokehCount: 8, grain: 0.07, lightLeak: 0.14,
        progressBar: false, letterbox: 0, watermark: '',
      },
      photos: { duration: 8, crossfade: 1.8 },
      intro: { caption: 'Reel One', duration: 5.5 },
    },
  },

  marquee: {
    label: 'Marquee · 밤의 간판',
    description: '가사가 화면 한가운데 크게. 사진은 거의 지워진 배경.',
    patch: {
      layout: 'marquee',
      theme: {
        ...NUIT, accent: '#d0a76a', bg: '#06080e',
        fontDisplay: 'Playfair Display',
        fontBody: 'Nanum Myeongjo',
        fontAccent: 'Cormorant Garamond', accentItalic: true,
        fontScript: 'Great Vibes',
      },
      lyrics: {
        color: '#f6eeda', face: 'accent', weight: 400, tracking: 0.02,
        translationFace: 'body', translationScale: 0.44, translationOpacity: 0.55,
        translationColor: '#dbcdb2', translationGap: 1.9,
        glow: 0.5, plate: 0, animation: 'rise', showNext: false, lineHeight: 1.24,
        maxWidthRatio: 0.68,
      },
      effects: {
        bokeh: 0.4, bokehCount: 20, grain: 0.06, lightLeak: 0.3,
        progressBar: false, letterbox: 0.05, watermark: '',
      },
      photos: { duration: 10, crossfade: 3 },
      intro: { caption: 'Minuit à Paris', duration: 6 },
    },
  },

  defile: {
    label: 'Défilé · 흐르는 가사',
    description: '가사 여러 줄이 세로로 흐름. 유튜브 가사 영상에 가장 가까움.',
    patch: {
      layout: 'defile',
      theme: {
        ...NUIT, accent: '#c2a074', bg: '#080a0f',
        fontDisplay: 'Cormorant Garamond',
        fontBody: 'Nanum Myeongjo',
        fontAccent: 'Cormorant Garamond', accentItalic: true,
        fontScript: 'Great Vibes',
      },
      lyrics: {
        color: '#f5ecd9', dimColor: '#e8dcc4',
        face: 'accent', weight: 400, tracking: 0.018,
        translationFace: 'body', translationScale: 0.56, translationOpacity: 0.62,
        translationColor: '#dccdb0',
        glow: 0.45, plate: 0, showNext: false, lineHeight: 1.25,
      },
      effects: {
        bokeh: 0.22, bokehCount: 14, grain: 0.065, lightLeak: 0.18,
        progressBar: false, letterbox: 0, watermark: '',
      },
      photos: { duration: 9, crossfade: 2.4 },
      intro: { caption: 'Side A', duration: 5.5 },
    },
  },

  carte: {
    label: 'Carte Postale · 엽서',
    description: '기울인 사진 카드 + 옆 가사 컬럼. 잡지 지면 같은 편집 구성.',
    patch: {
      layout: 'carte',
      theme: {
        accent: '#bf9358', ink: '#f2e9d9', bg: '#0d0a08',
        fontDisplay: 'Marcellus',
        fontBody: 'Nanum Myeongjo',
        fontAccent: 'Cormorant Garamond', accentItalic: true,
        fontScript: 'Great Vibes',
      },
      lyrics: {
        color: '#f5ecdb', face: 'accent', weight: 400, tracking: 0.012,
        translationFace: 'body', translationScale: 0.6, translationOpacity: 0.62,
        translationColor: '#ddcdb2', translationGap: 1.5,
        glow: 0.4, plate: 0, animation: 'rise', showNext: false, lineHeight: 1.3,
      },
      effects: {
        bokeh: 0.28, bokehCount: 16, grain: 0.075, lightLeak: 0.26,
        progressBar: false, letterbox: 0, watermark: '',
      },
      photos: { duration: 9, crossfade: 1.6 },
      intro: { caption: 'Carte Postale', duration: 5.5 },
    },
  },

  duplex: {
    label: 'Duplex · 2단',
    description: '위 사진 / 아래 가사 패널. 가장 정돈되고 읽기 쉬움.',
    patch: {
      layout: 'duplex',
      theme: {
        accent: '#c49a62', ink: '#f1e8d8', bg: '#0a0c11',
        fontDisplay: 'Italiana',
        fontBody: 'Nanum Myeongjo',
        fontAccent: 'Italiana', accentItalic: false,
        fontScript: 'Great Vibes',
      },
      lyrics: {
        color: '#f4ecdc', face: 'body', weight: 400, tracking: 0.014,
        translationFace: 'body', translationScale: 0.64, translationOpacity: 0.6,
        translationColor: '#d9cbb1', translationGap: 1.4,
        glow: 0.25, plate: 0, animation: 'rise', showNext: false, lineHeight: 1.3,
      },
      effects: {
        bokeh: 0.12, bokehCount: 9, grain: 0.05, lightLeak: 0.12,
        progressBar: false, letterbox: 0, watermark: '',
      },
      photos: { duration: 7.5, crossfade: 1.5 },
      intro: { caption: 'Our Wedding Playlist', duration: 5 },
    },
  },
});

/**
 * 테마 patch를 프로젝트에 얹는다.
 * 사진 목록·음원·자막 텍스트처럼 사용자가 고른 값은 건드리지 않고
 * 무드에 해당하는 키만 덮어쓴다.
 */
export const applyTheme = (project, themeKey) => {
  const preset = THEME_PRESETS[themeKey];
  if (!preset) return project;

  const next = { ...project, themePreset: themeKey };
  for (const [section, values] of Object.entries(preset.patch)) {
    // layout처럼 스칼라인 키는 그대로 대입한다.
    // 객체로 취급해 펼치면 문자열이 인덱스별 문자로 쪼개진다.
    if (values === null || typeof values !== 'object' || Array.isArray(values)) {
      next[section] = values;
      continue;
    }
    next[section] = { ...project[section], ...values };
  }
  return next;
};
