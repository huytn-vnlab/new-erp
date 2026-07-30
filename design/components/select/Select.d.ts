import * as React from 'react';

/**
 * Custom dropdown select — replaces the native control with a styled trigger
 * and floating menu; open state shows accent border + faint ring.
 * @startingPoint section="Forms" subtitle="Custom select with floating menu" viewport="700x120"
 */
export interface SelectOption { value: string | number; label: string; }
export interface SelectProps {
  value?: string | number;
  options: SelectOption[];
  onChange?: (e: { target: { value: string | number } }) => void;
  width?: number | string;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Select(props: SelectProps): JSX.Element;
