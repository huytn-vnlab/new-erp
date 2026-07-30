import * as React from 'react';

/**
 * Initials avatar on a deterministic per-name gradient (rounded-square).
 * @startingPoint section="Core" subtitle="Deterministic initials avatar" viewport="700x110"
 */
export interface AvatarProps {
  /** Full name — initials + gradient hue are derived from it */
  name: string;
  /** Pixel size (width = height). Default 32 */
  size?: number;
  /** Override the auto hue (0–360) */
  hue?: number;
  className?: string;
  style?: React.CSSProperties;
}

export function Avatar(props: AvatarProps): JSX.Element;
