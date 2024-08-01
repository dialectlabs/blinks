import type { TypedParameter } from '../../actions-spec.ts';

export const isPatternAllowed = (parameter: TypedParameter) => {
  return (
    parameter.type !== 'select' &&
    parameter.type !== 'radio' &&
    parameter.type !== 'checkbox'
  );
};
