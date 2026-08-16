import { CANVAS_PRESETS, INVITATION_PHOTOS, LAYOUTS, THEME_PRESETS } from '../engine/index.js';
import { publicUrl } from './useAssets.js';
import {
  Btn, ColorInput, NumberInput, SectionTitle, Select, Slider, TextInput, Toggle,
} from './controls.jsx';

const pct = (v) => `${Math.round(v * 100)}%`;
const sec = (v) => `${Number(v).toFixed(1)}s`;

/* ─────────────────────────────── 출력 ─────────────────────────────── */

export const OutputPanel = ({ project, set, audioDuration }) => (
  <>
    <SectionTitle>화면 규격</SectionTitle>
    <Select
      label="프리셋"
      value={
        Object.entries(CANVAS_PRESETS).find(
          ([, p]) => p.width === project.canvas.width && p.height === project.canvas.height,
        )?.[0] || 'custom'
      }
      onChange={(key) => {
        const p = CANVAS_PRESETS[key];
        if (p) set('canvas', { width: p.width, height: p.height, fps: p.fps });
      }}
      options={[
        ...Object.entries(CANVAS_PRESETS).map(([value, p]) => ({ value, label: p.label })),
        { value: 'custom', label: '직접 입력' },
      ]}
    />
    <div className="grid grid-cols-3 gap-2">
      <NumberInput label="가로" value={project.canvas.width} step={2}
        onChange={(v) => set('canvas', { width: v })} />
      <NumberInput label="세로" value={project.canvas.height} step={2}
        onChange={(v) => set('canvas', { height: v })} />
      <NumberInput label="fps" value={project.canvas.fps} min={12} max={60}
        onChange={(v) => set('canvas', { fps: v })} />
    </div>

    <SectionTitle>음원</SectionTitle>
    <TextInput
      label="파일 경로"
      hint="public/ 기준"
      value={project.audio.src}
      placeholder="music/1.mp3"
      onChange={(v) => set('audio', { src: v })}
    />
    <div className="flex flex-wrap gap-1.5 my-2">
      {['music/1.mp3', 'music/2.mp3', 'music/3.mp3', 'music/4.mp3'].map((m) => (
        <Btn key={m} onClick={() => set('audio', { src: m })}
          className={project.audio.src === m ? 'ring-1 ring-amber-300/60' : ''}>
          {m.replace('music/', '')}
        </Btn>
      ))}
    </div>
    <Slider label="시작 지점" value={project.audio.startAt} min={0}
      max={Math.max(30, (audioDuration || 60) - 5)} step={0.5} format={sec}
      onChange={(v) => set('audio', { startAt: v })} />
    <Slider label="음량" value={project.audio.volume} min={0} max={1.5} step={0.05} format={pct}
      onChange={(v) => set('audio', { volume: v })} />
    <Slider label="페이드 인" value={project.audio.fadeIn} min={0} max={10} step={0.5} format={sec}
      onChange={(v) => set('audio', { fadeIn: v })} />
    <Slider label="페이드 아웃" value={project.audio.fadeOut} min={0} max={15} step={0.5} format={sec}
      onChange={(v) => set('audio', { fadeOut: v })} />

    <SectionTitle>길이</SectionTitle>
    <NumberInput
      label="영상 길이 (초)"
      hint={audioDuration ? `비우면 음원 길이 ${audioDuration.toFixed(0)}초` : '비우면 음원 길이'}
      value={project.duration}
      min={5}
      onChange={(v) => set(null, { duration: v })}
    />
  </>
);

/* ─────────────────────────────── 사진 ─────────────────────────────── */

