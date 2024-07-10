import { defineConfig, type Options } from 'tsup';

const commonCfg: Partial<Options> = {
  splitting: false,
  sourcemap: false,
  clean: true,
  format: ['cjs', 'esm'],
  target: ['esnext'],
};

export default defineConfig([
  {
    ...commonCfg,
    entry: ['src/react/index.ts'],
    outDir: 'dist/react',
    dts: {
      entry: ['src/react/index.ts'],
    },
    banner: {
      js: "'use client';",
    },
  },
  {
    ...commonCfg,
    entry: ['src/ext/twitter.tsx'],
    outDir: 'dist/ext',
    dts: {
      entry: ['src/ext/twitter.tsx'],
    },
  },
  {
    ...commonCfg,
    entry: ['src/index.ts', 'src/index.css'],
    outDir: 'dist',
    dts: {
      entry: ['src/index.ts'],
    },
  },
]);
