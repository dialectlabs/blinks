import packageJson from '../../package.json';

const pkg = packageJson as unknown as {
  devDependencies: { '@solana/actions-spec': string };
};

// TODO: to be replaced with the actual version number exported from the actions-spec package
export const ACTIONS_SPEC_VERSION = pkg.devDependencies[
  '@solana/actions-spec'
].replace(/[^\d.]/g, '');
