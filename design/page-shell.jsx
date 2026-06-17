/* Shared building blocks for HRM pages */

const PageHeader = ({ eyebrow, title, description, actions, children }) =>
<div className="rise" style={{ animationDelay: '0ms' }}>
    <div className="flex items-start justify-between gap-6 flex-wrap">
      <div className="min-w-0 flex-1">
        {eyebrow &&
      <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-muted-foreground mb-1.5">{eyebrow}</p>
      }
        {title &&
      <h1 className="text-[26px] font-bold font-heading text-foreground leading-tight">{title}</h1>
      }
        {description &&
      <p className="text-[13px] text-muted-foreground mt-1.5 max-w-2xl">{description}</p>
      }
      </div>
      {actions && <div className="flex items-center gap-2 flex-nowrap shrink-0">{actions}</div>}
    </div>
    {children}
  </div>;


const Btn = ({ variant = 'primary', size = 'md', icon, children, onClick, className = '' }) => {
  const Ic = icon && Icon[icon];
  const sizeCls = size === 'sm' ?
  'h-8 px-2.5 text-[12.5px]' :
  size === 'xs' ? 'h-7 px-2 text-[11.5px]' : 'h-9 px-3.5 text-[13px]';
  let cls = 'inline-flex items-center gap-1.5 rounded-md font-semibold transition-all whitespace-nowrap ';
  if (variant === 'primary') {
    cls += 'text-white shadow-sm hover:scale-[1.02] active:scale-[0.98] ';
  } else if (variant === 'outline') {
    cls += 'border border-border bg-card text-foreground hover:border-primary/60 hover:bg-muted/40 ';
  } else if (variant === 'ghost') {
    cls += 'text-foreground/80 hover:bg-muted hover:text-foreground ';
  } else if (variant === 'danger') {
    cls += 'bg-red-500 text-white hover:bg-red-600 ';
  } else if (variant === 'success') {
    cls += 'bg-emerald-500 text-white hover:bg-emerald-600 ';
  }
  const style = variant === 'primary' ?
  { background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 42%))' } :
  {};
  return (
    <button onClick={onClick} className={cls + sizeCls + ' ' + className} style={style}>
      {Ic && <Ic size={size === 'xs' ? 11 : size === 'sm' ? 13 : 14} />}
      {children}
    </button>);

};

const Badge = ({ variant = 'gray', children, dot = false, className = '' }) => {
  const map = {
    gray: { bg: 'hsl(var(--muted))', fg: 'hsl(var(--muted-foreground))', dot: 'hsl(var(--muted-foreground))' },
    primary: { bg: 'hsl(var(--primary-h) var(--primary-s) 57% / 0.10)', fg: 'hsl(var(--primary))', dot: 'hsl(var(--primary))' },
    green: { bg: 'hsl(160 60% 90%)', fg: 'hsl(160 60% 30%)', dot: 'hsl(160 60% 45%)' },
    red: { bg: 'hsl(0 80% 95%)', fg: 'hsl(0 70% 45%)', dot: 'hsl(0 70% 55%)' },
    amber: { bg: 'hsl(38 95% 92%)', fg: 'hsl(35 90% 38%)', dot: 'hsl(38 92% 50%)' },
    sky: { bg: 'hsl(203 89% 92%)', fg: 'hsl(203 89% 35%)', dot: 'hsl(203 89% 50%)' },
    violet: { bg: 'hsl(270 70% 95%)', fg: 'hsl(265 60% 45%)', dot: 'hsl(265 60% 55%)' }
  };
  // Dark mode tweak using oklch fallback handled by tailwind dark vars — we keep light HSL but reduce sat in dark
  const v = map[variant] || map.gray;
  return (
    <span
      className={'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium font-mono ' + className}
      style={{ background: v.bg, color: v.fg }}>
      
      {dot && <span className="h-1.5 w-1.5 rounded-full" style={{ background: v.dot }} />}
      {children}
    </span>);

};

