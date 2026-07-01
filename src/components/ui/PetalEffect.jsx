import { useEffect, useRef } from 'react';

// 상시 낙하 + 인터랙션 흩날림 + 축하 버스트(window 'celebrate' 이벤트).
// 테마에 따라 색/블렌드가 바뀌고, prefers-reduced-motion을 존중한다.
const PetalEffect = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf, w, h;
    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // 테마 대응 색/블렌드
    let theme = document.documentElement.dataset.theme || 'dark';
    const applyBlend = () => {
      canvas.style.mixBlendMode = theme === 'light' ? 'normal' : 'screen';
    };
    applyBlend();
    const petalColor = () =>
      theme === 'light' ? 'rgba(185,86,78,1)' : 'rgba(255,111,97,1)';
    const themeObserver = new MutationObserver(() => {
      theme = document.documentElement.dataset.theme || 'dark';
      applyBlend();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });

    const petals = [];
    const MAX = 70;
    const makePetal = (o) => {
      petals.push({
        x: o.x,
        y: o.y,
        size: o.size ?? Math.random() * 7 + 4,
        vx: o.vx ?? (Math.random() - 0.5) * 1.2,
        vy: o.vy ?? Math.random() * 1.2 + 0.6,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 0.08,
        sway: Math.random() * Math.PI * 2,
        swaySpeed: Math.random() * 0.03 + 0.01,
        life: 1,
        fade: o.fade ?? 0.004,
        alpha: Math.random() * 0.4 + 0.5,
      });
      if (petals.length > MAX) petals.splice(0, petals.length - MAX);
    };

    // 인터랙션 흩날림
    const last = { x: 0, y: 0, t: 0 };
    const onMove = (e) => {
      if (reduced) return;
      const x = e.touches ? e.touches[0].clientX : e.clientX;
      const y = e.touches ? e.touches[0].clientY : e.clientY;
      const now = Date.now();
      const dt = now - last.t;
      const dist = Math.hypot(x - last.x, y - last.y);
      const v = dt > 0 ? Math.min(dist / dt, 3) : 1;
      const n = Math.min(Math.ceil(v * 1.5), 4);
      for (let i = 0; i < n; i++) makePetal({ x, y, vy: Math.random() * 2 + 1 });
      last.x = x;
      last.y = y;
      last.t = now;
    };

    // 축하 버스트
    const onCelebrate = (e) => {
      const cx = e.detail?.x ?? w / 2;
      const cy = e.detail?.y ?? h * 0.4;
      for (let i = 0; i < 28; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = Math.random() * 4 + 2;
        makePetal({
          x: cx,
          y: cy,
          vx: Math.cos(ang) * sp,
          vy: Math.sin(ang) * sp - 1,
          size: Math.random() * 8 + 5,
          fade: 0.008,
        });
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('celebrate', onCelebrate);

    let tick = 0;
    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // 상시 낙하(희소)
      if (!reduced && ++tick % 80 === 0) {
        makePetal({ x: Math.random() * w, y: -12, vy: Math.random() + 0.6, fade: 0.0025 });
      }

      const fill = petalColor();
      for (let i = petals.length - 1; i >= 0; i--) {
        const p = petals[i];
        p.sway += p.swaySpeed;
        p.x += p.vx + Math.sin(p.sway) * 0.6;
        p.y += p.vy;
        p.rot += p.vrot;
        p.life -= p.fade;
        if (p.life <= 0 || p.y > h + 20) {
          petals.splice(i, 1);
          continue;
        }
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, p.life)) * p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 1.6, 0, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('celebrate', onCelebrate);
      themeObserver.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default PetalEffect;
