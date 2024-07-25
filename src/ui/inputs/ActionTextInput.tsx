import clsx from 'clsx';
import { type ChangeEvent, useState } from 'react';
import type { InputProps } from '../ActionLayout.tsx';
import { ActionButton } from './ActionButton.tsx';

export const ActionTextInput = ({
  placeholder,
  name,
  button,
  disabled,
  onChange: extOnChange,
  required,
}: InputProps & { onChange?: (value: string) => void }) => {
  const [value, onChange] = useState('');

  const extendedChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(e.currentTarget.value);
    extOnChange?.(e.currentTarget.value);
  };

  const placeholderWithRequired =
    (placeholder || 'Type here...') + (required ? '*' : '');

  return (
    <div
      className={clsx(
        'flex items-center gap-2 rounded-input border border-input-stroke transition-colors focus-within:border-input-stroke-selected motion-reduce:transition-none',
        {
          'hover:border-input-stroke-hover hover:focus-within:border-input-stroke-selected':
            !disabled,
        },
      )}
    >
      <input
        placeholder={placeholderWithRequired}
        value={value}
        disabled={disabled}
        onChange={extendedChange}
        className="my-3 ml-4 flex-1 truncate bg-input-bg text-text-input outline-none placeholder:text-text-input-placeholder disabled:text-text-input-disabled"
      />
      {button && (
        <div className="my-2 mr-2">
          <ActionButton
            {...button}
            onClick={() => button.onClick({ [name]: value })}
            disabled={button.disabled || value === ''}
          />
        </div>
      )}
    </div>
  );
};
