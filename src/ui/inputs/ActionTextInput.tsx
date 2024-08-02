import { type ChangeEvent, useMemo, useState } from 'react';
import { ActionButton } from './ActionButton.tsx';
import { BaseInputContainer } from './BaseInputContainer.tsx';
import type { BaseInputProps } from './types.ts';
import { buildDefaultTextDescription } from './utils.ts';

export const ActionTextInput = ({
  placeholder,
  name,
  button,
  disabled,
  onChange,
  onValidityChange,
  pattern,
  min,
  max,
  description,
  required,
}: Omit<BaseInputProps, 'type'> & {
  onChange?: (value: string) => void;
  onValidityChange?: (state: boolean) => void;
}) => {
  const [value, setValue] = useState('');
  const [isValid, setValid] = useState(button ? false : !required);
  const minLength = min as number;
  const maxLength = max as number;

  const extendedChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    const validity = e.currentTarget.checkValidity();

    setValue(value);
    setValid(validity);

    onChange?.(value);
    onValidityChange?.(validity);
  };

  const placeholderWithRequired =
    (placeholder || 'Type here...') + (required ? '*' : '');

  const validationProps = useMemo(
    () => ({
      minLength,
      maxLength,
      pattern,
      title: description,
    }),
    [minLength, maxLength, pattern, description],
  );

  return (
    <BaseInputContainer
      description={
        description ??
        buildDefaultTextDescription({ min: minLength, max: maxLength })
      }
      rightAdornment={
        button ? (
          <ActionButton
            {...button}
            onClick={() => button.onClick({ [name]: value })}
            disabled={button.disabled || value === '' || !isValid}
          />
        ) : null
      }
    >
      <input
        type="text"
        placeholder={placeholderWithRequired}
        value={value}
        onChange={extendedChange}
        {...validationProps}
        required={button ? true : required}
        disabled={disabled}
      />
    </BaseInputContainer>
  );
};
