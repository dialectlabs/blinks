import {
  type BaseBlinkLayoutProps,
  BlinkContainer,
} from '@dialectlabs/blinks-core';
import { useCallback } from 'react';
import type { BlinkProps } from './Blink.tsx';
import { useBaseLayoutPropNormalizer } from './hooks';
import { ActionsOnlyBlinkLayout } from './layouts/ActionsOnlyBlinkLayout.tsx';
import type { StylePreset } from './types.ts';

export const ActionsOnlyBlink = ({
  _Layout: Layout = NormalizedActionsOnlyBlinkLayout,
  stylePreset,
  ...props
}: BlinkProps) => {
  const LayoutWithPreset = useCallback(
    (props: BaseBlinkLayoutProps) => (
      <Layout {...props} stylePreset={stylePreset} />
    ),
    [Layout, stylePreset],
  );

  return (
    <BlinkContainer
      {...props}
      selector={undefined} // explicitly disabled, use `Miniblink` instead
      Layout={LayoutWithPreset}
    />
  );
};

export const NormalizedActionsOnlyBlinkLayout = (
  props: BaseBlinkLayoutProps & { stylePreset?: StylePreset },
) => {
  const normalizedProps = useBaseLayoutPropNormalizer(props);

  return <ActionsOnlyBlinkLayout {...normalizedProps} />;
};
