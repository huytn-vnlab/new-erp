import * as React from 'react';

/**
 * Small status pill — soft tinted background with saturated same-hue label.
 * @startingPoint section="Core" subtitle="Status pills in 7 hues, optional dot" viewport="700x110"
 */
export interface BadgeProps {
  variant?: 'gray' | 'primary' | 'green' | 'red' | 'amber' | 'sky' | 'violet';
  /** Show a leading solid dot */
  dot?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Badge(props: BadgeProps): JSX.Element;
