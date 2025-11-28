import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// Architecture:
// - Main process: CommonJS (default, no "type": "module" in package.json)
// - Preload: CommonJS
// - Renderer: ESM via Vite (React app)

export default defineConfig({
  plugins: [
    react(),
    electron({
      main: {
        entry: 'electron/main.ts',
        // Custom onstart to spawn Electron with clean environment
        // CRITICAL: We must create the env snapshot at startup time (not config load time)
        // so that VITE_DEV_SERVER_URL is included after Vite sets it
        // Also remove ELECTRON_RUN_AS_NODE which breaks Electron when running from VS Code
        onstart({ startup }) {
          const electronEnv = { ...process.env }
          delete electronEnv.ELECTRON_RUN_AS_NODE
          startup(['.', '--no-sandbox'], { env: electronEnv })
        },
        vite: {
          build: {
            rollupOptions: {
              // CRITICAL: electron must be external so it resolves to
              // Electron's built-in module at runtime, not the npm stub
              external: ['electron'],
            },
          },
        },
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
        vite: {
          build: {
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
      // Polyfill the Electron and Node.js API for Renderer process.
      // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      renderer: process.env.NODE_ENV === 'test'
        ? undefined
        : {},
    }),
  ],
})
