import { type ChangeEvent, useMemo, useState } from 'react';
import { ActionButton } from './ActionButton.tsx';
import { BaseInputContainer } from './BaseInputContainer.tsx';
import type { BaseInputProps } from './types.ts';

export const ActionTextInput = ({
  placeholder,
  name,
  button,
  disabled,
  onChange: extOnChange,
  pattern,
  min,
  max,
  description,
  required,
}: Omit<BaseInputProps, 'type'> & { onChange?: (value: string) => void }) => {
  const [value, onChange] = useState('');
  const [isValid, setValid] = useState(true);

  const extendedChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.currentTarget.value);
    extOnChange?.(e.currentTarget.value);
    setValid(e.currentTarget.checkValidity());
  };

  const placeholderWithRequired =
    (placeholder || 'Type here...') + (required ? '*' : '');

  const validationProps = useMemo(
    () => ({
      minLength: min as number,
      maxLength: max as number,
      pattern,
      title: description,
      required,
    }),
    [min, max, pattern, description, required],
  );

  return (
    <BaseInputContainer
      disabled={disabled}
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
        required={required ?? !!button}
        minLength={5}
      />
    </BaseInputContainer>
  );
};
