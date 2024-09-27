import type {
  ActionParameterType,
  SelectableParameterType,
  TypedActionParameter,
} from '@dialectlabs/blinks-core';

export type InputType = ActionParameterType;

export interface BaseButtonProps {
  text: string | null;
  loading?: boolean;
  variant?: 'default' | 'success' | 'error';
  disabled?: boolean;
  ctaType: 'button' | 'link';
  onClick: (params?: Record<string, string | string[]>) => void;
}

export interface BaseInputProps {
  type: InputType;
  placeholder?: string;
  name: string;
  disabled: boolean;
  required?: boolean;
  min?: number | string;
  max?: number | string;
  pattern?: string;
  description?: string;
  button?: BaseButtonProps;
  options?: TypedActionParameter<SelectableParameterType>['options'];
}
