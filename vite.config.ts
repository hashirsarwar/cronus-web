import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

/** Keeps the proxy target out of the source, so it can follow the service. */
const orderingServiceUrl = process.env.ORDERING_SERVICE_URL ?? 'http://localhost:5081'


export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {

      '/api': {
        target: orderingServiceUrl,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    // Keeps stubs from leaking between tests.
    restoreMocks: true,
    unstubGlobals: true,
  },
})
