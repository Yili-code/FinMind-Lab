import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    // 優化構建配置
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        // 手動分割代碼塊
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'chart-vendor': ['recharts'],
        },
      },
    },
    // 優化 chunk 大小警告閾值
    chunkSizeWarningLimit: 1000,
  },
  // 優化依賴預構建
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'recharts'],
  },
})
