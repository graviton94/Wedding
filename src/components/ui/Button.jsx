import { motion } from 'framer-motion';

// v2 통일 버튼 시스템 — 필(pill) 형태 + 자간을 기본으로, 팔레트 변수 기반 변형만 사용한다.
// 호출부에서 !important로 색을 덮어쓰지 말 것 (일관성 유지). 크기는 size, 색은 variant로.
const Button = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const variants = {
    // 채움 — 신부측/기본 CTA (부케 테라코타)
    primary: 'bg-brand text-white hover:bg-brand-hover active:bg-brand-hover shadow-[0_4px_14px_rgba(0,0,0,0.15)]',
    // 채움 — 신랑측/지도 (페리윙클 슬레이트)
    navy: 'bg-navy text-white hover:bg-navy-hover active:bg-navy-hover shadow-[0_4px_14px_rgba(0,0,0,0.15)]',
    // 헤어라인 아웃라인 — 페이지 배경 위 보조 CTA (골드 라인, 테마 대응)
    outline: 'bg-transparent border border-theme-accent/60 text-fg hover:bg-theme-accent/10',
    // 고스트 — 흰색 카드 내부 보조 액션 (카드가 테마와 무관하게 밝아서 고정 톤 사용)
    ghost: 'bg-transparent border border-black/15 text-black/60 hover:bg-black/5',
  };

  const sizes = {
    sm: 'py-1.5 px-4 text-xs',
    md: 'py-3 px-6 text-sm',
    lg: 'py-4 px-8 text-base',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`rounded-full font-medium tracking-wider transition-colors ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
