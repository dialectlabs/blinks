import { type ChangeEvent, useId, useMemo, useState } from 'react';
import { ActionButton } from './ActionButton.tsx';
import { BaseInputContainer } from './BaseInputContainer.tsx';
import type { BaseInputProps } from './types.ts';

export const ActionSelect = ({
  placeholder,
  name,
  button,
  disabled,
  onChange,
  onValidityChange,
  description,
  required,
  options = [],
}: Omit<BaseInputProps, 'type'> & {
  onChange?: (value: string) => void;
  onValidityChange?: (state: boolean) => void;
}) => {
  const placeholderValueId = useId();
  const placeholderWithRequired =
    (placeholder || 'Select...') + (required ? '*' : '');

  const initiallySelectedOption = useMemo(
    () => options.find((option) => option.selected),
    [options],
  );

  const [value, setValue] = useState(
    initiallySelectedOption?.value ?? placeholderValueId,
  );
  const [isValid, setValid] = useState(
    button
      ? !!initiallySelectedOption
      : !(required && !initiallySelectedOption),
  );

  const extendedChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.currentTarget.value;
    const validity =
      e.currentTarget.checkValidity() && placeholderValueId !== value;

    setValue(value);
    setValid(validity);

    onChange?.(value);
    onValidityChange?.(validity);
  };

  return (
    <BaseInputContainer
      description={description}
      rightAdornment={
        button ? (
          <div className="ml-1.5">
            <ActionButton
              {...button}
              onClick={() => button.onClick({ [name]: value })}
              disabled={button.disabled || value === '' || !isValid}
            />
          </div>
        ) : null
      }
    >
      <select
        value={value}
        onChange={extendedChange}
        required={button ? true : required}
        disabled={disabled}
      >
        <option disabled={true} value={placeholderValueId}>
          {placeholderWithRequired}
        </option>
        {options.map((option) => (
          <option key={`${option.value}_${option.label}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </BaseInputContainer>
  );
};
