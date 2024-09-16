import clsx from 'clsx';
import { useEffect, useMemo, useState } from 'react';
import { Checkbox } from '../Checkbox.tsx';
import { ActionButton } from './ActionButton.tsx';
import type { BaseInputProps } from './types.ts';
import { buildDefaultCheckboxGroupDescription } from './utils.ts';

const validate = (
  values: string[],
  { required, min, max }: { required?: boolean; min?: number; max?: number },
) => {
  if (required && !values.length) {
    return false;
  }

  if (min && values.length < min) {
    return false;
  }

  if (max && values.length > max) {
    return false;
  }

  return true;
};

const normalizeValue = (value: Record<string, boolean>) => {
  return Object.entries(value)
    .filter(([, v]) => v)
    .map(([k]) => k);
};

export const ActionCheckboxGroup = ({
  placeholder: label, // in base inputs it's placeholder, for selectables - label
  name,
  button,
  disabled,
  onChange,
  onValidityChange,
  min,
  max,
  description,
  options = [],
  required,
}: Omit<BaseInputProps, 'type'> & {
  onChange?: (value: string[]) => void;
  onValidityChange?: (state: boolean) => void;
}) => {
  const minChoices = min as number;
  const maxChoices = max as number;
  const isStandalone = !!button;
  const finalDescription =
    description ||
    buildDefaultCheckboxGroupDescription({
      min: minChoices,
      max: maxChoices,
    });

  const hasInitiallySelectedOption = useMemo(
    () => options.find((option) => option.selected),
    [options],
  );

  const [state, setState] = useState<{
    value: Record<string, boolean>;
    valid: boolean;
  }>({
    value: Object.fromEntries(
      options.map((option) => [option.value, option.selected ?? false]),
    ),
    valid: isStandalone
      ? !!hasInitiallySelectedOption
      : !(required && !hasInitiallySelectedOption),
  });

  const [touched, setTouched] = useState(false);

  useEffect(() => {
    onValidityChange?.(state.valid);
    // calling this once, just to give the idea for the parent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const extendedChange = (name: string, value: boolean) => {
    setState((prev) => {
      const newValue = { ...prev.value, [name]: value };

      const normalizedValue = normalizeValue(newValue);
      onChange?.(normalizedValue);

      const validity = validate(normalizedValue, {
        required: isStandalone,
        min: minChoices,
        max: maxChoices,
      });

      onValidityChange?.(validity);

      return {
        value: newValue,
        valid: validity,
      };
    });
    setTouched(true);
  };

  const normalizedValue = useMemo(
    () => normalizeValue(state.value),
    [state.value],
  );

  return (
    <div
      className={clsx('py-1.5', {
        'bg-bg-secondary rounded-input px-1.5 pt-2': isStandalone,
      })}
    >
      <div className={clsx(isStandalone && 'px-2')}>
        {label && (
          <div className="mb-1">
            <label className="block text-text font-semibold text-text-input">
              {label}
              {required ? '*' : ''}
            </label>
          </div>
        )}
        <div
          className={clsx('pt-2', {
            'flex flex-col gap-3': !isStandalone,
            'grid grid-cols-2 gap-x-4 gap-y-5': isStandalone,
          })}
        >
          {options.map((option) => (
            <div
              className="inline-flex"
              key={`${option.value}_${option.label}`}
            >
              <Checkbox
                label={option.label}
                value={state.value[option.value]}
                inputValue={option.value}
                onChange={(value) => extendedChange(option.value, value)}
                name={name}
                disabled={disabled}
              />
            </div>
          ))}
        </div>
      </div>
      {isStandalone && (
        <div className="mt-4">
          <ActionButton
            {...button}
            onClick={() => button.onClick({ [name]: normalizedValue })}
            disabled={
              button.disabled || !normalizedValue.length || !state.valid
            }
          />
        </div>
      )}
      {finalDescription && (
        <div
          className={clsx(
            'text-caption',
            touched && !state.valid ? 'text-text-error' : 'text-text-secondary',
            isStandalone ? 'mb-2 mt-2.5 px-2' : 'mt-3',
          )}
        >
          {finalDescription}
        </div>
      )}
    </div>
  );
};
