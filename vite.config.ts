import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  base: '/admin/',
  server: {
    port: 9527, // 周星驰经典号码 🎬
    proxy: {
      '/api': {
        target: 'https://localhost:3456',
        changeOrigin: true,
        secure: false, // 允许自签名证书
      },
      '/uploads': {
        target: 'https://localhost:3456',
        changeOrigin: true,
        secure: false, // 允许自签名证书
      },
    },
  },
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
