import React from 'react';

/* Micro ERP Badge — a small rounded-full status pill. Soft tinted background
   with a saturated same-hue label; optional leading dot. Mono font, 11px. */
const MAP = {
  gray:    { bg: 'hsl(var(--muted))',                         fg: 'hsl(var(--muted-foreground))', dot: 'hsl(var(--muted-foreground))' },
  primary: { bg: 'hsl(var(--primary-h) var(--primary-s) 57% / 0.10)', fg: 'hsl(var(--primary))', dot: 'hsl(var(--primary))' },
  green:   { bg: 'hsl(var(--badge-green-bg))',  fg: 'hsl(var(--badge-green-fg))',  dot: 'hsl(var(--success))' },
  red:     { bg: 'hsl(var(--badge-red-bg))',    fg: 'hsl(var(--badge-red-fg))',    dot: 'hsl(var(--danger))' },
  amber:   { bg: 'hsl(var(--badge-amber-bg))',  fg: 'hsl(var(--badge-amber-fg))',  dot: 'hsl(var(--warning))' },
  sky:     { bg: 'hsl(var(--badge-sky-bg))',    fg: 'hsl(var(--badge-sky-fg))',    dot: 'hsl(var(--info))' },
  violet:  { bg: 'hsl(var(--badge-violet-bg))', fg: 'hsl(var(--badge-violet-fg))', dot: 'hsl(var(--violet))' },
};

export function Badge({ variant = 'gray', children, dot = false, className = '', style = {} }) {
  const v = MAP[variant] || MAP.gray;
  return (
    <span className={className} style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '2px 8px', borderRadius: 'var(--radius-full)',
      fontSize: 11, fontWeight: 500, fontFamily: 'var(--font-mono)',
      background: v.bg, color: v.fg, ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: '50%', background: v.dot }} />}
      {children}
    </span>
  );
}
