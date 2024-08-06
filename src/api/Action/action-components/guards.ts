import type {
  ActionParameter,
  ActionParameterSelectable,
  ActionParameterType,
  SelectableParameterType,
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

export const isParameterSelectable = (
  parameter: ActionParameter<ActionParameterType>,
): parameter is ActionParameterSelectable<SelectableParameterType> => {
  return (
    parameter.type === 'select' ||
    parameter.type === 'radio' ||
    parameter.type === 'checkbox'
  );
};
