import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: '/Wedding/',
  build: {
    target: 'es2015',
  },
  // 프로덕션 빌드에서만 console/debugger 제거 (개발 중에는 로그 유지)
  esbuild: {
    drop: command === 'build' ? ['console', 'debugger'] : [],
  },
}))
