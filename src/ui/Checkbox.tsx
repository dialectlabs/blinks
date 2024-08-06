import clsx from 'clsx';
import { useId } from 'react';
import CheckboxCheckIcon from './icons/CheckboxCheckIcon.tsx';

interface Props {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  name?: string;
  disabled?: boolean;
  inputValue: string;
}

export const Checkbox = ({
  label,
  value,
  onChange,
  name,
  disabled,
  inputValue,
}: Props) => {
  const id = useId();
  const labelId = `${id}_label`;

  return (
    <button
      className={clsx('flex h-full gap-2.5', {
        'cursor-pointer': !disabled,
        'cursor-not-allowed': disabled,
      })}
      onClick={() => !disabled && onChange(!value)}
    >
      <div className="flex h-full items-center">
        <input
          type="checkbox"
          name={name}
          className="hidden"
          defaultValue={inputValue}
        />
        <span
          role="checkbox"
          id={id}
          aria-labelledby={labelId}
          className={clsx(
            'mt-0.5 flex aspect-square h-[16px] items-center justify-center rounded-lg border transition-colors motion-reduce:transition-none',
            {
              'border-input-stroke bg-input-bg': !value && !disabled,
              'bg-input-bg-selected border-input-stroke-selected':
                value && !disabled,
              'border-input-stroke-disabled bg-input-bg': !value && disabled,
              'bg-input-bg-disabled border-input-stroke-disabled':
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
      </div>
      <label className="text-text text-text-input" id={labelId}>
        {label}
      </label>
    </button>
  );
};
