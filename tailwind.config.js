/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // 영문 디스플레이 세리프(제목/날짜), 필기체(이니셜), 국문 본문 세리프
        display: ['"Cormorant Garamond"', 'serif'],
        script: ['"Great Vibes"', 'cursive'],
        serif: ['"Noto Serif KR"', 'serif'],
      },
      // 색상은 index.css의 :root 변수를 단일 소스로 참조한다.
      colors: {
        'theme-bg': 'var(--color-theme-bg)',
        'theme-primary': {
          DEFAULT: 'var(--color-theme-primary)',
          active: 'var(--color-theme-primary-active)',
        },
        'theme-secondary': 'var(--color-theme-secondary)',
        'theme-accent': 'var(--color-theme-accent)',
        'theme-text-dark': '#1a1a1a',
        'brand': {
          DEFAULT: 'var(--color-brand)',
          hover: 'var(--color-brand-hover)',
        },
        'navy': {
          DEFAULT: 'var(--color-navy)',
          hover: 'var(--color-navy-hover)',
        },
      },
    },
  },
  plugins: [],
}
