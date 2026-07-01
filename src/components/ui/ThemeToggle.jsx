import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const getInitialTheme = () => {
  // index.html의 인라인 스크립트가 이미 설정한 값을 우선 사용
  const current = document.documentElement.dataset.theme;
  if (current === 'light' || current === 'dark') return current;
  try {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
};

const ThemeToggle = () => {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem('theme', theme);
    } catch {
      /* localStorage 불가 환경 무시 */
    }
  }, [theme]);

  const isDark = theme === 'dark';

  return (
    <div className="fixed top-4 right-16 z-50">
      <motion.button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        whileTap={{ scale: 0.9 }}
        aria-label={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
        className="relative w-10 h-10 rounded-full flex items-center justify-center shadow-lg backdrop-blur-md border border-white/10 bg-black/40 text-white/80 transition-colors"
      >
        {isDark ? (
          // 해 (탭하면 라이트로)
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" />
            <path strokeLinecap="round" d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
        ) : (
          // 달 (탭하면 다크로)
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </motion.button>
    </div>
  );
};

export default ThemeToggle;
