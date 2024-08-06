import clsx from 'clsx';
import { useId } from 'react';

interface Props {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  name?: string;
  disabled?: boolean;
  inputValue: string;
}

export const Radio = ({
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
          type="radio"
          name={name}
          className="hidden"
          defaultValue={inputValue}
        />
        <div
          role="radio"
          id={id}
          aria-labelledby={labelId}
          className={clsx(
            'mt-0.5 flex aspect-square h-[16px] items-center justify-center rounded-full border transition-colors motion-reduce:transition-none',
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
          <div
            className={clsx('aspect-square h-[8px] rounded-full bg-input-bg', {
              invisible: !value,
            })}
          />
        </div>
      </div>
      <label className="text-text text-text-input" id={labelId}>
        {label}
      </label>
    </button>
  );
};
