import {
  AbstractActionComponent,
  Action,
  type BaseBlinkLayoutProps,
  BlinkContainer,
  type BlinkContainerProps,
} from '@dialectlabs/blinks-core';
import { type ComponentType, useCallback } from 'react';
import { useIsolatedLayoutPropNormalizer } from './internal/hooks/useIsolatedLayoutPropNormalizer.ts';
import { IsolatedBlinkLayout } from './layouts/IsolatedBlinkLayout.tsx';
import type { StylePreset } from './types.ts';

export interface CompactBlinkProps
  extends Omit<BlinkContainerProps, 'Layout' | 'component' | 'securityLevel'> {
  _Layout?: ComponentType<
    BaseBlinkLayoutProps & {
      stylePreset?: StylePreset;
    }
  >;
  stylePreset?: StylePreset;
  component: (currentAction: Action) => AbstractActionComponent;
}

export const CompactBlink = ({
  _Layout: Layout = NormalizedBaseBlinkLayout,
  stylePreset,
  ...props
}: CompactBlinkProps) => {
  const LayoutWithPreset = useCallback(
    (props: BaseBlinkLayoutProps) => (
      <Layout {...props} stylePreset={stylePreset} />
    ),
    [Layout, stylePreset],
  );

  return (
    <BlinkContainer {...props} securityLevel="all" Layout={LayoutWithPreset} />
  );
};

export const NormalizedBaseBlinkLayout = (
  props: BaseBlinkLayoutProps & {
    stylePreset?: StylePreset;
  },
) => {
  const normalizedProps = useIsolatedLayoutPropNormalizer(props);

  if (!normalizedProps) {
    console.warn(
      '[@dialectlabs/blinks] No `component` provided for CompactBlink',
    );
    return null;
  }

  return <IsolatedBlinkLayout {...normalizedProps} />;
};
