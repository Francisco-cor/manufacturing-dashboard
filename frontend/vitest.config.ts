import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  // Redirect chart.js/auto to a lightweight stub in tests so Chart instances
  // never try to acquire a canvas context (jsdom has no canvas support).
  resolve: {
    alias: {
      'chart.js/auto': resolve(__dirname, 'src/test/__mocks__/Chart.ts'),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
    css: true,
  },
})
