import type { ParameterSelectable, ParameterType } from '../../api';

export type InputType = ParameterType;

export interface BaseButtonProps {
  text: string | null;
  loading?: boolean;
  variant?: 'default' | 'success' | 'error';
  disabled?: boolean;
  onClick: (params?: Record<string, string>) => void;
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
  options?: ParameterSelectable<'select' | 'radio' | 'checkbox'>['options'];
}
