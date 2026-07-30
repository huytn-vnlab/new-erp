import * as React from 'react';

/**
 * Custom Lucide-style icon (24×24, stroke 1.7, round caps) rendered by name;
 * inherits currentColor. Full glyph map lives in assets/icons.jsx.
 * @startingPoint section="Core" subtitle="Custom stroke-1.7 icon set" viewport="700x150"
 */
export interface IconProps extends React.SVGProps<SVGSVGElement> {
  /** Glyph name, e.g. "Users", "Calendar", "TrendUp" */
  name: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Icon(props: IconProps): JSX.Element;
export const ICON_NAMES: string[];
