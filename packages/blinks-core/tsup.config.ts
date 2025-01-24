import { defineConfig, type Options } from 'tsup';

const commonCfg: Partial<Options> = {
  splitting: true,
  sourcemap: false,
  clean: true,
  format: ['cjs', 'esm'],
  target: ['esnext'],
};

export default defineConfig([
  {
    ...commonCfg,
    entry: ['src/index.ts', 'src/service-api/index.ts'],
    dts: {
      entry: ['src/index.ts', 'src/service-api/index.ts'],
    },
  },
]);
