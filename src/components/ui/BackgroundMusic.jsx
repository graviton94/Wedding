import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

const BackgroundMusic = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);
    const hasAutoPlayedRef = useRef(false);

    // Select random music file with weighted probability
    const selectRandomMusic = () => {
        const random = Math.random();
        if (random < 0.5) {
            return '/Wedding/music/1.mp3'; // 50% probability
        } else if (random < 0.75) {
            return '/Wedding/music/2.mp3'; // 25% probability
        } else {
            return '/Wedding/music/3.mp3'; // 25% probability
        }
    };

    // Initialize audio on mount
    useEffect(() => {
        const playNextTrack = () => {
            const nextSrc = selectRandomMusic();
            if (audioRef.current) {
                audioRef.current.src = nextSrc;
                audioRef.current.play().catch(err => console.log('Auto-play next track prevented:', err));
            }
        };

        const audio = new Audio(selectRandomMusic());
        audio.loop = false; // Disable loop to trigger 'ended' event
        audio.volume = 0.3;
        audio.onended = playNextTrack; // When song ends, play next random
        audioRef.current = audio;

        // Try to auto-play on load (will likely fail due to browser policy)
        audio.play()
            .then(() => {
                setIsPlaying(true);
                hasAutoPlayedRef.current = true;
                console.log('Music auto-playing');
            })
            .catch((error) => {
                console.log('Auto-play prevented by browser, waiting for user interaction');
            });

        // Cleanup on unmount
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.onended = null;
                audioRef.current = null;
            }
        };
    }, []);

    // Auto-play on first user interaction
    useEffect(() => {
        const handleFirstInteraction = () => {
            if (!audioRef.current || hasAutoPlayedRef.current) return;

            audioRef.current.play()
                .then(() => {
                    setIsPlaying(true);
                    hasAutoPlayedRef.current = true;
                    console.log('Music started on user interaction');
                })
                .catch((error) => {
                    console.log('Play failed:', error);
                });
        };

        // Listen for any user interaction
        window.addEventListener('click', handleFirstInteraction, { once: true });
        window.addEventListener('touchstart', handleFirstInteraction, { once: true });
        window.addEventListener('keydown', handleFirstInteraction, { once: true });

        return () => {
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('touchstart', handleFirstInteraction);
            window.removeEventListener('keydown', handleFirstInteraction);
        };
    }, []);

    // Toggle play/pause when user clicks the button
    const togglePlay = () => {
        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play()
                .then(() => {
                    setIsPlaying(true);
                })
                .catch((error) => {
                    console.log('Play failed:', error);
                });
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            <motion.button
                onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                }}
                whileTap={{ scale: 0.9 }}
                className={`
          relative w-10 h-10 rounded-full flex items-center justify-center 
          shadow-lg backdrop-blur-md border border-white/10 transition-all duration-300
          ${isPlaying ? 'bg-theme-secondary/80 text-white' : 'bg-black/40 text-white/70'}
        `}
            >
                {isPlaying ? (
                    <div className="flex gap-0.5 items-end h-4 pb-1">
                        <motion.div animate={{ height: [4, 12, 6, 12, 4] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-white rounded-full" />
                        <motion.div animate={{ height: [8, 4, 12, 5, 8] }} transition={{ repeat: Infinity, duration: 1.1 }} className="w-1 bg-white rounded-full" />
                        <motion.div animate={{ height: [6, 10, 4, 8, 6] }} transition={{ repeat: Infinity, duration: 0.9 }} className="w-1 bg-white rounded-full" />
                    </div>
                ) : (
                    <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                )}
            </motion.button>
        </div>
    );
};

export default BackgroundMusic;