export const PhotosPanel = ({ project, set }) => {
  const items = project.photos.items;
  const setItems = (next) => set('photos', { items: next });

  const update = (i, patch) =>
    setItems(items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));

  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  };

  const remove = (i) => setItems(items.filter((_, idx) => idx !== i));

  const add = (file) => setItems([...items, { src: `images/${file}`, focusX: 0.5, focusY: 0.42, duration: null }]);

  const unused = INVITATION_PHOTOS.filter((f) => !items.some((it) => it.src === `images/${f}`));

  return (
    <>
      <SectionTitle>슬라이드쇼</SectionTitle>
      <Slider label="사진당 노출 시간" value={project.photos.duration} min={2} max={20} step={0.5}
        format={sec} onChange={(v) => set('photos', { duration: v })} />
      <Slider label="크로스페이드" value={project.photos.crossfade} min={0} max={5} step={0.1}
        format={sec} onChange={(v) => set('photos', { crossfade: v })} />
      <Select label="순서" value={project.photos.order}
        onChange={(v) => set('photos', { order: v })}
        options={[{ value: 'sequence', label: '지정한 순서' }, { value: 'shuffle', label: '무작위 (시드 고정)' }]} />
      <Toggle label="사진 반복" hint="음악이 길면 처음부터 다시" value={project.photos.loop}
        onChange={(v) => set('photos', { loop: v })} />

      <SectionTitle>목록 ({items.length}장)</SectionTitle>
      <div className="space-y-1.5">
        {items.map((it, i) => (
          <div key={`${it.src}-${i}`} className="flex gap-2 items-center bg-white/5 rounded p-1.5">
            <span className="text-[10px] tabular-nums text-white/30 w-5 text-right shrink-0">{i + 1}</span>
            <img src={publicUrl(it.src)} alt="" className="w-9 h-9 object-cover rounded shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-white/60 truncate">{it.src.replace('images/', '')}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] text-white/30 shrink-0">세로 크롭</span>
                <input
                  type="range" min={0} max={1} step={0.02} value={it.focusY ?? 0.5}
                  onChange={(e) => update(i, { focusY: Number(e.target.value) })}
                  className="flex-1 accent-amber-300 h-0.5 cursor-pointer"
                />
                <input
                  type="number" placeholder="초" value={it.duration ?? ''}
                  onChange={(e) => update(i, { duration: e.target.value === '' ? null : Number(e.target.value) })}
                  className="w-11 bg-white/8 border border-white/10 rounded px-1 py-0.5 text-[10px] text-white/80"
                />
              </div>
            </div>
            <div className="flex flex-col shrink-0">
              <button onClick={() => move(i, -1)} className="text-white/35 hover:text-white text-[9px] leading-none py-0.5">▲</button>
              <button onClick={() => move(i, 1)} className="text-white/35 hover:text-white text-[9px] leading-none py-0.5">▼</button>
            </div>
            <button onClick={() => remove(i)} className="text-red-300/50 hover:text-red-300 text-xs shrink-0 px-1">×</button>
          </div>
        ))}
      </div>

      {unused.length > 0 && (
        <>
          <SectionTitle>추가하기</SectionTitle>
          <div className="grid grid-cols-6 gap-1">
            {unused.map((f) => (
              <button key={f} onClick={() => add(f)} title={f}
                className="aspect-square rounded overflow-hidden ring-1 ring-white/10 hover:ring-amber-300/60">
                <img src={publicUrl(`images/${f}`)} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </>
      )}
    </>
  );
};

/* ─────────────────────────────── LP판 ─────────────────────────────── */

export const VinylPanel = ({ project, set }) => (
  <>
    <Toggle label="중앙 원형 LP" value={project.vinyl.enabled} onChange={(v) => set('vinyl', { enabled: v })} />

    <SectionTitle>원에 들어갈 사진 (고정)</SectionTitle>
    <div className="grid grid-cols-6 gap-1">
      {INVITATION_PHOTOS.map((f) => {
        const src = `images/${f}`;
        const active = project.vinyl.photo === src;
        return (
          <button key={f} onClick={() => set('vinyl', { photo: src })} title={f}
            className={`aspect-square rounded-full overflow-hidden ring-2 transition-all ${
              active ? 'ring-amber-300' : 'ring-white/10 hover:ring-white/40'
            }`}>
            <img src={publicUrl(src)} alt="" className="w-full h-full object-cover" />
          </button>
        );
      })}
    </div>

    <SectionTitle>회전</SectionTitle>
    <Slider label="회전 속도" hint="시계 방향" value={project.vinyl.rpm} min={0} max={20} step={0.5}
      format={(v) => (v ? `${v} rpm · 한 바퀴 ${(60 / v).toFixed(0)}초` : '정지')}
      onChange={(v) => set('vinyl', { rpm: v })} />

    <SectionTitle>크기 / 위치</SectionTitle>
    <Slider label="지름" value={project.vinyl.sizeRatio} min={0.25} max={1} step={0.01}
      format={pct} onChange={(v) => set('vinyl', { sizeRatio: v })} />
    <Slider label="가로 위치" value={project.vinyl.centerX} min={0.2} max={0.8} step={0.01}
      format={pct} onChange={(v) => set('vinyl', { centerX: v })} />
    <Slider label="세로 위치" value={project.vinyl.centerY} min={0.2} max={0.8} step={0.01}
      format={pct} onChange={(v) => set('vinyl', { centerY: v })} />

    <SectionTitle>디테일</SectionTitle>
    <Toggle label="톤암" hint="은색 튜브 + 금색 포인트"
      value={project.vinyl.tonearm} onChange={(v) => set('vinyl', { tonearm: v })} />
    <Toggle label="회전 광택" value={project.vinyl.sheen} onChange={(v) => set('vinyl', { sheen: v })} />
    <Toggle label="LP 홈 질감" hint="사진 위에 옅은 동심원"
      value={project.vinyl.grooves} onChange={(v) => set('vinyl', { grooves: v })} />
    <Toggle label="가운데 축 구멍" value={project.vinyl.spindle} onChange={(v) => set('vinyl', { spindle: v })} />
    <ColorInput label="테두리 링 색" value={project.vinyl.ringColor} onChange={(v) => set('vinyl', { ringColor: v })} />
    <Slider label="전환 시 튕김" value={project.vinyl.beatPulse} min={0} max={0.05} step={0.002}
      format={(v) => v.toFixed(3)} onChange={(v) => set('vinyl', { beatPulse: v })} />
    <Select label="등장 방식" value={project.vinyl.entrance} onChange={(v) => set('vinyl', { entrance: v })}
      options={[
        { value: 'drop', label: '위에서 내려옴' },
        { value: 'fade', label: '페이드 인' },
        { value: 'none', label: '없음' },
      ]} />
  </>
);

/* ────────────────────────── 배경 / 3분할 ────────────────────────── */

export const BackgroundPanel = ({ project, set }) => (
  <>
    <Toggle label="배경 사진" value={project.background.enabled} onChange={(v) => set('background', { enabled: v })} />
    <SectionTitle>흐림 / 밝기</SectionTitle>
    <Slider label="블러" value={project.background.blur} min={0} max={120} step={2}
      format={(v) => `${v}px`} onChange={(v) => set('background', { blur: v })} />
    <Slider label="밝기" value={project.background.brightness} min={0.1} max={1.2} step={0.02}
      format={pct} onChange={(v) => set('background', { brightness: v })} />
    <Slider label="채도" value={project.background.saturation} min={0} max={2} step={0.02}
      format={pct} onChange={(v) => set('background', { saturation: v })} />
    <Slider label="확대" value={project.background.scale} min={1} max={1.6} step={0.01}
      format={pct} onChange={(v) => set('background', { scale: v })} />
    <Slider label="켄번즈 (서서히 확대)" value={project.background.kenBurns} min={0} max={0.3} step={0.005}
      format={(v) => v.toFixed(3)} onChange={(v) => set('background', { kenBurns: v })} />
    <SectionTitle>색감</SectionTitle>
    <ColorInput label="틴트" value={project.background.tint} onChange={(v) => set('background', { tint: v })} />
    <Slider label="틴트 강도" value={project.background.tintOpacity} min={0} max={0.8} step={0.02}
      format={pct} onChange={(v) => set('background', { tintOpacity: v })} />
    <Slider label="비네트" value={project.background.vignette} min={0} max={1} step={0.02}
      format={pct} onChange={(v) => set('background', { vignette: v })} />
  </>
);

export const SplitPanel = ({ project, set }) => (
  <>
    <Toggle label="3분할 화면" hint="[사진 | 중앙 LP | 사진]"
      value={project.split.enabled} onChange={(v) => set('split', { enabled: v })} />

    <SectionTitle>컬럼</SectionTitle>
    <Slider label="중앙 컬럼 폭" value={project.split.centerRatio} min={0.2} max={0.75} step={0.01}
      format={pct} onChange={(v) => set('split', { centerRatio: v })} />
    <Slider label="컬럼 간격" value={project.split.gap} min={0} max={40} step={1}
      format={(v) => `${v}px`} onChange={(v) => set('split', { gap: v })} />
    <Slider label="경계선" value={project.split.divider} min={0} max={1} step={0.02}
      format={pct} onChange={(v) => set('split', { divider: v })} />

    <SectionTitle>좌우 사진</SectionTitle>
    <Slider label="밝기" value={project.split.brightness} min={0.3} max={1.2} step={0.02}
      format={pct} onChange={(v) => set('split', { brightness: v })} />
    <Slider label="안쪽 가장자리 그림자" value={project.split.edgeFade} min={0} max={0.8} step={0.02}
      format={pct} onChange={(v) => set('split', { edgeFade: v })} />
    <Slider label="켄번즈 (서서히 확대)" value={project.split.kenBurns} min={0} max={0.25} step={0.005}
      format={(v) => v.toFixed(3)} onChange={(v) => set('split', { kenBurns: v })} />
    <Slider label="좌우 전환 시간차" value={project.split.stagger} min={0} max={4} step={0.1}
      format={sec} onChange={(v) => set('split', { stagger: v })} />
    <p className="text-[10px] text-white/35 leading-relaxed mt-2">
      좌우 컬럼은 사진 목록을 짝/홀로 나눠 갖습니다. 한 번에 한쪽만 바뀌어 화면이 차분해집니다.
    </p>
  </>
);

/* ─────────────────────────── 효과 / 텍스트 ─────────────────────────── */

export const EffectsPanel = ({ project, set }) => (
  <>
    <SectionTitle>분위기</SectionTitle>
    <Slider label="보케 (빛망울)" value={project.effects.bokeh} min={0} max={1.5} step={0.02}
      format={pct} onChange={(v) => set('effects', { bokeh: v })} />
    <Slider label="보케 개수" value={project.effects.bokehCount} min={0} max={80} step={1}
      format={(v) => `${v}개`} onChange={(v) => set('effects', { bokehCount: v })} />
    <Slider label="광선 누출" value={project.effects.lightLeak} min={0} max={1} step={0.02}
      format={pct} onChange={(v) => set('effects', { lightLeak: v })} />
    <Slider label="필름 그레인" value={project.effects.grain} min={0} max={0.3} step={0.005}
      format={(v) => v.toFixed(3)} onChange={(v) => set('effects', { grain: v })} />
    <SectionTitle>프레이밍</SectionTitle>
    <Toggle label="진행 바" value={project.effects.progressBar} onChange={(v) => set('effects', { progressBar: v })} />
    <Slider label="시네마 레터박스" value={project.effects.letterbox} min={0} max={0.2} step={0.005}
      format={pct} onChange={(v) => set('effects', { letterbox: v })} />
    <TextInput label="워터마크" value={project.effects.watermark} placeholder="비워두면 없음"
      onChange={(v) => set('effects', { watermark: v })} />
    <SectionTitle>테마</SectionTitle>
    <ColorInput label="포인트 색" value={project.theme.accent} onChange={(v) => set('theme', { accent: v })} />
    <ColorInput label="글자 색" value={project.theme.ink} onChange={(v) => set('theme', { ink: v })} />
    <ColorInput label="바탕 색" value={project.theme.bg} onChange={(v) => set('theme', { bg: v })} />
  </>
);

export const TextPanel = ({ project, set }) => (
  <>
    <SectionTitle>인트로</SectionTitle>
    <Toggle label="사용" value={project.intro.enabled} onChange={(v) => set('intro', { enabled: v })} />
    <TextInput label="윗줄 (영문 권장)" value={project.intro.caption}
      onChange={(v) => set('intro', { caption: v })} />
    <TextInput label="제목" value={project.intro.title} onChange={(v) => set('intro', { title: v })} />
    <TextInput label="아랫줄" value={project.intro.subtitle} onChange={(v) => set('intro', { subtitle: v })} />
    <Slider label="길이" value={project.intro.duration} min={2} max={15} step={0.5} format={sec}
      onChange={(v) => set('intro', { duration: v })} />

    <SectionTitle>아웃트로</SectionTitle>
    <Toggle label="사용" value={project.outro.enabled} onChange={(v) => set('outro', { enabled: v })} />
    <TextInput label="윗줄" value={project.outro.caption} onChange={(v) => set('outro', { caption: v })} />
    <TextInput label="제목" value={project.outro.title} onChange={(v) => set('outro', { title: v })} />
    <TextInput label="아랫줄" value={project.outro.subtitle} onChange={(v) => set('outro', { subtitle: v })} />
    <Slider label="길이" value={project.outro.duration} min={2} max={20} step={0.5} format={sec}
      onChange={(v) => set('outro', { duration: v })} />
  </>
);

export const LyricsStylePanel = ({ project, set }) => (
  <>
    <SectionTitle>글자</SectionTitle>
    <Slider label="크기" value={project.lyrics.fontSize} min={0.02} max={0.09} step={0.002}
      format={(v) => `${(v * 100).toFixed(1)}%`} onChange={(v) => set('lyrics', { fontSize: v })} />
    <Slider label="줄 간격" value={project.lyrics.lineHeight} min={1} max={2} step={0.05}
      format={(v) => v.toFixed(2)} onChange={(v) => set('lyrics', { lineHeight: v })} />
    <Slider label="최대 폭" value={project.lyrics.maxWidthRatio} min={0.4} max={0.95} step={0.01}
      format={pct} onChange={(v) => set('lyrics', { maxWidthRatio: v })} />
    <Slider label="아래 여백" value={project.lyrics.bottomRatio} min={0.05} max={0.4} step={0.005}
      format={pct} onChange={(v) => set('lyrics', { bottomRatio: v })} />
    <Select label="정렬" value={project.lyrics.align} onChange={(v) => set('lyrics', { align: v })}
      options={[
        { value: 'center', label: '가운데' },
        { value: 'left', label: '왼쪽' },
        { value: 'right', label: '오른쪽' },
      ]} />
    <SectionTitle>색 / 효과</SectionTitle>
    <ColorInput label="글자 색" value={project.lyrics.color} onChange={(v) => set('lyrics', { color: v })} />
    <Select label="등장 애니메이션" value={project.lyrics.animation}
      onChange={(v) => set('lyrics', { animation: v })}
      options={[
        { value: 'rise', label: '아래에서 올라오기' },
        { value: 'fade', label: '페이드' },
        { value: 'none', label: '없음' },
      ]} />
    <Slider label="그림자" value={project.lyrics.glow} min={0} max={1} step={0.05}
      format={pct} onChange={(v) => set('lyrics', { glow: v })} />
    <Slider label="자막 판" value={project.lyrics.plate} min={0} max={0.8} step={0.02}
      format={pct} onChange={(v) => set('lyrics', { plate: v })} />
    <Toggle label="다음 줄 미리보기" value={project.lyrics.showNext}
      onChange={(v) => set('lyrics', { showNext: v })} />
    <Slider label="미리보기 투명도" value={project.lyrics.dimOpacity} min={0} max={1} step={0.02}
      format={pct} onChange={(v) => set('lyrics', { dimOpacity: v })} />
    <SectionTitle>가라오케</SectionTitle>
    <Toggle label="단어별 하이라이트" hint="LRC에 &lt;시간&gt; 태그가 있을 때만"
      value={project.lyrics.karaoke} onChange={(v) => set('lyrics', { karaoke: v })} />
    <ColorInput label="하이라이트 색" value={project.lyrics.karaokeColor}
      onChange={(v) => set('lyrics', { karaokeColor: v })} />
  </>
);

/* ─────────────────────────────── 무드 시안 ─────────────────────────────── */

export const MoodPanel = ({ project, applyPreset }) => (
  <>
    <SectionTitle>컨셉 프리셋</SectionTitle>
    <p className="text-[10px] text-white/35 leading-relaxed mb-2">
      화면 구조·색·서체·효과를 한 번에 바꿉니다. 사진·음원·가사는 그대로 유지됩니다.
    </p>
    <div className="space-y-1.5">
      {Object.entries(THEME_PRESETS).map(([key, preset]) => {
        const active = project.themePreset === key;
        return (
          <button
            key={key}
            onClick={() => applyPreset(key)}
            className={`w-full text-left rounded-lg border p-2.5 transition-colors ${
              active
                ? 'border-amber-300/60 bg-amber-400/10'
                : 'border-white/10 bg-white/[0.03] hover:bg-white/[0.07]'
            }`}
          >
            <div className="flex items-center gap-2">
              {/* 테마 팔레트 미리보기 */}
              <span className="flex shrink-0 rounded overflow-hidden ring-1 ring-white/15">
                {[preset.patch.theme.bg, preset.patch.theme.accent, preset.patch.theme.ink].map((c) => (
                  <span key={c} className="w-3.5 h-6 block" style={{ background: c }} />
                ))}
              </span>
              <span className="min-w-0">
                <span className={`block text-xs ${active ? 'text-amber-100' : 'text-white/85'}`}>
                  {preset.label}
                </span>
                <span className="block text-[10px] text-white/40 leading-snug">
                  {preset.description}
                </span>
                <span className="block text-[9px] text-white/25 mt-0.5">
                  구조: {LAYOUTS[preset.patch.layout]?.label || preset.patch.layout}
                </span>
              </span>
            </div>
          </button>
        );
      })}
    </div>

    <SectionTitle>시안 이미지 뽑기</SectionTitle>
    <p className="text-[10px] text-white/35 leading-relaxed">
      네 가지 시안을 정지 이미지로 한 번에 비교하려면:
    </p>
    <code className="block mt-1.5 text-[10px] bg-black/50 rounded px-2 py-1.5 text-amber-100/80 overflow-x-auto whitespace-nowrap">
      npm run video:themes
    </code>
  </>
);

/* ──────────────────────────── 2개 국어 자막 ──────────────────────────── */

export const BilingualPanel = ({ project, set }) => (
  <>
    <Toggle
      label="2개 국어 자막"
      hint="같은 시각의 두 줄을 원문+번역으로 묶음"
      value={project.lyrics.bilingual}
      onChange={(v) => set('lyrics', { bilingual: v })}
    />
    <p className="text-[10px] text-white/35 leading-relaxed mt-1 mb-2">
      .lrc에 같은 타임스탬프로 두 줄을 넣으면 위=원문, 아래=번역으로 표시됩니다.
    </p>
    <pre className="text-[10px] bg-black/40 rounded px-2 py-1.5 text-white/50 overflow-x-auto">{`[00:24.10]English line here
[00:24.10]여기에 한국어 번역`}</pre>

    <Toggle label="번역을 위로" hint="국문을 크게 보여줍니다"
      value={project.lyrics.translationFirst}
      onChange={(v) => set('lyrics', { translationFirst: v })} />
    <Slider label="번역 글자 크기" value={project.lyrics.translationScale} min={0.4} max={1} step={0.02}
      format={pct} onChange={(v) => set('lyrics', { translationScale: v })} />
    <Slider label="번역 투명도" value={project.lyrics.translationOpacity} min={0.2} max={1} step={0.02}
      format={pct} onChange={(v) => set('lyrics', { translationOpacity: v })} />
    <Slider label="두 줄 사이 간격" value={project.lyrics.translationGap} min={0.9} max={2.6} step={0.05}
      format={(v) => v.toFixed(2)} onChange={(v) => set('lyrics', { translationGap: v })} />
    <Select label="원문 서체" value={project.lyrics.face}
      onChange={(v) => set('lyrics', { face: v })}
      options={[
        { value: 'body', label: '본문 (국문 명조)' },
        { value: 'accent', label: '강조 (영문 이탤릭/디스플레이)' },
        { value: 'display', label: '디스플레이' },
      ]} />
    <Slider label="원문 자간" value={project.lyrics.tracking} min={0} max={0.12} step={0.005}
      format={(v) => v.toFixed(3)} onChange={(v) => set('lyrics', { tracking: v })} />
  </>
);
