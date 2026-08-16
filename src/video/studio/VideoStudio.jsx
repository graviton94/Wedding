import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  buildScene, createDefaultProject, mergeProject, requiredSources, formatTime,
} from '../engine/index.js';
import PreviewCanvas from './PreviewCanvas.jsx';
import LyricsPanel from './LyricsPanel.jsx';
import { useAudio, useFontsReady, useImageCache, publicUrl } from './useAssets.js';
import { Btn } from './controls.jsx';
import {
  BackgroundPanel, EffectsPanel, LyricsStylePanel, OutputPanel,
  PhotosPanel, SplitPanel, TextPanel, VinylPanel,
} from './panels.jsx';

const STORAGE_KEY = 'video-studio:project:v1';

const TABS = [
  { id: 'output', label: '출력' },
  { id: 'photos', label: '사진' },
  { id: 'vinyl', label: 'LP' },
  { id: 'split', label: '3분할' },
  { id: 'background', label: '배경' },
  { id: 'lyrics', label: '가사' },
  { id: 'lyricsStyle', label: '자막 스타일' },
  { id: 'text', label: '타이틀' },
  { id: 'effects', label: '효과' },
];

const VideoStudio = () => {
  const [project, setProject] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return mergeProject(JSON.parse(saved));
    } catch {
      /* 저장본이 깨졌으면 기본값으로 */
    }
    return createDefaultProject();
  });

  const [tab, setTab] = useState('output');
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const importRef = useRef(null);

  // 오디오는 set()보다 먼저 만들어져야 한다 — src 변경 시 즉시 정지시키기 위해
  const fontsReady = useFontsReady();
  const { audioRef, duration: audioDuration, usableDuration, error: audioError } =
    useAudio(project.audio.src, project.audio.startAt);

  const stopPlayback = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, [audioRef]);

  /**
   * 섹션 단위 부분 갱신. section=null이면 최상위 키를 고친다.
   * 음원 경로가 바뀌면 재생을 즉시 멈춘다 — 엉뚱한 지점에서 계속 돌지 않도록.
   */
  const set = useCallback((section, patch) => {
    if (section === 'audio' && 'src' in patch) stopPlayback();
    setProject((prev) =>
      section ? { ...prev, [section]: { ...prev[section], ...patch } } : { ...prev, ...patch },
    );
  }, [stopPlayback]);

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
      } catch {
        /* 용량 초과 등은 무시 — 저장 실패해도 편집은 계속돼야 한다 */
      }
    }, 400);
    return () => clearTimeout(id);
  }, [project]);

  // 처음 열었을 때 lrcSrc가 가리키는 자막을 자동으로 읽어온다.
  // CLI 렌더러도 같은 경로를 읽으므로 양쪽이 기본 상태에서 같은 자막을 쓴다.
  const lrcSrc = project.lyrics.lrcSrc;
  const hasLrcText = Boolean(project.lyrics.lrcText);
  useEffect(() => {
    if (hasLrcText || !lrcSrc) return;
    let cancelled = false;
    fetch(publicUrl(lrcSrc))
      .then((res) => (res.ok ? res.text() : null))
      .then((text) => {
        if (text && !cancelled) set('lyrics', { lrcText: text });
      })
      .catch(() => { /* 없으면 그냥 빈 자막으로 시작 */ });
    return () => { cancelled = true; };
  }, [lrcSrc, hasLrcText, set]);

  // ── 에셋 ──
  const total = project.duration || usableDuration || 60;

  const scene = useMemo(() => buildScene(project, total), [project, total]);

  // LP 고정 사진은 슬라이드쇼 목록에 없을 수도 있으므로 따로 챙긴다
  const sources = useMemo(() => {
    const list = requiredSources(scene);
    const label = project.vinyl.photo;
    return label && !list.includes(label) ? [...list, label] : list;
  }, [scene, project.vinyl.photo]);

  const { ready: imagesReady, progress, getImage } = useImageCache(sources);
  const ready = imagesReady && fontsReady;

  // ── 트랜스포트 ──
  const seek = useCallback((t) => {
    const clamped = Math.max(0, Math.min(t, total));
    setTime(clamped);
    if (audioRef.current) audioRef.current.currentTime = clamped + project.audio.startAt;
  }, [total, audioRef, project.audio.startAt]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) {
      setPlaying((p) => !p);
      return;
    }
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      if (time >= total - 0.05) seek(0);
      audio.currentTime = Math.max(0, time) + project.audio.startAt;
      audio.volume = Math.min(1, project.audio.volume);
      audio.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    }
  }, [playing, time, total, audioRef, seek, project.audio.startAt, project.audio.volume]);

  // 스페이스바 = 재생/정지
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Space') return;
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
      e.preventDefault();
      togglePlay();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePlay]);

  // ── 프로젝트 입출력 ──
  const exportProject = () => {
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'video.project.json';
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importProject = async (file) => {
    if (!file) return;
    try {
      stopPlayback();
      setProject(mergeProject(JSON.parse(await file.text())));
      setTime(0);
    } catch (err) {
      alert(`프로젝트를 읽지 못했습니다: ${err.message}`);
    }
  };

  const resetProject = () => {
    if (confirm('모든 설정을 기본값으로 되돌립니다. 계속할까요?')) {
      stopPlayback();
      setProject(createDefaultProject());
      setTime(0);
    }
  };

  const renderCmd = 'npm run video:render -- --project video.project.json';

  const panelProps = { project, set };

  return (
    <div className="min-h-screen bg-neutral-950 text-white/90">
      <header className="border-b border-white/10 px-4 py-2.5 flex items-center gap-3 sticky top-0 z-20 bg-neutral-950/95 backdrop-blur">
        <h1 className="text-sm tracking-wide">
          <span className="text-amber-300">◉</span> 웨딩 영상 스튜디오
        </h1>
        <span className="text-[10px] text-white/30 hidden sm:inline">
          {project.canvas.width}×{project.canvas.height} · {project.canvas.fps}fps · {formatTime(total)}
        </span>
        <div className="ml-auto flex gap-1.5">
          <Btn onClick={() => importRef.current?.click()}>불러오기</Btn>
          <input ref={importRef} type="file" accept=".json" className="hidden"
            onChange={(e) => importProject(e.target.files?.[0])} />
          <Btn onClick={exportProject} variant="primary">프로젝트 내보내기</Btn>
          <Btn onClick={resetProject} variant="danger">초기화</Btn>
          <a href={import.meta.env.BASE_URL} className="px-3 py-1.5 rounded border border-white/12
             bg-white/8 hover:bg-white/14 text-xs">청첩장</a>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row">
        {/* ───────── 미리보기 ───────── */}
        <main className="flex-1 p-4 lg:p-6 min-w-0">
          <div className="relative max-w-[1120px] mx-auto">
            <PreviewCanvas
              scene={scene}
              getImage={getImage}
              playing={playing}
              time={time}
              onTimeChange={setTime}
              audioRef={audioRef}
              audioStartAt={project.audio.startAt}
            />
            {!ready && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70 rounded-lg text-xs">
                에셋 로딩 중… {progress.loaded}/{progress.total}
              </div>
            )}
          </div>

          {/* 트랜스포트 */}
          <div className="max-w-[1120px] mx-auto mt-3">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-amber-400 text-neutral-900 flex items-center
                           justify-center hover:bg-amber-300 transition-colors shrink-0"
                aria-label={playing ? '일시정지' : '재생'}
              >
                {playing ? '❚❚' : '▶'}
              </button>
              <input
                type="range" min={0} max={total} step={0.05} value={time}
                onChange={(e) => seek(Number(e.target.value))}
                className="flex-1 accent-amber-300 cursor-pointer"
              />
              <span className="text-[11px] tabular-nums text-white/50 w-20 text-right shrink-0">
                {formatTime(time)} / {formatTime(total)}
              </span>
            </div>

            {/* 사진 슬롯 타임라인 */}
            <div className="mt-2 h-6 relative rounded overflow-hidden bg-white/5">
              {scene.timeline.slots.map((slot) => (
                <button
                  key={slot.index}
                  onClick={() => seek(slot.start)}
                  title={`${slot.src} · ${slot.start.toFixed(1)}s`}
                  className="absolute top-0 h-full border-r border-black/50 hover:brightness-125"
                  style={{
                    left: `${(slot.start / total) * 100}%`,
                    width: `${((slot.end - slot.start) / total) * 100}%`,
                    backgroundImage: `url(${publicUrl(slot.src)})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: slot.index % 2 ? 0.55 : 0.85,
                  }}
                />
              ))}
              <div className="absolute top-0 h-full w-0.5 bg-amber-300 pointer-events-none"
                style={{ left: `${(time / total) * 100}%` }} />
            </div>
            <div className="flex justify-between text-[9px] text-white/25 mt-0.5">
              <span>진한 칸 = 왼쪽 컬럼 · 옅은 칸 = 오른쪽 컬럼</span>
              <span>Space = 재생/정지</span>
            </div>

            {audioError && (
              <p className="mt-2 text-[11px] text-red-300/80">{audioError}</p>
            )}

            {/* 렌더 안내 */}
            <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-3">
              <h2 className="text-[11px] tracking-wide text-amber-200/70 mb-1.5">MP4로 뽑기</h2>
              <ol className="text-[11px] text-white/50 space-y-1 leading-relaxed list-decimal list-inside">
                <li><b className="text-white/70">프로젝트 내보내기</b> → <code className="text-amber-200/70">video.project.json</code> 을 저장소 루트에 놓기</li>
                <li>터미널에서 아래 명령 실행 (처음 한 번은 <code className="text-amber-200/70">npm run video:fonts</code>)</li>
              </ol>
              <div className="mt-2 flex gap-1.5 items-center">
                <code className="flex-1 text-[11px] bg-black/50 rounded px-2 py-1.5 text-amber-100/80 overflow-x-auto whitespace-nowrap">
                  {renderCmd}
                </code>
                <Btn onClick={() => navigator.clipboard?.writeText(renderCmd)}>복사</Btn>
              </div>
              <p className="text-[10px] text-white/30 mt-1.5">
                미리보기와 최종 mp4는 같은 렌더 엔진을 씁니다 — 여기서 보이는 화면이 그대로 나옵니다.
              </p>
            </div>
          </div>
        </main>

        {/* ───────── 컨트롤 패널 ───────── */}
        <aside className="w-full lg:w-[360px] shrink-0 border-t lg:border-t-0 lg:border-l border-white/10">
          <nav className="flex flex-wrap gap-0.5 p-2 border-b border-white/10 sticky top-[49px] bg-neutral-950/95 backdrop-blur z-10">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-2.5 py-1 rounded text-[11px] transition-colors ${
                  tab === t.id ? 'bg-amber-400/90 text-neutral-900 font-medium' : 'text-white/50 hover:bg-white/8'
                }`}
              >
                {t.label}
              </button>
            ))}
          </nav>

          <div className="p-3 lg:h-[calc(100vh-98px)] lg:overflow-y-auto">
            {tab === 'output' && <OutputPanel {...panelProps} audioDuration={audioDuration} />}
            {tab === 'photos' && <PhotosPanel {...panelProps} />}
            {tab === 'vinyl' && <VinylPanel {...panelProps} />}
            {tab === 'split' && <SplitPanel {...panelProps} />}
            {tab === 'background' && <BackgroundPanel {...panelProps} />}
            {tab === 'lyrics' && (
              <LyricsPanel {...panelProps} time={time} seek={seek} playing={playing} togglePlay={togglePlay} />
            )}
            {tab === 'lyricsStyle' && <LyricsStylePanel {...panelProps} />}
            {tab === 'text' && <TextPanel {...panelProps} />}
            {tab === 'effects' && <EffectsPanel {...panelProps} />}
          </div>
        </aside>
      </div>
    </div>
  );
};

export default VideoStudio;
