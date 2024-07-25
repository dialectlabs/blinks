import type { ButtonProps } from '../ActionLayout.tsx';
import { Button } from '../Button.tsx';
import { CheckIcon, SpinnerDots } from '../icons';

export const ActionButton = ({
  text,
  loading,
  disabled,
  variant,
  onClick,
}: ButtonProps) => {
  const ButtonContent = () => {
    if (loading)
      return (
        <span className="flex flex-row items-center justify-center gap-2 text-nowrap">
          {text} <SpinnerDots />
        </span>
      );
    if (variant === 'success')
      return (
        <span className="flex flex-row items-center justify-center gap-2 text-nowrap">
          {text}
          <CheckIcon />
        </span>
      );
    return text;
  };

  return (
    <Button onClick={() => onClick()} disabled={disabled} variant={variant}>
      <ButtonContent />
    </Button>
  );
};
