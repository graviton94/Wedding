import React, { useEffect, useRef, useState } from 'react';

const PetalEffect = () => {
    const canvasRef = useRef(null);
    const petalsRef = useRef([]);
    const lastTouchRef = useRef({ x: 0, y: 0, time: 0 });
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        let animationFrameId;

        // Canvas 크기 설정
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // 꽃잎 클래스
        class Petal {
            constructor(x, y, velocity = 1) {
                this.x = x;
                this.y = y;
                this.size = Math.random() * 8 + 4; // 4-12px
                this.speedX = (Math.random() - 0.5) * 2;
                this.speedY = Math.random() * 2 + 1;
                this.rotation = Math.random() * 360;
                this.rotationSpeed = (Math.random() - 0.5) * 5;
                this.opacity = 1;
                this.color = `rgba(255, 111, 97, ${Math.random() * 0.5 + 0.5})`; // theme-primary with varying opacity
                this.life = 100;
                this.velocity = velocity;
            }

            update() {
                this.x += this.speedX;
                this.y += this.speedY * this.velocity;
                this.rotation += this.rotationSpeed;
                this.life--;
                this.opacity = this.life / 100;
            }

            draw(ctx) {
                ctx.save();
                ctx.globalAlpha = this.opacity;
                ctx.translate(this.x, this.y);
                ctx.rotate((this.rotation * Math.PI) / 180);

                // 꽃잎 모양 그리기
                ctx.beginPath();
                ctx.ellipse(0, 0, this.size, this.size * 1.5, 0, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();

                ctx.restore();
            }

            isDead() {
                return this.life <= 0 || this.y > canvas.height;
            }
        }

        // 꽃잎 생성
        const createPetals = (x, y, count, velocity) => {
            for (let i = 0; i < count; i++) {
                petalsRef.current.push(new Petal(x, y, velocity));
            }
            // 최대 100개로 제한
            if (petalsRef.current.length > 50) {
                petalsRef.current = petalsRef.current.slice(-50);
            }
        };

        // 터치/마우스 이벤트 핸들러
        const handleInteraction = (e) => {
            const x = e.touches ? e.touches[0].clientX : e.clientX;
            const y = e.touches ? e.touches[0].clientY : e.clientY;
            const now = Date.now();

            // 속도 계산 (터치 강도)
            const timeDiff = now - lastTouchRef.current.time;
            const distance = Math.sqrt(
                Math.pow(x - lastTouchRef.current.x, 2) +
                Math.pow(y - lastTouchRef.current.y, 2)
            );
            const velocity = timeDiff > 0 ? Math.min(distance / timeDiff, 3) : 1;

            // 속도에 따라 꽃잎 개수 조절 (1-5개)
            const petalCount = Math.ceil(velocity * 2);
            createPetals(x, y, petalCount, velocity);

            lastTouchRef.current = { x, y, time: now };
            setIsActive(true);
        };

        // 애니메이션 루프
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 꽃잎 업데이트 및 그리기
            petalsRef.current = petalsRef.current.filter((petal) => {
                petal.update();
                petal.draw(ctx);
                return !petal.isDead();
            });

            animationFrameId = requestAnimationFrame(animate);
        };
        animate();

        // 이벤트 리스너
        window.addEventListener('mousemove', handleInteraction);
        window.addEventListener('touchmove', handleInteraction);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleInteraction);
            window.removeEventListener('touchmove', handleInteraction);
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

export default PetalEffect;
