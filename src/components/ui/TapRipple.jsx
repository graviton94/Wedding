import { useEffect, useState } from 'react';

let counter = 0;

// 탭/클릭 지점에서 은은한 골드 파문이 퍼진다.
const TapRipple = () => {
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const onDown = (e) => {
      const id = ++counter;
      setRipples((r) => [...r, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setRipples((r) => r.filter((p) => p.id !== id));
      }, 600);
    };

    window.addEventListener('pointerdown', onDown);
    return () => window.removeEventListener('pointerdown', onDown);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[45]" aria-hidden="true">
      {ripples.map((r) => (
        <span key={r.id} className="tap-ripple" style={{ left: r.x, top: r.y }} />
      ))}
    </div>
  );
};

export default TapRipple;
