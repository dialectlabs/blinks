import clsx from 'clsx';
import { ActionContent, type InnerLayoutProps } from './BaseBlinkLayout.tsx';
import { themeClassMap } from './presets.ts';

export const ActionsOnlyBlinkLayout = ({
  stylePreset = 'default',
  id,
  success,
  error,
  inputs,
  buttons,
  form,
}: InnerLayoutProps) => {
  return (
    <div className={clsx('blink w-full', themeClassMap[stylePreset])}>
      <ActionContent key={id} form={form} inputs={inputs} buttons={buttons} />
      {success && (
        <span className="text-subtext text-text-success mt-1.5 flex justify-center">
          {success}
        </span>
      )}
      {error && !success && (
        <span className="text-subtext text-text-error mt-1.5 flex justify-center">
          {error}
        </span>
      )}
    </div>
  );
};
