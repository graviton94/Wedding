import React, { useState, useRef, useEffect } from 'react';
import YouTube from 'react-youtube';
import { motion } from 'framer-motion';

const BackgroundMusic = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [userStoppedMusic, setUserStoppedMusic] = useState(false); // Track if user manually stopped
    const playerRef = useRef(null);

    // ✅ 영상 ID
    const VIDEO_ID = "DYz-LjtiVOc";

    const opts = {
        height: '0',
        width: '0',
        playerVars: {
            autoplay: 1, // 로드 시 자동재생 시도
            loop: 1,
            playlist: VIDEO_ID,
            controls: 0,
            showinfo: 0,
            playsinline: 1,
            rel: 0,
            suggestedQuality: 'small',
        },
    };

    const onReady = (event) => {
        console.log('Music Ready');
        playerRef.current = event.target;
        event.target.setVolume(30);
        // 로드 되자마자 일단 재생 시도 (운 좋으면 PC에서 바로 됨)
        event.target.playVideo();
    };

    const onStateChange = (event) => {
        // 1: 재생중 (PLAYING)
        if (event.data === 1) {
            setIsPlaying(true);
            // 재생 성공했으므로 감지기 제거
            removeInteractionListeners();
        }
        // 2: 일시정지 (PAUSED)
        else if (event.data === 2) {
            setIsPlaying(false);
        }
    };

    // ✅ 사용자가 화면에 '닿는 순간' 실행 (PC클릭, 모바일터치 모두 포함)
    const handleUserGesture = () => {
        if (!playerRef.current) return;

        // 사용자가 수동으로 중지했다면 자동 재생 안 함
        if (userStoppedMusic) return;

        // 이미 재생 중이면 패스
        if (playerRef.current.getPlayerState() === 1) return;

        console.log('Touch/Click Detected -> Play!');

        // 재생 실행
        playerRef.current.playVideo();
    };

    const removeInteractionListeners = () => {
        window.removeEventListener('pointerdown', handleUserGesture);
        window.removeEventListener('keydown', handleUserGesture); // 키보드 입력도 대응
    };

    useEffect(() => {
        // ✅ 'pointerdown'은 마우스 클릭, 터치, 펜 입력을 모두 포함하는 가장 빠른 이벤트입니다.
        window.addEventListener('pointerdown', handleUserGesture, { capture: true, once: false });
        // 키보드로 스크롤 내리는 사람들을 위해 키보드 이벤트도 추가
        window.addEventListener('keydown', handleUserGesture, { capture: true, once: false });

        return () => {
            removeInteractionListeners();
        };
    }, []);

    const togglePlay = () => {
        if (!playerRef.current) return;
        if (isPlaying) {
            playerRef.current.pauseVideo();
            setUserStoppedMusic(true); // 사용자가 수동으로 중지함을 기록
        } else {
            playerRef.current.playVideo();
            setUserStoppedMusic(false); // 다시 재생하면 자동재생 허용
        }
    };

    return (
        <div className="fixed top-4 right-4 z-50">
            <div className="hidden">
                <YouTube
                    videoId={VIDEO_ID}
                    opts={opts}
                    onReady={onReady}
                    onStateChange={onStateChange}
                />
            </div>

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