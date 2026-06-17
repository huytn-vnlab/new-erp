/* Inline SVG charts — sparkline, bar row, donut, line chart, area chart.
   All read --primary via CSS so they re-tint with accent tweaks. */

const Sparkline = ({ data, width = 96, height = 32, stroke = 'currentColor', filled = true }) => {
  if (!data || data.length === 0) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1 || 1);
  const pts = data.map((v, i) => [i * stepX, height - ((v - min) / range) * (height - 4) - 2]);
  const d = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const area = `${d} L${width},${height} L0,${height} Z`;
  const gradId = `sg-${Math.random().toString(36).slice(2, 7)}`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      {filled && <path d={area} fill={`url(#${gradId})`} />}
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="2.5" fill={stroke} />
    </svg>
  );
};

/* Horizontal labeled bar — text + bar + value, used for "by job title" */
const BarRow = ({ label, value, max, accent = false }) => {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-foreground w-32 shrink-0 truncate font-medium">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: accent
              ? 'linear-gradient(90deg, hsl(var(--primary-h) var(--primary-s) 67%), hsl(var(--primary-h) var(--primary-s) 47%))'
              : 'hsl(var(--primary-h) var(--primary-s) 70%)',
            opacity: accent ? 1 : 0.55,
          }}
        />
      </div>
      <span className="text-sm font-semibold tabular-nums text-foreground w-10 text-right shrink-0">{value}</span>
    </div>
  );
};

/* Donut: shows used / remaining as a progress arc */
const Donut = ({ used, total, size = 132, stroke = 12, label, sublabel }) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(used / total, 1);
  const offset = c * (1 - pct);
  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="url(#donut-grad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(.2,.7,.2,1)' }}
        />
        <defs>
          <linearGradient id="donut-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary-h) var(--primary-s) 65%)" />
            <stop offset="100%" stopColor="hsl(var(--primary-h) var(--primary-s) 45%)" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold font-heading text-foreground tabular-nums">{label}</span>
        <span className="text-[11px] text-muted-foreground mt-0.5">{sublabel}</span>
      </div>
    </div>
  );
};

/* Line chart — for rank growth. Data: [{label, value}] */
const LineChart = ({ data, width = 720, height = 220, padding = { t: 20, r: 24, b: 32, l: 36 }, yTicks = 5, invertY = true }) => {
  if (!data || data.length === 0) return null;
  const innerW = width - padding.l - padding.r;
  const innerH = height - padding.t - padding.b;
  const values = data.map(d => d.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const padV = Math.max(1, Math.round((maxV - minV) * 0.2));
  const lo = Math.max(1, minV - padV);
  const hi = maxV + padV;
  const sx = (i) => padding.l + (i / (data.length - 1 || 1)) * innerW;
  const sy = (v) => {
    const t = (v - lo) / (hi - lo || 1);
    return padding.t + (invertY ? t : 1 - t) * innerH; // invertY: rank 1 = top
  };
  const pts = data.map((d, i) => [sx(i), sy(d.value)]);
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ');
  const area = `${path} L${pts[pts.length - 1][0]},${padding.t + innerH} L${pts[0][0]},${padding.t + innerH} Z`;
  const ticks = [];
  for (let i = 0; i <= yTicks; i++) {
    const v = Math.round(lo + (i / yTicks) * (hi - lo));
    ticks.push({ v, y: sy(v) });
  }
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <defs>
        <linearGradient id="line-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary-h) var(--primary-s) 60%)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="hsl(var(--primary-h) var(--primary-s) 60%)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* gridlines */}
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={padding.l} x2={width - padding.r} y1={t.y} y2={t.y} stroke="hsl(var(--border))" strokeDasharray="2 4" />
          <text x={padding.l - 8} y={t.y + 3} textAnchor="end" fontSize="10" fill="hsl(var(--muted-foreground))" className="font-mono">{t.v}</text>
        </g>
      ))}
      {/* x labels */}
      {data.map((d, i) => (
        <text key={i} x={sx(i)} y={height - padding.b + 16} textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))">{d.label}</text>
      ))}
      {/* area */}
      <path d={area} fill="url(#line-area)" />
      {/* line */}
      <path d={path} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* dots */}
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="4" fill="hsl(var(--card))" stroke="hsl(var(--primary))" strokeWidth="2" />
        </g>
      ))}
    </svg>
  );
};

/* Stacked horizontal bar — used in evaluation by quarter */
const StackedBar = ({ segments, height = 8 }) => {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <div className="flex w-full overflow-hidden rounded-full" style={{ height }}>
      {segments.map((s, i) => (
        <div
          key={i}
          title={`${s.label}: ${s.value}`}
          style={{ width: `${(s.value / total) * 100}%`, background: s.color }}
        />
      ))}
    </div>
  );
};

Object.assign(window, { Sparkline, BarRow, Donut, LineChart, StackedBar });
