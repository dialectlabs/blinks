import packageJson from '../../package.json';

const pkg = packageJson as unknown as {
  devDependencies: { '@solana/actions-spec': string };
};

export const ACTIONS_SPEC_VERSION = pkg.devDependencies[
  '@solana/actions-spec'
].replace(/[^\d.]/g, '');