const Avatar = ({ name, size = 32, className = '', hue }) => {
  const initials = (name || '?').split(' ').filter(Boolean).map((p) => p[0]).slice(-2).join('').toUpperCase();
  // deterministic hue from name
  let h = 0;for (let i = 0; i < (name || '').length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
  const hh = hue ?? h;
  return (
    <span
      className={'inline-flex items-center justify-center font-semibold text-white shrink-0 rounded-lg font-heading ' + className}
      style={{
        width: size, height: size,
        fontSize: size * 0.36,
        background: `linear-gradient(135deg, hsl(${hh} 70% 62%), hsl(${(hh + 30) % 360} 65% 42%))`
      }}>
      
      {initials}
    </span>);

};

const FilterBar = ({ children }) =>
<div className="flex flex-wrap items-center gap-2 p-3 rounded-xl border border-border/70 bg-card/60 backdrop-blur">
    {children}
  </div>;


const FieldInput = ({ icon, placeholder, value, onChange, width = 220 }) => {
  const Ic = icon && Icon[icon];
  return (
    <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-muted/30 focus-within:border-primary/60 transition-colors" style={{ width }}>
      {Ic && <Ic size={14} className="text-muted-foreground" />}
      <input
        type="text"
        placeholder={placeholder}
        value={value || ''}
        onChange={onChange}
        className="bg-transparent text-[13px] flex-1 appearance-none border-0 outline-none placeholder:text-muted-foreground/70 text-foreground min-w-0"
        style={{ outline: 'none', boxShadow: 'none', WebkitAppearance: 'none', WebkitTapHighlightColor: 'transparent' }} />
    </div>);

};

/* Custom select — styled trigger + floating menu (replaces native <select>) */
const Select = ({ value, options, onChange, width = 160, placeholder = 'Chọn…' }) => {
  const [open, setOpen] = React.useState(false);
  const [highlight, setHighlight] = React.useState(-1);
  const [pos, setPos] = React.useState({ top: 0, left: 0, w: 0 });
  const ref = React.useRef(null);
  const triggerRef = React.useRef(null);

  const allOpts = placeholder != null ? [{ value: '', label: placeholder }, ...options] : options;
  const selected = options.find((o) => String(o.value) === String(value));
  const label = selected ? selected.label : placeholder;

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  const pick = (v) => { onChange({ target: { value: v } }); setOpen(false); setHighlight(-1); };

  const openDropdown = () => {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + window.scrollY + 4, left: r.left + window.scrollX, w: r.width });
    }
    setOpen((o) => !o);
  };

  const onKey = (e) => {
    if (e.key === 'Escape') { setOpen(false); return; }
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!open) { openDropdown(); return; }
      setHighlight((h) => {
        const n = allOpts.length;
        return e.key === 'ArrowDown' ? (h + 1) % n : (h - 1 + n) % n;
      });
    } else if (e.key === 'Enter' && open && highlight >= 0) {
      e.preventDefault();
      pick(allOpts[highlight].value);
    }
  };

  return (
    <div className="relative" style={{ width }} ref={ref}>
      <button
        ref={triggerRef}
        type="button"
        onClick={openDropdown}
        onKeyDown={onKey}
        className={'w-full h-9 pl-3 pr-8 rounded-md border bg-muted/30 text-[13px] text-left outline-none cursor-pointer transition-colors flex items-center ' +
          (open ? 'border-primary/60 ring-2 ring-primary/15' : 'border-border hover:border-primary/40')}>
        <span className={'truncate ' + (selected ? 'text-foreground' : 'text-muted-foreground/70')}>{label}</span>
      </button>
      <Icon.ChevronDown size={12} className={'absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none transition-transform duration-200 ' + (open ? 'rotate-180' : '')} />

      {open && ReactDOM.createPortal(
        <div
          style={{ position: 'fixed', top: pos.top - window.scrollY, left: pos.left, width: Math.max(pos.w, width), zIndex: 9999, animation: 'selectIn 0.14s ease-out' }}
          className="rounded-xl border border-border bg-popover shadow-popover overflow-hidden origin-top">
          <div className="max-h-60 overflow-y-auto scrollbar-thin py-1">
            {allOpts.map((o, i) => {
              const isSel = String(o.value) === String(value || '');
              const isHi = i === highlight;
              return (
                <button
                  key={o.value + '-' + i}
                  type="button"
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => pick(o.value)}
                  className={'w-full flex items-center gap-2 pl-3 pr-2.5 py-2 text-[13px] text-left transition-colors ' +
                    (isHi ? 'bg-primary/10' : '') + ' ' +
                    (isSel ? 'text-primary font-medium' : 'text-foreground/85')}>
                  <span className="flex-1 truncate">{o.label}</span>
                  {isSel && <Icon.Check size={13} className="text-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </div>);
};


const Pagination = ({ page, total, perPage, onChange }) => {
  const pages = Math.ceil(total / perPage);
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);
  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-border/70 text-[12px] text-muted-foreground">
      <span>Hiển thị <span className="font-semibold text-foreground tabular-nums">{from}-{to}</span> trên <span className="font-semibold text-foreground tabular-nums">{total}</span></span>
      <div className="flex items-center gap-1">
        <button disabled={page <= 1} onClick={() => onChange(page - 1)} className="h-7 px-2 rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1">
          <Icon.ChevronRight size={11} className="rotate-180" /> Trước
        </button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => i + 1).map((p) =>
        <button
          key={p}
          onClick={() => onChange(p)}
          className={'h-7 min-w-7 px-2 rounded-md font-medium tabular-nums ' + (
          p === page ? 'text-white shadow-sm' : 'hover:bg-muted text-foreground')}
          style={p === page ? { background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 42%))' } : {}}>
          
            {p}
          </button>
        )}
        {pages > 5 && <span className="px-1">…</span>}
        <button disabled={page >= pages} onClick={() => onChange(page + 1)} className="h-7 px-2 rounded-md hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1">
          Sau <Icon.ChevronRight size={11} />
        </button>
      </div>
    </div>);

};

/* Mini-stat used in HRM page headers */
const MiniStat = ({ label, value, sublabel, trend, accent = 'primary', delay = 0 }) => {
  const colors = {
    primary: 'hsl(var(--primary))',
    green: 'hsl(160 60% 45%)',
    amber: 'hsl(35 90% 50%)',
    red: 'hsl(0 75% 55%)',
    violet: 'hsl(265 60% 55%)',
    gray: 'hsl(220 14% 55%)',
    sky: 'hsl(203 89% 45%)',
  };
  const tintMap = {
    primary: 'hsl(var(--primary-h) var(--primary-s) 57% / 0.09)',
    green:   'hsl(160 60% 45% / 0.09)',
    amber:   'hsl(35 90% 50% / 0.09)',
    red:     'hsl(0 75% 55% / 0.09)',
    violet:  'hsl(265 60% 55% / 0.09)',
    gray:    'hsl(220 14% 55% / 0.06)',
    sky:     'hsl(203 89% 45% / 0.09)',
  };
  const tint = tintMap[accent] || tintMap.primary;
  return (
    <div className="card-surface p-4 rise"
      style={{
        animationDelay: `${delay}ms`,
        backgroundImage: `radial-gradient(ellipse 90% 65% at 100% 0%, ${tint}, transparent 70%)`,
      }}>
      <div className="flex items-baseline justify-between">
        <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{label}</p>
        {trend &&
        <span className={'text-[11px] font-semibold tabular-nums ' + (trend.dir === 'up' ? 'text-emerald-600' : 'text-red-500')}>
            {trend.dir === 'up' ? '↑' : '↓'} {trend.value}
          </span>
        }
      </div>
      <p className="text-[26px] font-bold font-heading mt-1 tabular-nums" style={{ color: colors[accent] }}>{value}</p>
      {sublabel && <p className="text-[11.5px] text-muted-foreground mt-0.5">{sublabel}</p>}
    </div>);
};

Object.assign(window, { PageHeader, Btn, Badge, Avatar, FilterBar, FieldInput, Select, Pagination, MiniStat });