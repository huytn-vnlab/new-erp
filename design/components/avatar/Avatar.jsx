import React from 'react';

/* Micro ERP Avatar — initials on a deterministic 135° hue gradient derived
   from the name, so the same person always gets the same color. Rounded-lg. */
export function Avatar({ name, size = 32, hue, className = '', style = {} }) {
  const initials = (name || '?').split(' ').filter(Boolean).map(p => p[0]).slice(-2).join('').toUpperCase();
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  const hh = hue ?? h;
  return (
    <span className={className} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, fontSize: size * 0.36, flexShrink: 0,
      fontFamily: 'var(--font-heading)', fontWeight: 600, color: '#fff',
      borderRadius: 'var(--radius-md)',
      background: `linear-gradient(135deg, hsl(${hh} 70% 62%), hsl(${(hh + 30) % 360} 65% 42%))`,
      ...style,
    }}>
      {initials}
    </span>
  );
}
