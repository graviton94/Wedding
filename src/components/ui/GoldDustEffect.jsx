import React, { useEffect, useRef } from 'react';

const GoldDustEffect = () => {
    const canvasRef = useRef(null);
    const particlesRef = useRef([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Canvas 크기 설정
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // 금가루 파티클 클래스
        class GoldParticle {
            constructor() {
                this.reset();
            }

            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 3 + 0.5; // 0.5-2.5px
                this.speedX = (Math.random() - 0.3) * 0.3;
                this.speedY = (Math.random() - 0.3) * 0.3;
                this.opacity = Math.random() * 0.5 + 0.3; // 0.3-0.8
                this.twinkleSpeed = Math.random() * 0.02 + 0.01;
                this.twinklePhase = Math.random() * Math.PI * 2;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY;
                this.twinklePhase += this.twinkleSpeed;

                // 화면 밖으로 나가면 재활용
                if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
                    this.reset();
                }
            }

            draw(ctx) {
                const twinkle = Math.sin(this.twinklePhase) * 0.3 + 0.7; // 0.4-1.0
                const currentOpacity = this.opacity * twinkle;

                ctx.save();
                ctx.globalAlpha = currentOpacity;

                // 금빛 그라데이션
                const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
                gradient.addColorStop(0, 'rgba(255, 215, 0, 1)'); // 진한 금색
                gradient.addColorStop(0.5, 'rgba(255, 223, 100, 0.8)'); // 밝은 금색
                gradient.addColorStop(1, 'rgba(255, 215, 0, 0)'); // 투명

                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();

                ctx.restore();
            }
        }

        // 파티클 생성 (모바일은 적게, 데스크톱은 많게)
        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 30 : 60;

        for (let i = 0; i < particleCount; i++) {
            particlesRef.current.push(new GoldParticle());
        }

        // 애니메이션 루프
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            particlesRef.current.forEach((particle) => {
                particle.update();
                particle.draw(ctx);
            });

            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-[5]"
            style={{ mixBlendMode: 'screen' }}
        />
    );
};

export default GoldDustEffect;
