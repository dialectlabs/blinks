import {
  type ChangeEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
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
  const id = useId();
  const isStandalone = !!button;
  const [value, setValue] = useState('');
  const [isValid, setValid] = useState(!isStandalone && !required);
  const [touched, setTouched] = useState(false);
  const minDate = min as string | undefined;
  const maxDate = max as string | undefined;

  useEffect(() => {
    onValidityChange?.(isValid);
    // calling this once, just to give the idea for the parent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const extendedChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;
      const validity = e.currentTarget.checkValidity();

      setValue(value);
      setValid(validity);

      onChange?.(value);
      onValidityChange?.(validity);
    },
    [onChange, onValidityChange],
  );

  const placeholderWithRequired =
    (placeholder || 'Enter a date') + (required ? '*' : '');

  const validationProps = useMemo(
    () => ({
      min: minDate,
      max: maxDate,
      pattern,
      title: description,
    }),
    [minDate, maxDate, pattern, description],
  );

  return (
    <BaseInputContainer
      standalone={isStandalone}
      description={
        description ??
        buildDefaultDateDescription({ min: minDate, max: maxDate })
      }
      leftAdornment={
        <label htmlFor={id}>
          <CalendarIcon className="text-icon-primary" />
        </label>
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
        id={id}
        type={pattern || !touched ? 'text' : type}
        placeholder={placeholderWithRequired}
        value={value}
        onChange={extendedChange}
        onFocus={() => setTouched(true)}
        {...validationProps}
        required={button ? true : required}
        disabled={disabled}
      />
    </BaseInputContainer>
  );
};
