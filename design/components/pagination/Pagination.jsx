import React from 'react';

/* Micro ERP Pagination — range summary on the left, page controls on the right.
   Active page uses the accent gradient; sits on a top border (table footer). */
export function Pagination({ page, total, perPage = 10, onChange, className = '', style = {} }) {
  const pages = Math.max(1, Math.ceil(total / perPage));
  const from = total === 0 ? 0 : (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  const go = (p) => { if (p >= 1 && p <= pages && onChange) onChange(p); };
  const nums = Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1);

  const ctrl = { height: 28, padding: '0 8px', borderRadius: 'var(--radius-sm)', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4, border: 0, background: 'transparent', cursor: 'pointer', color: 'hsl(var(--foreground))' };

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderTop: '1px solid hsl(var(--border) / 0.7)', fontSize: 12, color: 'hsl(var(--muted-foreground))', fontFamily: 'var(--font-sans)', ...style }}>
      <span>Hiển thị <b style={{ color: 'hsl(var(--foreground))', fontVariantNumeric: 'tabular-nums' }}>{from}-{to}</b> trên <b style={{ color: 'hsl(var(--foreground))', fontVariantNumeric: 'tabular-nums' }}>{total}</b></span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <button style={{ ...ctrl, opacity: page <= 1 ? 0.4 : 1, cursor: page <= 1 ? 'not-allowed' : 'pointer' }} disabled={page <= 1} onClick={() => go(page - 1)}>‹ Trước</button>
        {nums.map(p => (
          <button key={p} onClick={() => go(p)} style={{
            height: 28, minWidth: 28, padding: '0 8px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 500,
            fontVariantNumeric: 'tabular-nums', border: 0, cursor: 'pointer',
            background: p === page ? 'var(--grad-primary)' : 'transparent',
            color: p === page ? '#fff' : 'hsl(var(--foreground))',
            boxShadow: p === page ? 'var(--shadow-card)' : 'none',
          }}>{p}</button>
        ))}
        {pages > 5 && <span style={{ padding: '0 4px' }}>…</span>}
        <button style={{ ...ctrl, opacity: page >= pages ? 0.4 : 1, cursor: page >= pages ? 'not-allowed' : 'pointer' }} disabled={page >= pages} onClick={() => go(page + 1)}>Sau ›</button>
      </div>
    </div>
  );
}
