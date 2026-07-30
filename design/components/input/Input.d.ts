import * as React from 'react';

/**
 * Single-line text field with optional leading icon; focus is shown by
 * border-color, never an outline ring.
 * @startingPoint section="Forms" subtitle="Icon text field, focus = accent border" viewport="700x110"
 */
export interface InputProps {
  /** Optional leading icon node */
  icon?: React.ReactNode;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  /** Pixel width. Default 220 */
  width?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export function Input(props: InputProps): JSX.Element;
