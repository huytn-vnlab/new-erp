import React from 'react';

/* Micro ERP text input — pill field with optional leading icon.
   Rests on muted/30 bg + border; border → accent on focus-within (no ring). */
export function Input({ icon, placeholder, value, onChange, type = 'text', width = 220, className = '', style = {} }) {
  const [focus, setFocus] = React.useState(false);
  return (
    <div className={className} style={{
      display: 'flex', alignItems: 'center', gap: 8, height: 36, padding: '0 12px',
      borderRadius: 'var(--radius-sm)', background: 'hsl(var(--muted) / 0.3)',
      border: '1px solid ' + (focus ? 'hsl(var(--primary) / 0.6)' : 'hsl(var(--border))'),
      transition: 'border-color .16s ease', width, ...style,
    }}>
      {icon && <span style={{ color: 'hsl(var(--muted-foreground))', display: 'flex' }}>{icon}</span>}
      <input
        type={type} placeholder={placeholder} value={value || ''} onChange={onChange}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{
          flex: 1, minWidth: 0, background: 'transparent', border: 0, outline: 'none',
          fontSize: 13, fontFamily: 'var(--font-sans)', color: 'hsl(var(--foreground))',
        }} />
    </div>
  );
}
