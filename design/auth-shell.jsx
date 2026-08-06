/* Pre-login shell: icon set, form primitives, auth layout themed to the original landing (blue gradient world) */

const I2 = ({ size = 16, children, ...p }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" {...p}>{children}</svg>
);

const AIcon = {
  Arrow: (p) => (<I2 {...p}><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></I2>),
  Back: (p) => (<I2 {...p}><path d="M19 12H5" /><path d="m11 18-6-6 6-6" /></I2>),
  Search: (p) => (<I2 {...p}><circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" /></I2>),
  Check: (p) => (<I2 {...p} strokeWidth="2.5"><path d="M4 12.5 9.5 18 20 6.5" /></I2>),
  Mail: (p) => (<I2 {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3.5 7 8.5 6 8.5-6" /></I2>),
  Lock: (p) => (<I2 {...p}><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></I2>),
  User: (p) => (<I2 {...p}><circle cx="12" cy="8" r="4" /><path d="M4.5 21c1.2-4 4-6 7.5-6s6.3 2 7.5 6" /></I2>),
  Building: (p) => (<I2 {...p}><path d="M4 21V6a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v15" /><path d="M15 10h3a2 2 0 0 1 2 2v9" /><path d="M8 8h3M8 12h3M8 16h3" /><path d="M3 21h18" /></I2>),
  Phone: (p) => (<I2 {...p}><rect x="6" y="2.5" width="12" height="19" rx="2.5" /><path d="M11 18.5h2" /></I2>),
  Tag: (p) => (<I2 {...p}><path d="M20.5 13.3 13.3 20.5a2 2 0 0 1-2.8 0l-7-7V4.5a1.5 1.5 0 0 1 1.5-1.5h8l7.5 7.5a2 2 0 0 1 0 2.8Z" /><circle cx="8" cy="8" r="1.4" /></I2>),
  Shield: (p) => (<I2 {...p}><path d="M12 3l7 3v6c0 4.2-2.8 7.6-7 9-4.2-1.4-7-4.8-7-9V6l7-3Z" /><path d="m9 12 2 2 4-4" /></I2>),
  Chart: (p) => (<I2 {...p}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></I2>),
  Users: (p) => (<I2 {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20c.9-3.4 3.4-5.2 6.5-5.2s5.6 1.8 6.5 5.2" /><path d="M16 5.5a3.5 3.5 0 0 1 0 7" /><path d="M18 14.9c2.1.6 3.4 2.3 4 5.1" /></I2>),
  Clock: (p) => (<I2 {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5l3.5 2" /></I2>),
  Doc: (p) => (<I2 {...p}><path d="M6 3h7l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" /><path d="M13 3v5h5" /><path d="M8.5 13h7M8.5 17h5" /></I2>),
  Sparkle: (p) => (<I2 {...p}><path d="M12 3.5 13.8 9l5.5 1.8-5.5 1.8L12 18l-1.8-5.4L4.7 10.8 10.2 9 12 3.5Z" /></I2>),
  Globe: (p) => (<I2 {...p}><circle cx="12" cy="12" r="9" /><path d="M3.5 9.5h17M3.5 14.5h17" /><path d="M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z" /></I2>),
  Google: (p) => (
    <svg width={p.size || 16} height={p.size || 16} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.5 12.2c0-.8-.1-1.4-.2-2H12v3.9h5.9c-.1 1-.8 2.5-2.2 3.5l3.4 2.6c2-1.8 3.4-4.6 3.4-8Z" />
      <path fill="#34A853" d="M12 23c2.9 0 5.3-1 7.1-2.6l-3.4-2.6c-.9.6-2.1 1-3.7 1a6.4 6.4 0 0 1-6-4.4l-3.5 2.7A10.9 10.9 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M6 14.4a6.7 6.7 0 0 1 0-4.3L2.5 7.4a11 11 0 0 0 0 9.7L6 14.4Z" />
      <path fill="#EA4335" d="M12 5.4c2 0 3.4.9 4.2 1.6l3-2.9A10.5 10.5 0 0 0 12 1 10.9 10.9 0 0 0 2.5 7.4L6 10.1A6.4 6.4 0 0 1 12 5.4Z" />
    </svg>
  ),
};

/* ---------- form primitives (blue #109cf1 accent, radius 10px — landing button language) ---------- */

const Field = ({ label, icon, type = 'text', value, onChange, placeholder, hint, error, right, autoFocus }) => {
  const [reveal, setReveal] = React.useState(false);
  const isPw = type === 'password';
  const Ic = icon ? AIcon[icon] : null;
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-3">
        <span className="text-[12.5px] font-semibold tracking-[0.01em] text-ink">{label}</span>
        {right}
      </span>
      <span className={'mt-1.5 flex items-center gap-2 rounded-[10px] border bg-white px-3.5 transition-shadow focus-within:shadow-[0_0_0_3px_rgba(16,156,241,0.16)] ' + (error ? 'border-rose-400' : 'border-line focus-within:border-[#109cf1]')}>
        {Ic && <Ic size={15} className="text-slate-400 shrink-0" />}
        <input
          type={isPw && !reveal ? 'password' : type === 'password' ? 'text' : type}
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange && onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 min-w-0 bg-transparent py-2.5 text-[13.5px] text-ink placeholder:text-slate-400 outline-none" />
        {isPw && <button type="button" onClick={() => setReveal((r) => !r)} className="text-[11.5px] font-medium text-slate-400 hover:text-ink shrink-0">{reveal ? 'Ẩn' : 'Hiện'}</button>}
      </span>
      {(error || hint) && <span className={'mt-1.5 block text-[11.5px] ' + (error ? 'text-rose-600' : 'text-slate-500')}>{error || hint}</span>}
    </label>
  );
};

const PrimaryBtn = ({ children, onClick, disabled, arrow = true, type = 'button' }) => (
  <button
    type={type}
    onClick={onClick}
    disabled={disabled}
    style={!disabled ? { background: 'linear-gradient(135deg,#109cf1,#1565c0)', boxShadow: '0 4px 20px rgba(16,156,241,0.4)' } : undefined}
    className={'group w-full h-11 rounded-[10px] text-[13.5px] font-bold inline-flex items-center justify-center gap-2 transition-all ' + (disabled ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'text-white hover:-translate-y-px hover:shadow-[0_8px_28px_rgba(16,156,241,0.5)]')}>
    {children}
    {arrow && !disabled && <span className="transition-transform group-hover:translate-x-0.5"><AIcon.Arrow size={15} /></span>}
  </button>
);

const GhostBtn = ({ children, onClick, icon }) => (
  <button onClick={onClick} className="w-full h-11 rounded-[10px] border border-line bg-white text-[13.5px] font-semibold text-ink inline-flex items-center justify-center gap-2.5 hover:bg-slate-50 transition-colors">
    {icon && React.createElement(AIcon[icon], { size: 16 })}{children}
  </button>
);

const TextLink = ({ children, onClick }) => (
  <button onClick={onClick} className="text-[#1565c0] font-semibold hover:underline underline-offset-2">{children}</button>
);

const Divider = ({ label }) => (
  <div className="flex items-center gap-3 text-[11.5px] uppercase tracking-[0.14em] text-slate-400">
    <span className="h-px flex-1 bg-line" />{label}<span className="h-px flex-1 bg-line" />
  </div>
);

const Steps = ({ total, current }) => (
  <div className="flex items-center gap-1.5">
    {Array.from({ length: total }).map((_, i) => (
      <span key={i} className={'h-1 rounded-full transition-all ' + (i === current ? 'w-6 bg-[#109cf1]' : i < current ? 'w-3 bg-[#109cf1]/40' : 'w-3 bg-line')} />
    ))}
  </div>
);

/* ---------- auth layout: the landing hero world (gradient + dot grid + orbs) with a white card ---------- */

const AUTH_TRUST = [
  { icon: 'Shield', t: 'Dữ liệu lưu tại Việt Nam' },
  { icon: 'Users', t: '240+ tổ chức đang dùng' },
  { icon: 'Clock', t: 'Triển khai trong 1 ngày' },
];

const AuthLayout = ({ children, eyebrow, title, sub, step, back, onBack, footer, wide, onHome }) => (
  <div className="auth-root">
    <div className="hero-grid" />
    <div className="hero-orb hero-orb-1" />
    <div className="hero-orb hero-orb-2" />

    <header className="relative z-10">
      <div className="mx-auto max-w-[1160px] px-6 h-[66px] flex items-center justify-between">
        <button onClick={() => onHome && onHome()} className="shrink-0"><img src="assets/logoheader.png" alt="Micro ERP" className="h-[30px] w-auto" /></button>
        <div className="flex items-center gap-1">
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[12.5px] text-white/70 px-3"><AIcon.Globe size={14} />VI</span>
          <a href="#" className="text-[13px] font-medium text-white/85 hover:bg-white/10 rounded-lg px-3 py-1.5 transition-colors" style={{ color: 'rgba(255,255,255,0.85)' }}>Hỗ trợ</a>
        </div>
      </div>
    </header>

    <main className="relative z-10 flex-1 flex items-center justify-center px-6 py-10">
      <div key={title} className={'w-full ' + (wide ? 'max-w-[560px]' : 'max-w-[452px]')}>
        {back && (
          <button onClick={onBack} className="mb-3.5 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-white/70 hover:text-white transition-colors">
            <AIcon.Back size={14} />{back}
          </button>
        )}
        <div className="stagger auth-card">
          {typeof step === 'number' && <div className="mb-6"><Steps total={2} current={step} /></div>}
          <div>
            {eyebrow && <p className="section-eyebrow" style={{ marginBottom: 0 }}>{eyebrow}</p>}
            <h1 className="mt-3 font-heading text-[26px] leading-[1.2] font-extrabold tracking-[-0.02em] text-ink" style={{ textWrap: 'balance' }}>{title}</h1>
            {sub && <p className="mt-2 text-[13.5px] leading-relaxed text-slate-600" style={{ textWrap: 'pretty' }}>{sub}</p>}
          </div>
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 border-t border-line pt-5 text-[13px] text-slate-500">{footer}</div>}
        </div>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
          {AUTH_TRUST.map((t) => (
            <li key={t.t} className="inline-flex items-center gap-1.5 text-[11.5px] text-white/65">
              <span className="text-[#64dfdf]">{React.createElement(AIcon[t.icon], { size: 13 })}</span>{t.t}
            </li>
          ))}
        </ul>
      </div>
    </main>

    <footer className="relative z-10 px-6 py-4">
      <div className="mx-auto max-w-[1160px] flex items-center justify-between text-[11.5px] text-white/45">
        <span>© 2026 GMO-Z.com VietNamLab JSC</span>
        <span className="flex items-center gap-4"><a href="#" className="hover:text-white" style={{ color: 'inherit' }}>Điều khoản</a><a href="#" className="hover:text-white" style={{ color: 'inherit' }}>Bảo mật</a></span>
      </div>
    </footer>
  </div>
);

Object.assign(window, { AIcon, Field, PrimaryBtn, GhostBtn, TextLink, Divider, Steps, AuthLayout });
