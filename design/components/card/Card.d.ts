import * as React from 'react';

/**
 * Standard content surface — 14px radius, hairline border, whisper shadow.
 * @startingPoint section="Core" subtitle="Card surface — rest, interactive, tinted" viewport="700x180"
 */
export interface CardProps {
  /** Adds accent hover-lift (border + shadow) */
  interactive?: boolean;
  /** Paints the signature top-right radial accent glow */
  tint?: boolean;
  /** Inner padding in px. Default 20 */
  padding?: number;
  children?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export function Card(props: CardProps): JSX.Element;
