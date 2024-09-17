import fsp from 'node:fs/promises'
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
  plugins: [
    {
      name: 'remove-type-files',
      buildEnd({ writtenFiles }) {
        writtenFiles.forEach(async ({ name, size }) => {
          if (size === 0 || (name.endsWith('.js') && size <= 13)) {
            await fsp.rm(name)
          }
        })
      },
    },
  ],
})
