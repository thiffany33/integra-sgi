import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url)),
    '@integra/shared/documents': fileURLToPath(new URL('../packages/shared/src/documents/documents.ts', import.meta.url)),
    '@integra/shared/requirements': fileURLToPath(new URL('../packages/shared/src/requirements/index.ts', import.meta.url)),
  } },
})
