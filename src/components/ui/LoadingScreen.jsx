import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingScreen = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 2.5초 후 로딩 화면 제거
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2200);

        return () => clearTimeout(timer);
    }, []);

    const deepRose = '#D6635C';

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
                    transition={{ duration: 1.2, ease: [0.43, 0.13, 0.23, 0.96] }}
                    className="fixed inset-0 z-[9999] bg-[#0F0F0F] flex items-center justify-center"
                >
                    <div className="text-center">
                        {/* 커플 이니셜 애니메이션 */}
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1.5, ease: 'easeOut' }}
                            className="mb-8"
                        >
                            <div
                                className="text-4xl md:text-5xl font-serif mb-4 tracking-[0.2em]"
                                style={{ color: deepRose }}
                            >
                                JY & SY
                            </div>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 1.5, delay: 0.5, ease: 'easeInOut' }}
                                className="h-[1px] mx-auto"
                                style={{
                                    background: `linear-gradient(to right, transparent, ${deepRose}, transparent)`
                                }}
                            />
                        </motion.div>

                        {/* 날짜 텍스트 */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1, delay: 1.2 }}
                            className="text-white/60 text-sm md:text-md font-light tracking-[0.4em]"
                        >
                            2026.09.20
                        </motion.div>

                        {/* 로딩 인디케이터 */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.8, delay: 1.8 }}
                            className="mt-16 flex justify-center gap-3"
                        >
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        y: [0, -5, 0],
                                        opacity: [0.2, 1, 0.2],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.3,
                                        ease: "easeInOut"
                                    }}
                                    className="w-1 h-1 rounded-full"
                                    style={{ backgroundColor: deepRose }}
                                />
                            ))}
                        </motion.div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default LoadingScreen;
