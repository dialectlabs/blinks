import clsx from 'clsx';
import { useCallback, useEffect, useMemo, useState } from 'react';
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

  const [value, setValue] = useState<Record<string, boolean>>(
    Object.fromEntries(
      options.map((option) => [option.value, option.selected ?? false]),
    ),
  );
  const normalizedValue = useMemo(
    () =>
      Object.entries(value)
        .filter(([, v]) => v)
        .map(([k]) => k),
    [value],
  );
  const [isValid, setValid] = useState(!isStandalone || !required);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    onChange?.(normalizedValue);
  }, [onChange, normalizedValue]);

  useEffect(() => {
    const validity = validate(normalizedValue, {
      required: isStandalone,
      min: minChoices,
      max: maxChoices,
    });

    setValid(validity);
    onValidityChange?.(validity);
  }, [isStandalone, maxChoices, minChoices, normalizedValue, onValidityChange]);

  const extendedChange = useCallback((name: string, value: boolean) => {
    setValue((prev) => ({ ...prev, [name]: value }));
    setTouched(true);
  }, []);

  return (
    <div
      className={clsx({
        'bg-bg-secondary rounded-button p-1.5 pt-2': isStandalone,
      })}
    >
      <div className={clsx(isStandalone && 'px-2')}>
        {label && (
          <div className="mb-2">
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
                value={value[option.value]}
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
            disabled={button.disabled || !normalizedValue.length || !isValid}
          />
        </div>
      )}
      {finalDescription && (
        <span
          className={clsx(
            'mt-1.5 text-caption font-medium',
            touched && !isValid ? 'text-text-error' : 'text-text-secondary',
          )}
        >
          {finalDescription}
        </span>
      )}
    </div>
  );
};
