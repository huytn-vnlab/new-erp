import * as React from 'react';

/**
 * Primary action button for Micro ERP. Primary variant uses the signature
 * 135° accent gradient; use outline/ghost for secondary actions.
 * @startingPoint section="Core" subtitle="Gradient primary + outline/ghost/danger/success" viewport="700x120"
 */
export interface ButtonProps {
  variant?: 'primary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md';
  /** Optional leading node, e.g. an <Icon.Plus/> element */
  icon?: React.ReactNode;
  children?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: React.CSSProperties;
}

export function Button(props: ButtonProps): JSX.Element;
