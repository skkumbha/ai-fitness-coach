import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'url'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: '0.0.0.0',
    port: 8081,
    strictPort: true,
    cors: true,
    hmr: {
      clientPort: 443,
      host: 'workspace.sreeramkumbham.repl.co'
    },
    // Allow requests from the Replit webview domain
    fs: {
      strict: false
    },
    // Specific allowed hosts
    allowedHosts: [
      'workspace.sreeramkumbham.repl.co',
      '.repl.co',
      '.replit.dev',
      '.replit.app'
    ]
  }
})