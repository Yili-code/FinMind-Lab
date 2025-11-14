import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 開發服務器配置
    host: 'localhost',
    port: 5173,
    strictPort: false, // 如果端口被占用，自動嘗試下一個可用端口
    open: false, // 不自動打開瀏覽器
    cors: true, // 啟用 CORS（雖然代理會處理，但保留作為備用）
    
    // 代理配置 - 將所有 /api 請求轉發到後端
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true, // 改變請求的 origin 為目標 URL，解決 CORS 問題
        secure: false, // 如果是 https，設置為 false 以允許自簽名證書
        ws: true, // 啟用 WebSocket 代理（如果需要）
        
        // 重寫路徑（如果需要移除 /api 前綴，取消註釋下面這行）
        // rewrite: (path) => path.replace(/^\/api/, ''),
        
        // 配置超時（毫秒）
        timeout: 30000, // 30 秒超時
        
        // 配置請求頭
        headers: {
          'Connection': 'keep-alive',
        },
        
        // 使用 configure 來添加事件監聽器（用於調試和錯誤處理）
        configure: (proxy, _options) => {
          // 監聽代理錯誤
          proxy.on('error', (err, _req, _res) => {
            console.error('[Vite Proxy] 代理錯誤:', err.message)
            console.error('[Vite Proxy] 請確認後端服務器是否正在運行 (http://localhost:8000)')
          })
          
          // 監聽代理請求（用於調試）- 總是記錄以幫助調試
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log(`[Vite Proxy] 轉發請求: ${req.method} ${req.url} -> http://localhost:8000${req.url}`)
          })
          
          // 監聽代理響應（用於調試）- 總是記錄以幫助調試
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            const status = proxyRes.statusCode
            const statusColor = status >= 500 ? '\x1b[31m' : status >= 400 ? '\x1b[33m' : '\x1b[32m'
            console.log(`${statusColor}[Vite Proxy] ${req.url} -> ${status}\x1b[0m`)
          })
        },
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
