import {
  type BaseBlinkLayoutProps,
  BlinkContainer,
  type BlinkContainerProps,
} from '@dialectlabs/blinks-core';
import type { ComponentType } from 'react';
import { BaseBlinkLayout } from './BaseBlinkLayout.tsx';
import { useLayoutPropNormalizer } from './internal/hooks/useLayoutPropNormalizer.tsx';

export interface BlinkProps extends Omit<BlinkContainerProps, 'Layout'> {
  _Layout?: ComponentType<BaseBlinkLayoutProps>;
}

export const Blink = ({
  _Layout: Layout = NormalizedBaseBlinkLayout,
  ...props
}: BlinkProps) => {
  return <BlinkContainer {...props} Layout={Layout} />;
};

export const NormalizedBaseBlinkLayout = (props: BaseBlinkLayoutProps) => {
  const normalizedProps = useLayoutPropNormalizer(props);

  return <BaseBlinkLayout {...normalizedProps} />;
};
