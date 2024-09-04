import type {
  SelectableParameterType,
  TypedActionParameter,
} from '../../actions-spec.ts';

export const isPatternAllowed = (parameter: TypedActionParameter) => {
  return (
    parameter.type !== 'select' &&
    parameter.type !== 'radio' &&
    parameter.type !== 'checkbox'
  );
};

export const isParameterSelectable = (
  parameter: TypedActionParameter,
): parameter is TypedActionParameter<SelectableParameterType> => {
  return (
    parameter.type === 'select' ||
    parameter.type === 'radio' ||
    parameter.type === 'checkbox'
  );
};
