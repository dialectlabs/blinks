import clsx from 'clsx';
import { useId } from 'react';
import CheckboxCheckIcon from './icons/CheckboxCheckIcon.tsx';

interface Props {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  name?: string;
  disabled?: boolean;
}

export const Checkbox = ({ label, value, onChange, name, disabled }: Props) => {
  const id = useId();
  const labelId = `${id}_label`;

  return (
    <button
      className={clsx('inline-flex gap-2.5', {
        'cursor-pointer': !disabled,
        'cursor-not-allowed': disabled,
      })}
      onClick={() => !disabled && onChange(!value)}
    >
      <input
        type="checkbox"
        name={name}
        defaultChecked={value}
        className="hidden"
      />
      <span
        role="checkbox"
        id={id}
        aria-labelledby={labelId}
        className={clsx(
          'mt-0.5 flex h-4 min-h-4 w-4 min-w-4 items-center justify-center rounded-lg border transition-colors motion-reduce:transition-none',
          {
            'border-input-stroke bg-input-bg': !value && !disabled,
            'bg-input-bg-selected border-input-stroke-selected':
              value && !disabled,
            'border-input-stroke-disabled bg-input-bg': !value && disabled,
            'bg-input-bg-disabled border-input-stroke-selected':
              value && disabled,
          },
        )}
      >
        <CheckboxCheckIcon
          className={clsx('h-full w-full text-input-bg', {
            block: value,
            hidden: !value,
          })}
        />
      </span>
      <label className="text-text text-text-input" id={labelId}>
        {label}
      </label>
    </button>
  );
};
