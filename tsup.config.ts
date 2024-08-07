import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['packages/mini-react/src/index.ts'],
  splitting: true,
  outDir: 'packages/mini-react/dist',
  format: ['esm', 'cjs'],
  clean: true,
  bundle: true,
  minify: true,
  dts: true,
  external: ['react'],
})
