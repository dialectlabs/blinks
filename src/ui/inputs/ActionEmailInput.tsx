import { type ChangeEvent, useMemo, useState } from 'react';
import EmailIcon from '../icons/EmailIcon.tsx';
import { ActionButton } from './ActionButton.tsx';
import { BaseInputContainer } from './BaseInputContainer.tsx';
import type { BaseInputProps } from './types.ts';
import { buildDefaultTextDescription } from './utils.ts';

export const ActionEmailInput = ({
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
  const minLength = min as number | undefined;
  const maxLength = max as number | undefined;

  const extendedChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    const validity = e.currentTarget.checkValidity();

    setValue(value);
    setValid(validity);

    onChange?.(value);
    onValidityChange?.(validity);
  };

  const placeholderWithRequired =
    (placeholder || 'hello@example.com') + (required ? '*' : '');

  const validationProps = useMemo(
    () => ({
      minLength,
      maxLength,
      pattern,
      title: description,
      required,
    }),
    [minLength, maxLength, pattern, description, required],
  );

  return (
    <BaseInputContainer
      description={
        description ??
        buildDefaultTextDescription({ min: minLength, max: maxLength })
      }
      leftAdornment={<EmailIcon className="text-icon-primary" />}
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
        type={pattern ? 'text' : 'email'}
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
