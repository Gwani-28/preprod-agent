import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base: './' — 상대 경로 자산. GitHub Pages 프로젝트 서브경로
// (https://<user>.github.io/preprod-agent/)에서도 그대로 열린다.
export default defineConfig({
  base: './',
  plugins: [react()],
})
