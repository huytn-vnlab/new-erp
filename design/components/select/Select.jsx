import React from 'react';

/* Micro ERP Select — custom trigger + floating menu (replaces native <select>).
   Focus/open = accent border + faint ring; selected row shows a check. */
export function Select({ value, options = [], onChange, width = 180, placeholder = 'Chọn…', className = '', style = {} }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  const selected = options.find(o => String(o.value) === String(value));

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const pick = (v) => { onChange && onChange({ target: { value: v } }); setOpen(false); };

  return (
    <div ref={ref} className={className} style={{ position: 'relative', width, ...style }}>
      <button type="button" onClick={() => setOpen(o => !o)} style={{
        width: '100%', height: 36, padding: '0 30px 0 12px', textAlign: 'left', cursor: 'pointer',
        borderRadius: 'var(--radius-sm)', background: 'hsl(var(--muted) / 0.3)', fontSize: 13,
        fontFamily: 'var(--font-sans)', color: selected ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground) / 0.7)',
        border: '1px solid ' + (open ? 'hsl(var(--primary) / 0.6)' : 'hsl(var(--border))'),
        boxShadow: open ? '0 0 0 2px hsl(var(--primary) / 0.15)' : 'none',
        outline: 'none', transition: 'border-color .16s',
      }}>
        {selected ? selected.label : placeholder}
        <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%) rotate(' + (open ? 180 : 0) + 'deg)', transition: 'transform .2s', color: 'hsl(var(--muted-foreground))', fontSize: 10 }}>▾</span>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, width: '100%', zIndex: 50,
          borderRadius: 'var(--radius-lg)', border: '1px solid hsl(var(--border))',
          background: 'hsl(var(--popover))', boxShadow: 'var(--shadow-popover)',
          overflow: 'hidden', animation: 'selectIn .14s ease-out',
        }}>
          <div style={{ maxHeight: 240, overflowY: 'auto', padding: '4px 0' }} className="scrollbar-thin">
            {options.map((o, i) => {
              const isSel = String(o.value) === String(value);
              return (
                <button key={i} type="button" onClick={() => pick(o.value)} style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px 8px 12px',
                  textAlign: 'left', fontSize: 13, cursor: 'pointer', background: 'transparent', border: 0,
                  fontFamily: 'var(--font-sans)', color: isSel ? 'hsl(var(--primary))' : 'hsl(var(--foreground) / 0.85)',
                  fontWeight: isSel ? 500 : 400,
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'hsl(var(--primary) / 0.1)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <span style={{ flex: 1 }}>{o.label}</span>
                  {isSel && <span style={{ color: 'hsl(var(--primary))' }}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
