import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { motion } from 'framer-motion';

const BackgroundMusic = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const playerRef = useRef(null);

    // ✅ 여기에 원하는 유튜브 영상 ID (예: 재즈 피아노)
    const VIDEO_ID = "DYz-LjtiVOc";

    const opts = {
        height: '0',
        width: '0',
        playerVars: {
            autoplay: 0, // 로드되자마자 재생 시도는 하지 않음 (어차피 막힘)
            loop: 1,
            playlist: VIDEO_ID,
            controls: 0,
            showinfo: 0,
        },
    };

    const onReady = (event) => {
        playerRef.current = event.target;
        event.target.setVolume(30); // 볼륨 설정
    };

    // ✅ [핵심] 사용자의 첫 번째 인터랙션(터치/클릭)을 낚아채서 재생
    useEffect(() => {
        const handleFirstInteraction = () => {
            if (playerRef.current) {
                // 1. 영상 재생 시도
                playerRef.current.playVideo();
                setIsPlaying(true);

                // 2. 임무 완수 후 리스너 제거 (한 번만 실행되게)
                window.removeEventListener('click', handleFirstInteraction);
                window.removeEventListener('touchstart', handleFirstInteraction);
                window.removeEventListener('scroll', handleFirstInteraction); // 스크롤 시에도 재생
            }
        };

        // 화면 어디든 터치, 클릭, 스크롤하면 재생 트리거
        window.addEventListener('click', handleFirstInteraction);
        window.addEventListener('touchstart', handleFirstInteraction);
        window.addEventListener('scroll', handleFirstInteraction);

        return () => {
            window.removeEventListener('click', handleFirstInteraction);
            window.removeEventListener('touchstart', handleFirstInteraction);
            window.removeEventListener('scroll', handleFirstInteraction);
        };
    }, []);

    const togglePlay = () => {
        if (!playerRef.current) return;

        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
        setIsPlaying(!isPlaying);
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className="hidden">
                <YouTube videoId={VIDEO_ID} opts={opts} onReady={onReady} />
            </div>

            <motion.button
                onClick={togglePlay}
                whileTap={{ scale: 0.9 }}
                className={`
          relative w-10 h-10 rounded-full flex items-center justify-center 
          shadow-lg backdrop-blur-md border border-white/10 transition-all duration-300
          ${isPlaying ? 'bg-theme-accent/80 text-white' : 'bg-black/40 text-white/70'}
        `}
            >
                {isPlaying ? (
                    <div className="flex gap-0.5 items-end h-4 pb-1">
                        <motion.div
                            animate={{ height: [4, 12, 6, 12, 4] }}
                            transition={{ repeat: Infinity, duration: 0.8 }}
                            className="w-1 bg-white rounded-full"
                        />
                        <motion.div
                            animate={{ height: [8, 4, 12, 5, 8] }}
                            transition={{ repeat: Infinity, duration: 1.1 }}
                            className="w-1 bg-white rounded-full"
                        />
                        <motion.div
                            animate={{ height: [6, 10, 4, 8, 6] }}
                            transition={{ repeat: Infinity, duration: 0.9 }}
                            className="w-1 bg-white rounded-full"
                        />
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
