import {
  type ChangeEvent,
  useCallback,
  useMemo,
  useRef,
  useState,
} from 'react';
import CalendarIcon from '../icons/CalendarIcon.tsx';
import { ActionButton } from './ActionButton.tsx';
import { BaseInputContainer } from './BaseInputContainer.tsx';
import type { BaseInputProps } from './types.ts';
import { buildDefaultDateDescription } from './utils.ts';

export const ActionDateInput = ({
  type = 'date',
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
  type?: 'date' | 'datetime-local';
  onChange?: (value: string) => void;
  onValidityChange?: (state: boolean) => void;
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [isValid, setValid] = useState(button ? false : !required);
  const minDate = min as string | undefined;
  const maxDate = max as string | undefined;

  const extendedChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const value = e.currentTarget.value;
    const validity = e.currentTarget.checkValidity();

    setValue(value);
    setValid(validity);

    onChange?.(value);
    onValidityChange?.(validity);
  }, []);

  const placeholderWithRequired =
    (placeholder || 'hello@example.com') + (required ? '*' : '');

  const validationProps = useMemo(
    () => ({
      min: minDate,
      max: maxDate,
      pattern,
      title: description,
      required,
    }),
    [minDate, maxDate, pattern, description, required],
  );

  return (
    <BaseInputContainer
      description={
        description ??
        buildDefaultDateDescription({ min: minDate, max: maxDate })
      }
      leftAdornment={
        <button
          className="flex items-center"
          onClick={() => ref.current?.focus()}
        >
          <CalendarIcon className="text-icon-primary" />
        </button>
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
        ref={ref}
        type={pattern ? 'text' : type}
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
