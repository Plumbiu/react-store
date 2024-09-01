import path from 'node:path'
import { defineConfig } from 'tsup'

const pkgPath = 'packages/store/src'
const pluginPath = 'packages/plugins/src'

export default defineConfig({
  entry: {
    index: path.join(pkgPath, 'index.ts'),
    plugins: path.join(pluginPath, 'index.ts'),
  },
  platform: 'browser',
  splitting: true,
  outDir: 'packages/store/dist',
  format: ['esm', 'cjs'],
  clean: true,
  bundle: true,
  minify: 'terser',
  dts: true,
  external: ['react'],
})
