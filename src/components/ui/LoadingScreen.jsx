import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LoadingScreen = () => {
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // 2.5초 후 로딩 화면 제거
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 2500);

        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: 'easeInOut' }}
                    className="fixed inset-0 z-[9999] bg-gradient-to-br from-[#0F0F0F] via-[#1a1a1a] to-[#0F0F0F] flex items-center justify-center"
                >
                    <div className="text-center">
                        {/* 커플 이니셜 애니메이션 */}
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="mb-8"
                        >
                            <div className="text-6xl md:text-8xl font-serif text-theme-primary mb-4">
                                JY & SY
                            </div>
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 1.2, delay: 0.5 }}
                                className="h-0.5 bg-gradient-to-r from-transparent via-theme-primary to-transparent mx-auto"
                            />
                        </motion.div>

                        {/* 날짜 텍스트 */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                            className="text-white/80 text-lg md:text-xl font-light tracking-widest"
                        >
                            2026.09.20
                        </motion.div>

                        {/* 로딩 인디케이터 */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5, delay: 1.5 }}
                            className="mt-12 flex justify-center gap-2"
                        >
                            {[0, 1, 2].map((i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.3, 1, 0.3],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                    }}
                                    className="w-2 h-2 rounded-full bg-theme-primary"
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
