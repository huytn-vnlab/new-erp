import React from 'react';

/* Micro ERP Card — the standard surface. 14px radius, hairline border,
   whisper shadow. `interactive` adds the accent hover-lift. Optional
   `tint` paints the signature top-right radial accent glow (stat cards). */
export function Card({ interactive = false, tint = false, padding = 20, children, className = '', style = {}, onClick }) {
  const [hover, setHover] = React.useState(false);
  const lift = interactive && hover;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      className={className}
      style={{
        background: 'hsl(var(--card))',
        border: '1px solid ' + (lift ? 'hsl(var(--primary-h) var(--primary-s) 57% / 0.45)' : 'hsl(var(--border))'),
        borderRadius: 'var(--radius-card)',
        boxShadow: lift ? '0 6px 18px -8px hsl(var(--primary-h) var(--primary-s) 50% / 0.22)' : '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        backgroundImage: tint ? 'radial-gradient(ellipse 80% 60% at 100% 0%, hsl(var(--primary-h) var(--primary-s) 57% / 0.09), transparent 70%)' : undefined,
        transition: 'border-color .18s ease, box-shadow .18s ease',
        padding, ...style,
      }}>
      {children}
    </div>
  );
}
