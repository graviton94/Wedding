import { useEffect, useMemo, useRef, useState } from 'react';

/** public 상대 경로(`images/1.webp`)를 브라우저 URL로 (`/Wedding/images/1.webp`) */
export const publicUrl = (src) => {
  if (!src) return '';
  if (/^(https?:|data:|blob:)/.test(src)) return src;
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${String(src).replace(/^\/+/, '').replace(/^Wedding\//, '')}`;
};

/**
 * 사진들을 미리 디코딩해 캐시에 담는다.
 * 엔진의 getImage()는 동기 함수여야 하므로 반드시 렌더 전에 로딩이 끝나야 한다.
 */
export const useImageCache = (sources) => {
  // 캐시는 state로 둔다 — 렌더 중에 읽어야 ready/progress를 파생시킬 수 있고,
  // ref는 렌더 중 접근이 금지돼 있다.
  const [cache, setCache] = useState(() => new Map());
  // 중복 요청 방지용. effect 안에서만 읽으므로 ref로 둬도 안전하다.
  const requestedRef = useRef(new Set());

  // 배열 아이덴티티가 매번 바뀌므로 내용 기준으로 고정
  const key = useMemo(() => (sources || []).join('|'), [sources]);
  const list = useMemo(() => (key ? key.split('|') : []), [key]);

  useEffect(() => {
    const missing = list.filter((s) => s && !requestedRef.current.has(s));
    if (!missing.length) return;

    for (const src of missing) {
      requestedRef.current.add(src);
      const img = new Image();
      img.crossOrigin = 'anonymous';
      // 목록이 바뀌어도 진행 중인 로딩은 그대로 끝낸다 — 캐시는 누적이라 버릴 이유가 없다
      const done = (value) => setCache((prev) => new Map(prev).set(src, value));
      img.onload = () => done(img);
      img.onerror = () => done(null);
      img.src = publicUrl(src);
    }
  }, [list]);

  const loaded = list.filter((s) => cache.has(s)).length;

  return {
    ready: loaded === list.length,
    progress: { loaded, total: list.length },
    getImage: (src) => (src ? cache.get(src) || null : null),
  };
};

/** 웹폰트가 다 뜬 뒤에 그려야 미리보기 글자 폭이 최종물과 맞는다 */
export const useFontsReady = () => {
  // document.fonts가 없는 환경은 처음부터 준비된 것으로 본다
  const [ready, setReady] = useState(() => !document.fonts);
  useEffect(() => {
    if (!document.fonts) return;
    let cancelled = false;
    document.fonts.ready.then(() => { if (!cancelled) setReady(true); });
    return () => { cancelled = true; };
  }, []);
  return ready;
};

/**
 * 오디오 엘리먼트를 만들고 길이를 알아낸다.
 * 재생 위치는 이 엘리먼트가 진실의 원천 — 캔버스가 오디오를 따라가야 립싱크가 맞는다.
 */
export const useAudio = (src, startAt = 0) => {
  const audioRef = useRef(null);
  // src를 함께 담아둔다 — 음원이 바뀌면 이전 길이/에러가 자동으로 무효가 되므로
  // effect 안에서 초기화 setState를 호출할 필요가 없다
  const [meta, setMeta] = useState({ src: null, duration: null, error: null });

  useEffect(() => {
    if (!src) {
      audioRef.current = null;
      return;
    }
    const audio = new Audio(publicUrl(src));
    audio.preload = 'auto';
    audioRef.current = audio;

    const onMeta = () => setMeta({ src, duration: audio.duration, error: null });
    const onErr = () => setMeta({ src, duration: null, error: `음원을 불러올 수 없습니다: ${src}` });
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('error', onErr);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('error', onErr);
      audioRef.current = null;
    };
  }, [src]);

  // 현재 src에 대한 정보일 때만 유효
  const fresh = meta.src === src;
  const duration = fresh ? meta.duration : null;
  const usable = duration != null ? Math.max(1, duration - startAt) : null;

  return { audioRef, duration, usableDuration: usable, error: fresh ? meta.error : null };
};
