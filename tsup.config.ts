import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['packages/store/src/**/*.ts'],
  platform: 'browser',
  splitting: true,
  bundle: false,
  outDir: 'packages/store/dist',
  format: ['esm', 'cjs'],
  clean: true,
  minify: 'terser',
  dts: true,
  external: ['react', 'immer'],
})
