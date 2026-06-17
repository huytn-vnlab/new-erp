/* Topbar: sidebar toggle, breadcrumb, search, language, theme, bell, user dropdown */

const Breadcrumb = ({ crumbs }) => (
  <ol className="flex items-center gap-2 text-[13px]">
    {crumbs.map((c, i) => (
      <React.Fragment key={i}>
        {i > 0 && <Icon.ChevronRight size={12} className="text-muted-foreground/60" />}
        <li className={i === crumbs.length - 1 ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground cursor-pointer'}>
          {c.label}
        </li>
      </React.Fragment>
    ))}
  </ol>
);

const FLAGS = {
  vi: 'assets/flags/vn.svg',
  en: 'assets/flags/us.svg',
  ja: 'assets/flags/jp.svg',
};
const LOCALE_NAMES = { vi: 'Tiếng Việt', en: 'English', ja: '日本語' };

const Topbar = ({ pageTitle, crumbs, isDark, onToggleTheme, locale, onLocaleChange, unread }) => {
  const [langOpen, setLangOpen] = React.useState(false);
  const [bellOpen, setBellOpen] = React.useState(false);
  const [userOpen, setUserOpen] = React.useState(false);

  // close popovers on outside click
  const rootRef = React.useRef(null);
  React.useEffect(() => {
    const h = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) {
        setLangOpen(false); setBellOpen(false); setUserOpen(false);
      }
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <header ref={rootRef} className="h-14 shrink-0 px-5 flex items-center gap-3 border-b border-border/70 bg-background/80 backdrop-blur-md sticky top-0 z-20">
      <button className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Đóng / mở sidebar">
        <Icon.Menu size={18} />
      </button>

      <Breadcrumb crumbs={crumbs || [{ label: 'Trang chủ' }, { label: pageTitle }]} />

      <div className="flex-1" />

      {/* Language */}
      <div className="relative">
        <button
          onClick={() => { setLangOpen(o => !o); setBellOpen(false); setUserOpen(false); }}
          className="flex items-center gap-1.5 p-1.5 px-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <img src={FLAGS[locale]} alt="" className="h-4 w-5 rounded-[2px] object-cover" />
          <span className="text-[11px] font-semibold uppercase">{locale}</span>
        </button>
        {langOpen && (
          <div className="absolute right-0 top-full mt-1 w-44 rounded-lg border border-border bg-popover shadow-popover py-1 z-50">
            {['vi', 'en', 'ja'].map(l => (
              <button
                key={l}
                onClick={() => { onLocaleChange(l); setLangOpen(false); }}
                className={'w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-foreground hover:bg-muted transition-colors ' + (locale === l ? 'bg-muted/60 font-medium' : '')}
              >
                <img src={FLAGS[l]} alt="" className="h-4 w-5 rounded-[2px] object-cover" />
                <span className="flex-1 text-left">{LOCALE_NAMES[l]}</span>
                {locale === l && <Icon.Check size={14} className="text-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Theme toggle */}
      <button
        onClick={onToggleTheme}
        className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        title={isDark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      >
        {isDark ? <Icon.Sun size={16} /> : <Icon.Moon size={16} />}
      </button>

      {/* Bell */}
      <div className="relative">
        <button
          onClick={() => { setBellOpen(o => !o); setLangOpen(false); setUserOpen(false); }}
          className="relative p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Icon.Bell size={16} />
          {unread > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full text-[10px] font-semibold text-white flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, hsl(0 80% 60%), hsl(355 75% 50%))' }}>
              {unread}
            </span>
          )}
        </button>
        {bellOpen && (
          <div className="absolute right-0 top-full mt-1 w-[340px] rounded-lg border border-border bg-popover shadow-popover z-50 overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">Thông báo</h4>
              <button className="text-[11px] text-primary hover:underline">Đánh dấu đã đọc</button>
            </div>
            <ul className="max-h-[320px] overflow-y-auto scrollbar-thin divide-y divide-border">
              {[
                { t: 'Đơn nghỉ phép của Trần Thị Mai đang chờ duyệt', s: 'HR Admin', a: '5 phút', u: true },
                { t: 'Bạn được thêm vào dự án "Cổng thanh toán XYZ"', s: 'Hoàng Đức Thành', a: '1 giờ', u: true },
                { t: 'Báo cáo đánh giá Q1/2026 đã sẵn sàng', s: 'Evaluation Bot', a: '2 giờ', u: true },
                { t: 'Hợp đồng của Lê Quang Huy sắp hết hạn (15 ngày)', s: 'Contract Bot', a: 'Hôm qua', u: false },
                { t: 'Lương tháng 4 đã được phát', s: 'Finance', a: '3 ngày', u: false },
              ].map((n, i) => (
                <li key={i} className="px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer flex gap-3">
                  <span className={'mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ' + (n.u ? 'bg-primary' : 'bg-muted-foreground/40')} />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-foreground leading-snug">{n.t}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{n.s} · {n.a}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="px-4 py-2 border-t border-border text-center">
              <button className="text-[12px] text-primary hover:underline">Xem tất cả thông báo →</button>
            </div>
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-border" />

      {/* User */}
      <div className="relative">
        <button
          onClick={() => { setUserOpen(o => !o); setLangOpen(false); setBellOpen(false); }}
          className="flex items-center gap-2 p-1 pr-2 rounded-lg hover:bg-muted transition-colors group"
        >
          <span
            className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[11.5px] font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 40%))' }}
          >
            NA
          </span>
          <span className="text-[13px] font-medium text-foreground hidden lg:inline">Nguyễn Văn An</span>
          <Icon.ChevronDown size={14} className="text-muted-foreground/80 hidden lg:inline" />
        </button>
        {userOpen && (
          <div className="absolute right-0 top-full mt-1 w-60 rounded-lg border border-border bg-popover shadow-popover z-50 overflow-hidden">
            <div className="px-3 py-3 flex items-center gap-3 border-b border-border">
              <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg text-[13px] font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 40%))' }}>NA</span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-foreground truncate">Nguyễn Văn An</p>
                <p className="text-[11px] text-muted-foreground truncate">an.nguyen@vnlab.vn</p>
              </div>
            </div>
            <div className="py-1 text-[13px]">
              <button className="w-full px-3 py-2 text-left hover:bg-muted transition-colors text-foreground/90">Hồ sơ cá nhân</button>
              <button className="w-full px-3 py-2 text-left hover:bg-muted transition-colors text-foreground/90">Đổi mật khẩu</button>
              <div className="my-1 border-t border-border" />
              <button className="w-full px-3 py-2 text-left hover:bg-red-50 dark:hover:bg-red-950/30 text-red-600 transition-colors">Đăng xuất</button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

window.Topbar = Topbar;
