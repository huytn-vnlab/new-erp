/* Welcome banner + stat cards row */

const Banner = ({ checkinState, onCheckin }) => {
  const now = new Date();
  const h = now.getHours();
  const greet = h < 12 ? 'Chào buổi sáng' : h < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
  const dateStr = now.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const time = '08:42';

  return (
    <div className="relative overflow-hidden card-surface rise" style={{ animationDelay: '0ms' }}>
      {/* Decorative diagonal accent */}
      <div
        className="absolute inset-y-0 right-0 w-1/2 pointer-events-none opacity-90"
        style={{
          background: 'linear-gradient(115deg, transparent 25%, hsl(var(--primary-h) var(--primary-s) 60% / 0.10) 60%, hsl(var(--primary-h) var(--primary-s) 50% / 0.18) 100%)',
        }}
      />
      <div
        className="absolute -right-12 -bottom-12 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, hsl(var(--primary-h) var(--primary-s) 60% / 0.22), transparent 65%)' }}
      />

      <div className="relative p-6 flex items-stretch justify-between gap-6 flex-wrap">
        {/* Left */}
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{greet},</p>
          <h1
            className="font-display mt-1.5 leading-[1.05] text-foreground"
            style={{
              fontSize: '36px',
              fontWeight: 500,
              letterSpacing: '-0.025em',
            }}
          >
            Nguyễn <span style={{ fontStyle: 'italic', fontWeight: 400, color: 'hsl(var(--primary-h) var(--primary-s) 47%)' }}>Văn An</span>
          </h1>
          <div className="mt-3 flex items-center gap-3 text-[12.5px] text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Icon.Calendar size={13} />
              {dateStr}
            </span>
            <span className="text-border">•</span>
            <span className="inline-flex items-center gap-1.5 font-mono">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 live-dot" />
              {time}
            </span>
          </div>
        </div>

        {/* Right: check-in card */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:block text-right">
            <p className="text-[12px] text-muted-foreground uppercase tracking-wider font-medium">Trạng thái hôm nay</p>
            {checkinState === 'in' && (
              <p className="text-[13px] text-foreground mt-1">Đã chấm công vào lúc <span className="font-semibold tabular-nums">08:42</span></p>
            )}
            {checkinState === 'out' && (
              <p className="text-[13px] text-foreground mt-1">Đã hoàn tất chấm công <span className="text-emerald-600 font-semibold">✓</span></p>
            )}
            {checkinState === 'none' && (
              <p className="text-[13px] text-foreground mt-1">Bạn chưa chấm công vào</p>
            )}
          </div>
          {checkinState === 'none' ? (
            <button
              onClick={onCheckin}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] font-semibold text-white shadow-card-hover transition-all hover:scale-[1.02]"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 42%))' }}
            >
              <Icon.LogIn size={15} />
              Chấm công vào
            </button>
          ) : checkinState === 'in' ? (
            <button
              onClick={onCheckin}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] font-semibold border border-border bg-card text-foreground hover:border-primary transition-colors"
            >
              <Icon.LogOut size={15} />
              Chấm công ra
            </button>
          ) : (
            <button className="inline-flex items-center gap-2 h-10 px-4 rounded-lg text-[13px] font-semibold border border-border bg-muted/50 text-muted-foreground cursor-default">
              <Icon.Check size={15} />
              Đã hoàn tất
            </button>
          )}
        </div>
      </div>

      {/* Quick actions strip */}
      <div className="relative border-t border-border/70 px-6 py-3 flex items-center gap-1 flex-wrap text-[12.5px]">
        <span className="text-muted-foreground mr-2 font-medium">Truy cập nhanh:</span>
        {[
          { l: 'Tạo đơn nghỉ', i: 'FileText' },
          { l: 'Yêu cầu tăng ca', i: 'Timer' },
          { l: 'Xem lịch chấm công', i: 'Clock' },
          { l: 'Hồ sơ nhân viên', i: 'Users' },
          { l: 'Tạo dự án', i: 'Folder' },
        ].map((a, i) => {
          const Ic = Icon[a.i];
          return (
            <button key={i} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-foreground/80 hover:bg-muted hover:text-primary transition-colors">
              <Ic size={13} />
              {a.l}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const StatCard = ({ label, icon, value, sublabel, trend, sparkData, breakdown, accent = 'primary', delay = 0 }) => {
  const Ic = Icon[icon];
  const trendUp = trend?.dir === 'up';
  const accentHsl = {
    primary: `hsl(var(--primary-h) var(--primary-s) 57%)`,
    green:   `hsl(160 60% 45%)`,
    amber:   `hsl(35 90% 50%)`,
    violet:  `hsl(265 60% 55%)`,
    red:     `hsl(0 75% 55%)`,
    gray:    `hsl(220 14% 55%)`,
  };
  const accentColor = accentHsl[accent] || accentHsl.primary;
  return (
    <div className="card-surface interactive p-5 rise flex flex-col gap-4"
      style={{
        animationDelay: `${delay}ms`,
        backgroundImage: `radial-gradient(ellipse 80% 60% at 100% 0%, ${accentColor.replace(')', ' / 0.09)')}, transparent 70%)`,
      }}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-[34px] font-bold text-foreground font-heading tabular-nums leading-none">{value}</span>
            {trend && (
              <span className={'inline-flex items-center gap-0.5 text-[12px] font-semibold tabular-nums ' + (trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')}>
                {trendUp ? <Icon.TrendUp size={12} /> : <Icon.TrendDown size={12} />}
                {trend.value}
              </span>
            )}
          </div>
          {sublabel && <p className="text-[12px] text-muted-foreground mt-1">{sublabel}</p>}
        </div>
        <div
          className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60% / 0.16), hsl(var(--primary-h) var(--primary-s) 40% / 0.10))',
            color: 'hsl(var(--primary))',
          }}
        >
          {Ic && <Ic size={18} />}
        </div>
      </div>

      {/* Sparkline */}
      {sparkData && (
        <div className="text-primary -mx-1">
          <Sparkline data={sparkData} width={240} height={36} stroke="currentColor" />
        </div>
      )}

      {/* Breakdown */}
      {breakdown && (
        <div className="space-y-1.5 pt-2 border-t border-border/70">
          {breakdown.map((b, i) => (
            <div key={i} className="flex items-center justify-between text-[12px]">
              <span className="text-muted-foreground">{b.label}</span>
              <span className="font-semibold text-foreground tabular-nums">{b.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

Object.assign(window, { Banner, StatCard });
