import {
  type BaseBlinkLayoutProps,
  BlinkContainer,
  type BlinkContainerProps,
} from '@dialectlabs/blinks-core';
import { type ComponentType, useCallback } from 'react';
import { useBaseLayoutPropNormalizer } from './hooks';
import { BaseBlinkLayout } from './layouts';
import type { StylePreset } from './types.ts';

export interface BlinkProps
  extends Omit<BlinkContainerProps, 'Layout' | 'selector'> {
  _Layout?: ComponentType<BaseBlinkLayoutProps & { stylePreset?: StylePreset }>;
  stylePreset?: StylePreset;
}

export const Blink = ({
  _Layout: Layout = NormalizedBaseBlinkLayout,
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

export const NormalizedBaseBlinkLayout = (
  props: BaseBlinkLayoutProps & { stylePreset?: StylePreset },
) => {
  const normalizedProps = useBaseLayoutPropNormalizer(props);

  return <BaseBlinkLayout {...normalizedProps} />;
};
