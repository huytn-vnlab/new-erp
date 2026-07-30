import * as React from 'react';

/**
 * Custom 14px checkbox — accent fill + white tick, supports indeterminate.
 * @startingPoint section="Forms" subtitle="Accent-fill checkbox, checked/indeterminate" viewport="700x110"
 */
export interface CheckboxProps {
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export function Checkbox(props: CheckboxProps): JSX.Element;
