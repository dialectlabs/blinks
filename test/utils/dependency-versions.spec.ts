import { describe, expect, test } from 'bun:test';
import { ACTIONS_SPEC_VERSION } from '../../src/utils/dependency-versions.ts';

describe('dependencyVersions', () => {
  test('should extract the correct version numbe for actions spec', () => {
    expect(ACTIONS_SPEC_VERSION).not.toBeNull();
    expect(ACTIONS_SPEC_VERSION).not.toBeUndefined();
    expect(ACTIONS_SPEC_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
