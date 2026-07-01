import { useEffect, useRef } from 'react';

// 사이트의 단일 파티클: 은은한 금가루(앰비언트) + 축하 순간의 골드 버스트('celebrate').
const GoldDustEffect = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        // 모션 최소화 설정이면 생략
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        let animationFrameId;
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // 테마 대응 블렌드 (라이트에선 screen이 안 보여 normal로)
        let theme = document.documentElement.dataset.theme || 'dark';
        const applyBlend = () => {
            canvas.style.mixBlendMode = theme === 'light' ? 'normal' : 'screen';
        };
        applyBlend();
        const themeObserver = new MutationObserver(() => {
            theme = document.documentElement.dataset.theme || 'dark';
            applyBlend();
        });
        themeObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme'],
        });

        const drawGold = (x, y, r, alpha) => {
            const g = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, `rgba(255,215,0,${alpha})`);
            g.addColorStop(0.5, `rgba(255,223,120,${alpha * 0.8})`);
            g.addColorStop(1, 'rgba(255,215,0,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        };

        // 앰비언트 금가루 (작고 적게)
        class GoldParticle {
            constructor() { this.reset(true); }
            reset(init) {
                this.x = Math.random() * canvas.width;
                this.y = init ? Math.random() * canvas.height : Math.random() * canvas.height;
                this.size = Math.random() * 1.3 + 0.4; // 0.4 - 1.7px (기존보다 작게)
                this.speedX = (Math.random() - 0.5) * 0.25;
                this.speedY = (Math.random() - 0.4) * 0.25;
                this.opacity = Math.random() * 0.4 + 0.25; // 0.25 - 0.65
                this.twSpeed = Math.random() * 0.02 + 0.01;
                this.tw = Math.random() * Math.PI * 2;
            }
            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.tw += this.twSpeed;
                if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset(false);
            }
            draw() {
                const twinkle = Math.sin(this.tw) * 0.3 + 0.7;
                drawGold(this.x, this.y, this.size, this.opacity * twinkle);
            }
        }

        const isMobile = window.innerWidth < 768;
        const particles = [];
        const count = isMobile ? 20 : 38; // 기존 30/60 -> 감소
        for (let i = 0; i < count; i++) particles.push(new GoldParticle());

        // 축하 골드 버스트 (일시적, 소멸)
        const bursts = [];
        const onCelebrate = (e) => {
            const cx = e.detail?.x ?? canvas.width / 2;
            const cy = e.detail?.y ?? canvas.height * 0.4;
            for (let i = 0; i < 30; i++) {
                const a = Math.random() * Math.PI * 2;
                const sp = Math.random() * 4 + 1.5;
                bursts.push({
                    x: cx, y: cy,
                    vx: Math.cos(a) * sp,
                    vy: Math.sin(a) * sp - 1,
                    size: Math.random() * 2.5 + 1.5,
                    life: 1,
                });
            }
        };
        window.addEventListener('celebrate', onCelebrate);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particles.forEach((p) => { p.update(); p.draw(); });

            for (let i = bursts.length - 1; i >= 0; i--) {
                const b = bursts[i];
                b.x += b.vx;
                b.y += b.vy;
                b.vy += 0.06; // 살짝 중력
                b.vx *= 0.99;
                b.life -= 0.012;
                if (b.life <= 0) { bursts.splice(i, 1); continue; }
                drawGold(b.x, b.y, b.size, b.life);
            }

            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('celebrate', onCelebrate);
            themeObserver.disconnect();
            cancelAnimationFrame(animationFrameId);
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

export default GoldDustEffect;
