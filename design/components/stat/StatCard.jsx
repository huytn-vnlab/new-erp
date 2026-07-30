import React from 'react';

/* Micro ERP StatCard — the KPI block. Big heading number, uppercase label,
   optional trend chip and accent icon tile; carries the top-right accent glow. */
const ACCENTS = {
  primary: 'hsl(var(--primary))',
  green:   'hsl(var(--success))',
  amber:   'hsl(var(--warning))',
  red:     'hsl(var(--danger))',
  violet:  'hsl(var(--violet))',
  sky:     'hsl(var(--info))',
  gray:    'hsl(220 14% 55%)',
};

export function StatCard({ label, value, sublabel, trend, icon, accent = 'primary', className = '', style = {} }) {
  const color = ACCENTS[accent] || ACCENTS.primary;
  const up = trend && trend.dir === 'up';
  return (
    <div className={className} style={{
      background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))',
      borderRadius: 'var(--radius-card)', boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.03)', padding: 20,
      backgroundImage: 'radial-gradient(ellipse 80% 60% at 100% 0%, ' + color.replace(')', ' / 0.09)') + ', transparent 70%)',
      ...style,
    }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <span className="eyebrow">{label}</span>
          <div style={{ marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <span style={{ fontSize: 34, fontWeight: 700, fontFamily: 'var(--font-heading)', color: 'hsl(var(--foreground))', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
            {trend && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: up ? 'hsl(var(--success))' : 'hsl(var(--danger))' }}>
                {up ? '↑' : '↓'} {trend.value}
              </span>
            )}
          </div>
          {sublabel && <p style={{ fontSize: 12, color: 'hsl(var(--muted-foreground))', marginTop: 4 }}>{sublabel}</p>}
        </div>
        {icon && (
          <div style={{ height: 40, width: 40, borderRadius: 'var(--radius-md)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60% / 0.16), hsl(var(--primary-h) var(--primary-s) 40% / 0.10))', color: 'hsl(var(--primary))' }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
