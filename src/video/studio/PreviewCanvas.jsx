import { useEffect, useRef } from 'react';
import { drawFrame } from '../engine/index.js';

/**
 * 캔버스 미리보기.
 *
 * 재생 중에는 <audio>의 currentTime을 그대로 시간축으로 쓴다.
 * 자체 타이머로 시간을 굴리면 프레임이 무거운 순간 오디오와 어긋나므로,
 * 오디오를 진실의 원천으로 두고 캔버스가 따라가게 한다.
 *
 * 미리보기는 축소 해상도로 그린다. 엔진의 모든 좌표가 W/H 비율 기반이라
 * 해상도를 낮춰도 구도는 최종 mp4와 동일하다.
 */
const PreviewCanvas = ({
  scene,
  getImage,
  playing,
  time,
  onTimeChange,
  audioRef,
  audioStartAt = 0,
  maxWidth = 1120,
}) => {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  // 콜백/상태를 ref로 미러링 — rAF 루프를 매 렌더마다 재시작하지 않기 위함.
  // 렌더 중에 ref를 쓰면 안 되므로 렌더 직후 effect에서 갱신한다.
  const stateRef = useRef({ scene, getImage, playing, time, onTimeChange, audioStartAt });
  useEffect(() => {
    stateRef.current = { scene, getImage, playing, time, onTimeChange, audioStartAt };
  });

  const { width: cw, height: ch } = scene.project.canvas;
  const scale = Math.min(1, maxWidth / cw);
  const W = Math.round(cw * scale);
  const H = Math.round(ch * scale);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });

    const env = {
      width: W,
      height: H,
      createCanvas: (w, h) => {
        const c = document.createElement('canvas');
        c.width = w;
        c.height = h;
        return c;
      },
      getImage: (src) => stateRef.current.getImage(src),
    };

    const loop = () => {
      const s = stateRef.current;
      let t = s.time;

      if (s.playing && audioRef?.current) {
        // 오디오 시계 → 영상 시간축 (음원 시작 지점 오프셋 보정)
        t = audioRef.current.currentTime - s.audioStartAt;
        if (t >= s.scene.total) {
          audioRef.current.pause();
          t = s.scene.total;
        }
        s.onTimeChange?.(t);
      }

      drawFrame(ctx, s.scene, env, t);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [W, H, audioRef]);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="w-full h-auto block rounded-lg shadow-2xl bg-black"
    />
  );
};

export default PreviewCanvas;
