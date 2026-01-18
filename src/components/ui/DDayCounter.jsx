import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const DDayCounter = ({ targetDate }) => {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        isToday: false,
        isPast: false
    });

    useEffect(() => {
        const calculateTimeLeft = () => {
            const now = new Date();
            const target = new Date(targetDate);
            const difference = target - now;

            if (difference < 0) {
                // 결혼식이 지났음
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isToday: false, isPast: true });
                return;
            }

            const days = Math.floor(difference / (1000 * 60 * 60 * 24));
            const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
            const minutes = Math.floor((difference / 1000 / 60) % 60);
            const seconds = Math.floor((difference / 1000) % 60);

            const isToday = days === 0 && hours < 24;

            setTimeLeft({ days, hours, minutes, seconds, isToday, isPast: false });
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [targetDate]);

    if (timeLeft.isPast) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mt-6"
            >
                <p className="text-white/80 text-lg font-['Noto_Sans_KR']">
                    행복한 결혼 생활을 응원합니다! 🎉
                </p>
            </motion.div>
        );
    }

    if (timeLeft.isToday) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center mt-6"
            >
                <p className="text-2xl font-bold text-[#FFD700] font-['Noto_Sans_KR'] mb-2">
                    🎊 오늘이 바로 그날입니다! 🎊
                </p>
                <div className="flex justify-center gap-4 text-white/90">
                    <TimeUnit value={timeLeft.hours} label="시간" />
                    <TimeUnit value={timeLeft.minutes} label="분" />
                    <TimeUnit value={timeLeft.seconds} label="초" />
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mt-6"
        >
            <p className="text-white/70 text-sm mb-3 font-['Noto_Sans_KR']">
                결혼식까지
            </p>
            <div className="flex justify-center gap-3">
                <TimeUnit value={timeLeft.days} label="일" highlight />
                <TimeUnit value={timeLeft.hours} label="시간" />
                <TimeUnit value={timeLeft.minutes} label="분" />
                <TimeUnit value={timeLeft.seconds} label="초" />
            </div>
        </motion.div>
    );
};

const TimeUnit = ({ value, label, highlight }) => {
    return (
        <div className="flex flex-col items-center">
            <motion.div
                key={value}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.3 }}
                className={`
          ${highlight ? 'bg-[#FFD700] text-black' : 'bg-white/10 text-white'}
          px-3 py-2 rounded-lg min-w-[50px] backdrop-blur-sm
        `}
            >
                <span className="text-2xl font-bold font-mono">
                    {String(value).padStart(2, '0')}
                </span>
            </motion.div>
            <span className="text-xs text-white/60 mt-1 font-['Noto_Sans_KR']">
                {label}
            </span>
        </div>
    );
};

export default DDayCounter;
