import {
  type BaseBlinkLayoutProps,
  BlinkContainer,
  type BlinkContainerProps,
} from '@dialectlabs/blinks-core';
import { type ComponentType, useCallback } from 'react';
import { BaseBlinkLayout } from './BaseBlinkLayout.tsx';
import { useLayoutPropNormalizer } from './internal/hooks/useLayoutPropNormalizer.tsx';
import type { StyleTheme } from './types.ts';

export interface BlinkProps extends Omit<BlinkContainerProps, 'Layout'> {
  _Layout?: ComponentType<BaseBlinkLayoutProps & { theme?: StyleTheme }>;
  theme?: StyleTheme;
}

export const Blink = ({
  _Layout: Layout = NormalizedBaseBlinkLayout,
  theme,
  ...props
}: BlinkProps) => {
  const LayoutWithTheme = useCallback(
    (props: BaseBlinkLayoutProps) => <Layout {...props} theme={theme} />,
    [Layout, theme],
  );

  return <BlinkContainer {...props} Layout={LayoutWithTheme} />;
};

export const NormalizedBaseBlinkLayout = (
  props: BaseBlinkLayoutProps & { theme?: StyleTheme },
) => {
  const normalizedProps = useLayoutPropNormalizer(props);

  return <BaseBlinkLayout {...normalizedProps} />;
};
