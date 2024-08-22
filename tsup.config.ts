import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['packages/store/src/index.ts'],
  splitting: true,
  outDir: 'packages/store/dist',
  format: ['esm', 'cjs'],
  clean: true,
  bundle: true,
  minify: true,
  dts: true,
  external: ['react'],
})
