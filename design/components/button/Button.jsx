import React from 'react';

/* Micro ERP Button.
   Primary = 135° accent gradient + scale-on-hover; outline/ghost are quiet;
   danger/success are solid semantic fills. Sizes xs / sm / md. */
export function Button({
  variant = 'primary',
  size = 'md',
  icon,            // optional leading node (e.g. <Icon.Plus/>)
  children,
  onClick,
  disabled = false,
  type = 'button',
  className = '',
  style = {},
}) {
  const sizes = {
    xs: { height: 28, padding: '0 8px',   font: 11.5 },
    sm: { height: 32, padding: '0 10px',  font: 12.5 },
    md: { height: 36, padding: '0 14px',  font: 13 },
  };
  const s = sizes[size] || sizes.md;

  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
    height: s.height, padding: s.padding, fontSize: s.font,
    fontFamily: 'var(--font-sans)', fontWeight: 600, whiteSpace: 'nowrap',
    borderRadius: 'var(--radius-sm)', cursor: disabled ? 'not-allowed' : 'pointer',
    border: '1px solid transparent', transition: 'all .16s ease',
    opacity: disabled ? 0.5 : 1, ...style,
  };

  const variants = {
    primary: { background: 'var(--grad-primary)', color: '#fff', boxShadow: 'var(--shadow-card)' },
    outline: { background: 'hsl(var(--card))', color: 'hsl(var(--foreground))', borderColor: 'hsl(var(--border))' },
    ghost:   { background: 'transparent', color: 'hsl(var(--foreground) / 0.8)' },
    danger:  { background: 'hsl(var(--danger))', color: '#fff' },
    success: { background: 'hsl(var(--success))', color: '#fff' },
  };

  const [hover, setHover] = React.useState(false);
  const hoverStyle = !disabled && hover ? (
    variant === 'primary' ? { transform: 'scale(1.02)' } :
    variant === 'outline' ? { borderColor: 'hsl(var(--primary) / 0.6)', background: 'hsl(var(--muted) / 0.4)' } :
    variant === 'ghost'   ? { background: 'hsl(var(--muted))', color: 'hsl(var(--foreground))' } :
    { filter: 'brightness(0.94)' }
  ) : {};

  return (
    <button
      type={type} onClick={disabled ? undefined : onClick} disabled={disabled}
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      onMouseDown={(e) => { if (!disabled && variant === 'primary') e.currentTarget.style.transform = 'scale(0.98)'; }}
      onMouseUp={(e) => { if (!disabled && variant === 'primary') e.currentTarget.style.transform = 'scale(1.02)'; }}
      className={className}
      style={{ ...base, ...variants[variant], ...hoverStyle }}>
      {icon}
      {children}
    </button>
  );
}
