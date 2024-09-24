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

export interface MiniBlinkProps
  extends Omit<BlinkContainerProps, 'Layout' | 'selector' | 'securityLevel'> {
  _Layout?: ComponentType<
    BaseBlinkLayoutProps & {
      stylePreset?: StylePreset;
    }
  >;
  stylePreset?: StylePreset;
  selector: (currentAction: Action) => AbstractActionComponent | null;
}

export const MiniBlink = ({
  _Layout: Layout = NormalizedIsolatedBlinkLayout,
  stylePreset,
  ...props
}: MiniBlinkProps) => {
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

export const NormalizedIsolatedBlinkLayout = (
  props: BaseBlinkLayoutProps & {
    stylePreset?: StylePreset;
  },
) => {
  const normalizedProps = useIsolatedLayoutPropNormalizer(props);

  if (!normalizedProps) {
    console.warn(
      '[@dialectlabs/blinks] No `selector` prop provided for MiniBlink',
    );
    return null;
  }

  return <IsolatedBlinkLayout {...normalizedProps} />;
};
