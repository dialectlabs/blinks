import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/index.css', 'src/ext/twitter.tsx'],
  splitting: true,
  sourcemap: false,
  clean: true,
  dts: {
    entry: ['src/index.ts', 'src/ext/twitter.tsx'],
  },
  format: ['cjs', 'esm'],
  target: ['esnext'],
});
