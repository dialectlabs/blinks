import type {
  ActionParameter,
  ActionParameterType,
} from '../../actions-spec.ts';

export const isPatternAllowed = (
  parameter: ActionParameter<ActionParameterType>,
) => {
  return (
    parameter.type !== 'select' &&
    parameter.type !== 'radio' &&
    parameter.type !== 'checkbox'
  );
};
