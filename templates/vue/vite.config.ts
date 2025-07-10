import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    ssrManifest: true,
    rollupOptions: {
      input: 'src/index.html'
    }
  },
  ssr: {
    noExternal: ['pinia']
  }
})
