import * as path from 'path';
import { defineConfig, type Options } from 'tsup';

const tsConfigPath = path.resolve(__dirname, '../..', 'tsconfig.json');

console.log(tsConfigPath);

const commonCfg: Partial<Options> = {
  splitting: true,
  sourcemap: false,
  clean: true,
  format: ['cjs', 'esm'],
  target: ['esnext'],
  tsconfig: tsConfigPath,
};

export default defineConfig([
  {
    ...commonCfg,
    entry: [
      'src/index.ts',
      'src/index.css',
      'src/ext/twitter.tsx',
      'src/hooks/index.ts',
      'src/hooks/solana/index.ts',
    ],
    dts: {
      entry: [
        'src/index.ts',
        'src/ext/twitter.tsx',
        'src/hooks/index.ts',
        'src/hooks/solana/index.ts',
      ],
    },
  },
]);
