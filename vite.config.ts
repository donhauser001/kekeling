import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  server: {
    port: 9527, // 周星驰经典号码 🎬
    proxy: {
      '/api': {
        target: 'http://localhost:3456',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:3456',
        changeOrigin: true,
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
