import React from 'react';

/* Micro ERP Checkbox — 14px square, 3px radius; accent fill + white tick
   when checked; supports indeterminate. Optional label. */
export function Checkbox({ checked = false, indeterminate = false, onChange, label, disabled = false, className = '', style = {} }) {
  const ref = React.useRef(null);
  React.useEffect(() => { if (ref.current) ref.current.indeterminate = indeterminate; }, [indeterminate]);
  const on = checked || indeterminate;
  return (
    <label className={className} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, ...style }}>
      <span style={{ position: 'relative', width: 14, height: 14, flexShrink: 0 }}>
        <input ref={ref} type="checkbox" checked={checked} disabled={disabled} onChange={onChange}
          style={{ position: 'absolute', opacity: 0, width: 14, height: 14, margin: 0, cursor: 'inherit' }} />
        <span style={{
          position: 'absolute', inset: 0, borderRadius: 'var(--radius-xs)',
          border: '1.5px solid ' + (on ? 'hsl(var(--primary))' : 'hsl(var(--border))'),
          background: on ? 'hsl(var(--primary))' : 'hsl(var(--card))',
          transition: 'background .12s, border-color .12s',
        }}>
          {checked && !indeterminate && (
            <span style={{ position: 'absolute', left: 4, top: 1, width: 4, height: 8, border: '2px solid #fff', borderTop: 'none', borderLeft: 'none', transform: 'rotate(45deg)' }} />
          )}
          {indeterminate && (
            <span style={{ position: 'absolute', left: 2.5, top: 5.5, width: 7, height: 2, background: '#fff', borderRadius: 1 }} />
          )}
        </span>
      </span>
      {label && <span style={{ fontSize: 13, fontFamily: 'var(--font-sans)', color: 'hsl(var(--foreground))' }}>{label}</span>}
    </label>
  );
}
