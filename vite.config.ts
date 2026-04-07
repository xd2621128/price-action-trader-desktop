import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'

const projectRoot = resolve(__dirname)

export default defineConfig({
  plugins: [
    vue(),
    electron([
      {
        entry: resolve(projectRoot, 'src/main/index.ts'),
        onstart(options) {
          options.startup()
        },
        vite: {
          build: {
            outDir: resolve(projectRoot, 'dist-electron/main'),
            rollupOptions: {
              external: ['electron', 'electron-store', 'electron-log', 'chokidar']
            }
          }
        }
      },
      {
        entry: resolve(projectRoot, 'src/preload/index.ts'),
        onstart(options) {
          options.reload()
        },
        vite: {
          build: {
            outDir: resolve(projectRoot, 'dist-electron/preload'),
            rollupOptions: {
              external: ['electron']
            }
          }
        }
      }
    ]),
    renderer()
  ],
  resolve: {
    alias: {
      '@': resolve(projectRoot, 'src/renderer/src')
    }
  },
  root: resolve(projectRoot, 'src/renderer'),
  build: {
    outDir: resolve(projectRoot, 'dist')
  }
})
