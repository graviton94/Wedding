import { useMemo, useRef, useState } from 'react';
import { parseLRC, serializeLRC, toLrcTime } from '../engine/index.js';
import { publicUrl } from './useAssets.js';
import { Btn, SectionTitle, Slider, TextInput } from './controls.jsx';

/**
 * 가사 자막 편집 패널.
 *
 * 핵심 워크플로는 "탭 타이밍": 음악을 재생하면서 각 줄이 나올 때 [지금] 을 누르면
 * 현재 재생 시각이 그 줄의 타임스탬프로 찍힌다. LRC를 손으로 쓰는 것보다 훨씬 빠르다.
 *
 * 가사 텍스트는 저장소에 넣지 않는다 — 사용자가 직접 입력하거나 .lrc를 불러온다.
 */
const LyricsPanel = ({ project, set, time, seek, playing, togglePlay }) => {
  const L = project.lyrics;
  const [mode, setMode] = useState('tap'); // 'tap' | 'raw'
  const [draft, setDraft] = useState('');
  const fileRef = useRef(null);

  const lines = useMemo(() => parseLRC(L.lrcText || '').lines, [L.lrcText]);

  const commit = (nextLines) => set('lyrics', { lrcText: serializeLRC(nextLines) });

  /** 시간 없는 생가사를 붙여넣어 줄 목록으로 만든다 (전부 0초로 시작) */
  const seedFromDraft = () => {
    const texts = draft.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
    if (!texts.length) return;
    // 아직 타이밍이 없으므로 2초 간격으로 임시 배치 → [지금]으로 하나씩 잡는다
    commit(texts.map((text, i) => ({ time: i * 2, text })));
    setDraft('');
    setMode('tap');
  };

  const stampNow = (i) => {
    const next = lines.slice();
    next[i] = { ...next[i], time: Math.max(0, time) };
    commit(next);
  };

  const nudge = (i, delta) => {
    const next = lines.slice();
    next[i] = { ...next[i], time: Math.max(0, next[i].time + delta) };
    commit(next);
  };

  const editText = (i, text) => {
    const next = lines.slice();
    next[i] = { ...next[i], text };
    commit(next);
  };

  const removeLine = (i) => commit(lines.filter((_, idx) => idx !== i));

  const addLine = () => commit([...lines, { time: Math.max(0, time), text: '' }]);

  const addInterlude = () => commit([...lines, { time: Math.max(0, time), text: '' }]);

  const loadFile = async (file) => {
    if (!file) return;
    set('lyrics', { lrcText: await file.text(), lrcSrc: file.name });
  };

  const loadFromPublic = async () => {
    const path = L.lrcSrc || 'video/lyrics/sample.lrc';
    try {
      const res = await fetch(publicUrl(path));
      if (!res.ok) throw new Error(String(res.status));
      set('lyrics', { lrcText: await res.text() });
    } catch (err) {
      alert(`불러오지 못했습니다: ${path}\n(${err.message})`);
    }
  };

  const downloadLrc = () => {
    const blob = new Blob([serializeLRC(lines)], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${project.name || 'lyrics'}.lrc`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // 지금 재생 중인 줄 — 목록에서 강조
  const activeIdx = lines.reduce((acc, l, i) => (l.time <= time ? i : acc), -1);

  return (
    <>
      <SectionTitle>가사 불러오기</SectionTitle>
      <div className="flex flex-wrap gap-1.5">
        <Btn onClick={() => fileRef.current?.click()}>.lrc 파일</Btn>
        <Btn onClick={loadFromPublic}>public에서</Btn>
        <Btn onClick={downloadLrc} variant="primary">.lrc 내보내기</Btn>
        <input ref={fileRef} type="file" accept=".lrc,.txt" className="hidden"
          onChange={(e) => loadFile(e.target.files?.[0])} />
      </div>
      <TextInput label="렌더러가 읽을 경로" hint="public/ 기준" value={L.lrcSrc}
        onChange={(v) => set('lyrics', { lrcSrc: v })} />
      <p className="text-[10px] text-white/35 leading-relaxed mt-1">
        내보낸 .lrc를 <code className="text-amber-200/70">public/video/lyrics/</code> 에 넣고
        위 경로를 맞춰두면 CLI 렌더러가 같은 자막을 씁니다.
      </p>

      <SectionTitle>가사 붙여넣기</SectionTitle>
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={4}
        placeholder={'가사를 한 줄씩 붙여넣고 아래 버튼을 누르세요.\n타이밍은 그 다음에 [지금]으로 잡습니다.'}
        className="w-full bg-white/8 border border-white/12 rounded px-2 py-1.5 text-xs text-white/90
                   placeholder:text-white/25 focus:outline-none focus:border-amber-300/50 resize-y"
      />
      <Btn onClick={seedFromDraft} className="mt-1.5 w-full" variant={draft ? 'primary' : 'ghost'}>
        {lines.length ? '기존 목록 교체' : '줄 목록 만들기'}
      </Btn>

      <SectionTitle>타이밍 잡기 ({lines.length}줄)</SectionTitle>
      <div className="flex gap-1.5 mb-2">
        <Btn onClick={togglePlay} variant="primary" className="flex-1">
          {playing ? '⏸ 일시정지' : '▶ 재생'}
        </Btn>
        <Btn onClick={() => seek(Math.max(0, time - 5))}>-5초</Btn>
        <Btn onClick={addLine}>+ 줄</Btn>
      </div>
      <p className="text-[10px] text-white/35 mb-2 leading-relaxed">
        재생하면서 그 줄이 시작되는 순간 <b className="text-amber-200/70">[지금]</b> 을 누르세요.
        텍스트가 빈 줄은 간주로 표시됩니다.
      </p>

      <div className="space-y-1 max-h-[42vh] overflow-y-auto pr-1">
        {lines.map((l, i) => (
          <div
            key={i}
            className={`flex items-center gap-1 rounded px-1.5 py-1 transition-colors ${
              i === activeIdx ? 'bg-amber-400/15 ring-1 ring-amber-300/30' : 'bg-white/5'
            }`}
          >
            <button
              onClick={() => seek(l.time)}
              title="이 지점으로 이동"
              className="text-[10px] tabular-nums text-amber-200/70 hover:text-amber-200 w-[52px] shrink-0 text-left"
            >
              {toLrcTime(l.time)}
            </button>
            <input
              value={l.text}
              onChange={(e) => editText(i, e.target.value)}
              placeholder="(간주)"
              className="flex-1 min-w-0 bg-transparent text-xs text-white/85 placeholder:text-white/25
                         focus:outline-none focus:bg-white/8 rounded px-1 py-0.5"
            />
            <button onClick={() => nudge(i, -0.1)} title="0.1초 당기기"
              className="text-white/30 hover:text-white text-[10px] px-0.5 shrink-0">◀</button>
            <button onClick={() => nudge(i, 0.1)} title="0.1초 밀기"
              className="text-white/30 hover:text-white text-[10px] px-0.5 shrink-0">▶</button>
            <button onClick={() => stampNow(i)}
              className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-100
                         hover:bg-amber-400/40 shrink-0">
              지금
            </button>
            <button onClick={() => removeLine(i)}
              className="text-red-300/40 hover:text-red-300 text-xs px-0.5 shrink-0">×</button>
          </div>
        ))}
        {!lines.length && (
          <p className="text-[11px] text-white/30 py-4 text-center">
            아직 가사가 없습니다. 위에 붙여넣거나 .lrc를 불러오세요.
          </p>
        )}
      </div>

      <div className="flex gap-1.5 mt-2">
        <Btn onClick={addInterlude} className="flex-1">+ 간주 (빈 줄)</Btn>
        <Btn onClick={() => setMode(mode === 'raw' ? 'tap' : 'raw')} className="flex-1">
          {mode === 'raw' ? '목록으로' : 'LRC 원문 보기'}
        </Btn>
      </div>

      {mode === 'raw' && (
        <textarea
          value={L.lrcText}
          onChange={(e) => set('lyrics', { lrcText: e.target.value })}
          rows={10}
          spellCheck={false}
          className="w-full mt-2 bg-black/40 border border-white/12 rounded px-2 py-1.5
                     text-[11px] font-mono text-white/80 focus:outline-none focus:border-amber-300/50 resize-y"
        />
      )}

      <SectionTitle>미세 조정</SectionTitle>
      <Slider label="전체 오프셋" hint="+면 자막이 늦게" value={L.offset} min={-3} max={3} step={0.05}
        format={(v) => `${v > 0 ? '+' : ''}${v.toFixed(2)}s`}
        onChange={(v) => set('lyrics', { offset: v })} />
    </>
  );
};

export default LyricsPanel;
