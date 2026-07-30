/* Main Dashboard shell — sidebar, topbar, router, tweaks panel */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "accent": "sky",
  "density": "compact"
} /*EDITMODE-END*/;

// Accent presets — each maps to {h, s, label}
const ACCENT_PRESETS = {
  sky: { h: 203, s: 89, label: 'Sky' },
  indigo: { h: 243, s: 75, label: 'Indigo' },
  emerald: { h: 160, s: 70, label: 'Emerald' },
  coral: { h: 14, s: 82, label: 'Coral' },
  violet: { h: 280, s: 65, label: 'Violet' }
};

/* Map of route → { component, title, breadcrumb } */
const ROUTES = {
  '/home-admin': { Component: () => <PageHome />, title: 'Tổng quan / Bảng điều khiển', crumb: ['Trang chủ', 'Tổng quan'] },
  '/hrm/member': { Component: () => <PageMember />, title: 'HRM / Quản lý nhân viên', crumb: ['Trang chủ', 'HRM', 'Quản lý nhân viên'] },
  '/hrm/member/profile': { Component: () => <PageProfile />, title: 'HRM / Hồ sơ nhân viên', crumb: ['Trang chủ', 'HRM', 'Quản lý nhân viên', 'Hồ sơ'] },
  '/hrm/leave': { Component: () => <PageLeave />, title: 'HRM / Đơn nghỉ phép', crumb: ['Trang chủ', 'HRM', 'Đơn nghỉ phép'] },
  '/hrm/asset': { Component: () => <PageAsset />, title: 'HRM / Tài sản công ty', crumb: ['Trang chủ', 'HRM', 'Tài sản'] },
  '/hrm/contract': { Component: () => <PageContract />, title: 'HRM / Hợp đồng', crumb: ['Trang chủ', 'HRM', 'Hợp đồng'] },
  '/hrm/timekeeping': { Component: () => <PageTimekeeping />, title: 'HRM / Chấm công', crumb: ['Trang chủ', 'HRM', 'Chấm công'] },
  '/evaluation': { Component: () => <PageEvaluation />, title: 'Đánh giá nhân sự', crumb: ['Trang chủ', 'Đánh giá nhân sự'] },
  '/workflow/project': { Component: () => <PageProject />, title: 'Workflow / Dự án', crumb: ['Trang chủ', 'Workflow', 'Dự án'] },
  '/recruitment': { Component: () => <PageRecruitment />, title: 'Tuyển dụng', crumb: ['Trang chủ', 'Tuyển dụng'] },
  '/request/overtime': { Component: () => <PageOvertime />, title: 'Yêu cầu / Tăng ca', crumb: ['Trang chủ', 'Yêu cầu', 'Tăng ca'] },
  '/settings': { Component: () => <PageSettings />, title: 'Cài đặt hệ thống', crumb: ['Trang chủ', 'Cài đặt hệ thống'] }
};

/* Home page — the original admin dashboard composition, now as a page */
const PageHome = () => {
  const [activeTab, setActiveTab] = React.useState('company');
  const [checkinState, setCheckinState] = React.useState('none');

  const stats = [
  {
    label: 'Tổng nhân viên', icon: 'Users', value: 248,
    trend: { dir: 'up', value: '+12' }, sublabel: 'So với quý trước',
    sparkData: [212, 218, 224, 229, 232, 238, 244, 248],
    breakdown: [
    { label: 'Hà Nội', value: 142 }, { label: 'Đà Nẵng', value: 58 },
    { label: 'Hồ Chí Minh', value: 38 }, { label: 'Osaka', value: 10 }]

  },
  {
    label: 'Dự án', icon: 'Folder', value: 9,
    trend: { dir: 'up', value: '+1' }, sublabel: '6 đang hoạt động',
    sparkData: [6, 6, 7, 7, 8, 8, 9, 9],
    breakdown: [
    { label: 'Đang hoạt động', value: 6 }, { label: 'Chờ khởi động', value: 2 }, { label: 'Đã kết thúc', value: 1 }]

  },
  {
    label: 'Kỳ đánh giá', icon: 'Star', value: 'Q2/26',
    sublabel: '94 nhân viên đã đánh giá',
    sparkData: [40, 55, 68, 80, 92, 94],
    breakdown: [
    { label: 'Đã hoàn thành', value: '94 / 248' }, { label: 'Hạn cuối nộp', value: '15/06' }, { label: 'Tỷ lệ đạt S+A', value: '17%' }]

  }];


  const tabItems = [
  { value: 'company', label: 'Thông tin công ty' },
  { value: 'personal', label: 'Thông tin của bạn' },
  { value: 'project', label: 'Thông tin dự án' }];


  return (
    <>
      <Banner checkinState={checkinState} onCheckin={() => setCheckinState((s) => s === 'none' ? 'in' : s === 'in' ? 'out' : 'none')} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((s, i) => <StatCard key={i} {...s} delay={80 + i * 60} />)}
      </div>

      <div className="border-b border-border/70">
        <div className="flex gap-7">
          {tabItems.map((t) =>
          <button key={t.value} data-active={activeTab === t.value} onClick={() => setActiveTab(t.value)} className="tab-trigger">
              {t.label}
            </button>
          )}
        </div>
      </div>

      {activeTab === 'company' && <CompanyTab />}
      {activeTab === 'personal' && <PersonalTab />}
      {activeTab === 'project' && <ProjectTab />}
    </>);

};

const SettingRow = ({ label, hint, children }) =>
<div className="flex items-start justify-between gap-6 py-3.5 border-b border-border/70 last:border-0">
    <div className="min-w-0">
      <p className="text-[13px] font-medium text-foreground">{label}</p>
      {hint && <p className="text-[11.5px] text-muted-foreground mt-0.5">{hint}</p>}
    </div>
    <div className="shrink-0">{children}</div>
  </div>;


const SegBtns = ({ value, options, onChange }) =>
<div className="inline-flex rounded-lg border border-border/70 p-0.5 bg-muted/40">
    {options.map((o) =>
  <button
    key={o.value}
    onClick={() => onChange(o.value)}
    className={'px-3 py-1.5 rounded-md text-[12.5px] transition-colors flex items-center gap-1.5 ' + (
    value === o.value ? 'bg-background shadow-sm font-medium text-foreground' : 'text-muted-foreground hover:text-foreground')}>
      {o.icon && React.createElement(Icon[o.icon], { size: 13 })}{o.label}
    </button>
  )}
  </div>;


const PwField = ({ label, value, onChange, hint, error }) => {
  const [show, setShow] = React.useState(false);
  return (
    <label className="block">
      <span className="text-[12.5px] font-medium text-foreground">{label}</span>
      <span className="mt-1.5 flex items-center gap-1 rounded-lg border bg-background px-2.5 focus-within:border-primary transition-colors" style={{ borderColor: error ? 'hsl(0 72% 55%)' : 'hsl(var(--border))' }}>
        <input type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} placeholder="••••••••" className="flex-1 bg-transparent py-2 text-[13px] outline-none" />
        <button type="button" onClick={() => setShow((s) => !s)} className="text-[11px] text-muted-foreground hover:text-foreground px-1">{show ? 'Ẩn' : 'Hiện'}</button>
      </span>
      {(error || hint) && <span className={'block mt-1 text-[11.5px] ' + (error ? 'text-red-600' : 'text-muted-foreground')}>{error || hint}</span>}
    </label>);

};

const ChangePassword = ({ onClose }) => {
  const [cur, setCur] = React.useState('');
  const [next, setNext] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [done, setDone] = React.useState(false);

  const rules = [
  { k: 'len', label: 'Tối thiểu 8 ký tự', ok: next.length >= 8 },
  { k: 'case', label: 'Có chữ hoa và chữ thường', ok: /[a-z]/.test(next) && /[A-Z]/.test(next) },
  { k: 'num', label: 'Có ít nhất 1 chữ số', ok: /[0-9]/.test(next) },
  { k: 'sym', label: 'Có ký tự đặc biệt', ok: /[^A-Za-z0-9\s]/.test(next) }];

  const passed = rules.filter((r) => r.ok).length;
  const strength = ['Rất yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'][passed];
  const strengthColor = ['hsl(var(--border))', 'hsl(0 72% 55%)', 'hsl(35 90% 50%)', 'hsl(203 89% 48%)', 'hsl(160 60% 40%)'][passed];
  const mismatch = confirm.length > 0 && confirm !== next;
  const valid = cur.length > 0 && passed === rules.length && !mismatch && confirm.length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card-surface w-full max-w-md rise overflow-hidden">
        <div className="px-5 py-4 border-b border-border/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary"><Icon.Lock size={18} /></span>
            <div>
              <h3 className="text-[17px] font-bold font-heading leading-tight">Đổi mật khẩu</h3>
              <p className="text-[12px] text-muted-foreground">Cập nhật lần cuối 12/03/2026</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted text-muted-foreground"><Icon.X size={16} /></button>
        </div>

        {done ?
        <div className="p-8 text-center">
            <span className="mx-auto h-12 w-12 rounded-full flex items-center justify-center" style={{ background: 'hsl(160 60% 94%)', color: 'hsl(160 60% 34%)' }}><Icon.Check size={22} /></span>
            <p className="mt-3 text-[14px] font-semibold font-heading">Đã đổi mật khẩu thành công</p>
            <p className="mt-1 text-[12.5px] text-muted-foreground">Bạn sẽ cần đăng nhập lại trên các thiết bị khác.</p>
            <button onClick={onClose} className="mt-5 text-[12.5px] px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium">Đóng</button>
          </div> :

        <React.Fragment>
            <div className="p-5 space-y-4">
              <PwField label="Mật khẩu hiện tại" value={cur} onChange={setCur} />
              <div>
                <PwField label="Mật khẩu mới" value={next} onChange={setNext} />
                {next.length > 0 &&
              <div className="mt-2">
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                        <span className="block h-full rounded-full transition-all" style={{ width: passed / 4 * 100 + '%', background: strengthColor }} />
                      </span>
                      <span className="text-[11.5px] font-medium" style={{ color: strengthColor }}>{strength}</span>
                    </div>
                    <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
                      {rules.map((r) =>
                  <li key={r.k} className={'flex items-center gap-1.5 text-[11.5px] ' + (r.ok ? 'text-foreground' : 'text-muted-foreground')}>
                          <span className={'h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0 ' + (r.ok ? 'bg-emerald-500 text-white' : 'border border-border')}>
                            {r.ok && <Icon.Check size={9} />}
                          </span>
                          {r.label}
                        </li>
                  )}
                    </ul>
                  </div>
              }
              </div>
              <PwField label="Xác nhận mật khẩu mới" value={confirm} onChange={setConfirm} error={mismatch ? 'Mật khẩu xác nhận chưa khớp.' : ''} />
            </div>
            <div className="px-5 py-3 border-t border-border/70 flex items-center justify-end gap-2 bg-muted/25">
              <button onClick={onClose} className="text-[12.5px] px-3 py-1.5 rounded-lg border border-border/70 hover:bg-muted transition-colors">Huỷ</button>
              <button disabled={!valid} onClick={() => setDone(true)} className={'text-[12.5px] px-3 py-1.5 rounded-lg font-medium transition-opacity ' + (valid ? 'bg-primary text-primary-foreground hover:opacity-90' : 'bg-muted text-muted-foreground cursor-not-allowed')}>Cập nhật mật khẩu</button>
            </div>
          </React.Fragment>
        }
      </div>
    </div>);

};

const UserSettings = ({ tweaks, setTweak, locale, onLocaleChange, onClose, onChangePassword }) => {
  const [tab, setTab] = React.useState('appearance');
  const tabs = [['appearance', 'Giao diện', 'Sun'], ['account', 'Tài khoản', 'Users']];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card-surface w-full max-w-3xl rise overflow-hidden">
        <div className="px-5 py-4 border-b border-border/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary"><Icon.Sliders size={18} /></span>
            <div>
              <h3 className="text-[17px] font-bold font-heading leading-tight">Cài đặt cá nhân</h3>
              <p className="text-[12px] text-muted-foreground">Nguyễn Văn An · an.nguyen@vnlab.vn</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted text-muted-foreground"><Icon.X size={16} /></button>
        </div>

        <div className="grid grid-cols-[190px_1fr] min-h-[360px]">
          <nav className="border-r border-border/70 p-2.5 flex flex-col gap-0.5">
            {tabs.map(([k, label, ic]) =>
            <button
              key={k}
              onClick={() => setTab(k)}
              className={'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[13px] text-left transition-colors ' + (
              tab === k ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-muted/60')}>
                {React.createElement(Icon[ic], { size: 15 })}{label}
              </button>
            )}
          </nav>

          <div className="p-5">
            {tab === 'appearance' &&
            <div>
                <SettingRow label="Chế độ hiển thị" hint="Áp dụng cho toàn bộ giao diện của bạn.">
                  <SegBtns
                  value={tweaks.theme}
                  onChange={(v) => setTweak('theme', v)}
                  options={[{ value: 'light', label: 'Sáng', icon: 'Sun' }, { value: 'dark', label: 'Tối', icon: 'Moon' }]} />
                
                </SettingRow>
                <SettingRow label="Màu chủ đạo" hint="Màu nhấn cho nút, biểu đồ và trạng thái.">
                  <div className="flex items-center gap-1.5">
                    {Object.entries(ACCENT_PRESETS).map(([k, p]) =>
                  <button
                    key={k}
                    title={p.label}
                    onClick={() => setTweak('accent', k)}
                    className="h-7 w-7 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105"
                    style={{
                      background: `linear-gradient(135deg, hsl(${p.h} ${p.s}% 65%), hsl(${p.h} ${p.s}% 42%))`,
                      boxShadow: tweaks.accent === k ? `0 0 0 2px hsl(var(--background)), 0 0 0 4px hsl(${p.h} ${p.s}% 50%)` : 'none'
                    }}>
                      {tweaks.accent === k && <Icon.Check size={12} />}
                    </button>
                  )}
                  </div>
                </SettingRow>
                <SettingRow label="Ngôn ngữ" hint="Ngôn ngữ hiển thị của hệ thống.">
                  <SegBtns
                  value={locale}
                  onChange={onLocaleChange}
                  options={[{ value: 'vi', label: 'Tiếng Việt' }, { value: 'en', label: 'English' }, { value: 'ja', label: '日本語' }]} />
                
                </SettingRow>
              </div>
            }

            {tab === 'account' &&
            <div>
                <SettingRow label="Múi giờ" hint="Dùng cho chấm công và lịch nhắc nhở.">
                  <span className="text-[12.5px] text-muted-foreground">(GMT+7) Hồ Chí Minh</span>
                </SettingRow>
                <SettingRow label="Mật khẩu" hint="Cập nhật lần cuối 12/03/2026.">
                  <button onClick={onChangePassword} className="text-[12.5px] px-3 py-1.5 rounded-lg border border-border/70 hover:bg-muted transition-colors">Đổi mật khẩu</button>
                </SettingRow>
              </div>
            }
          </div>
        </div>

        <div className="px-5 py-3 border-t border-border/70 flex items-center justify-end gap-2 bg-muted/25">
          <button onClick={onClose} className="text-[12.5px] px-3 py-1.5 rounded-lg border border-border/70 hover:bg-muted transition-colors">Huỷ</button>
          <button onClick={onClose} className="text-[12.5px] px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition-opacity">Lưu thay đổi</button>
        </div>
      </div>
    </div>);

};

const Dashboard = () => {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const [pwOpen, setPwOpen] = React.useState(false);
  const sidebarCollapsed = tweaks.sidebar === 'collapsed';

  const [activeRoute, setActiveRoute] = React.useState('/home-admin');
  const [locale, setLocale] = React.useState('vi');

  // Expose a global navigate fn so child pages (e.g. member list → profile) can route
  React.useEffect(() => {
    window.__erp_navigate = (route) => setActiveRoute(route);
    return () => {delete window.__erp_navigate;};
  }, []);

  React.useEffect(() => {
    if (tweaks.theme === 'dark') document.documentElement.classList.add('dark');else
    document.documentElement.classList.remove('dark');
  }, [tweaks.theme]);

  React.useEffect(() => {
    const a = ACCENT_PRESETS[tweaks.accent] || ACCENT_PRESETS.sky;
    document.documentElement.style.setProperty('--primary-h', String(a.h));
    document.documentElement.style.setProperty('--primary-s', `${a.s}%`);
  }, [tweaks.accent]);

  // Scroll to top on route change
  const mainRef = React.useRef(null);
  React.useEffect(() => {
    if (mainRef.current) mainRef.current.scrollTop = 0;
  }, [activeRoute]);

  const toggleTheme = () => setTweak('theme', tweaks.theme === 'dark' ? 'light' : 'dark');
  const isDark = tweaks.theme === 'dark';

  const route = ROUTES[activeRoute] || ROUTES['/home-admin'];
  const PageComp = route.Component;

  return (
    <div className="flex min-h-svh">
      <Sidebar activeRoute={activeRoute} onNavigate={setActiveRoute} collapsed={sidebarCollapsed} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          pageTitle={route.title}
          crumbs={route.crumb.map((c) => ({ label: c }))}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          locale={locale}
          onLocaleChange={setLocale}
          onOpenSettings={() => setSettingsOpen(true)}
          onChangePassword={() => setPwOpen(true)}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => setTweak('sidebar', sidebarCollapsed ? 'expanded' : 'collapsed')}
          unread={3} />
        
        <main ref={mainRef} className="app-canvas flex-1 overflow-y-auto scrollbar-thin" style={{ opacity: "1" }}>
          <div
            key={activeRoute /* re-mount to retrigger entry animations */}
            className={'mx-auto max-w-[1400px] flex flex-col min-h-full ' + (tweaks.density === 'compact' ? 'p-4' : 'p-6')}>
            
            <div className={'flex-1 ' + (tweaks.density === 'compact' ? 'space-y-4' : 'space-y-6')}>
              <PageComp />
            </div>

            <footer className="pt-4 pb-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/70 mt-10">
              <span>© 2026 GMO-Z.com Vietnam Lab Center · VNLab Internal</span>
              <span className="font-mono">Cập nhật lần cuối · {new Date().toLocaleString('vi-VN')}</span>
            </footer>
          </div>
        </main>
      </div>

      {settingsOpen &&
      <UserSettings
        tweaks={tweaks}
        setTweak={setTweak}
        locale={locale}
        onLocaleChange={setLocale}
        onChangePassword={() => setPwOpen(true)}
        onClose={() => setSettingsOpen(false)} />
      }
      {pwOpen && <ChangePassword onClose={() => setPwOpen(false)} />}

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Trang đang xem" />
        <div style={{ padding: '4px 14px 8px' }}>
          <select
            value={activeRoute}
            onChange={(e) => setActiveRoute(e.target.value)}
            className="twk-field">
            
            {Object.entries(ROUTES).map(([path, r]) =>
            <option key={path} value={path}>{r.title}</option>
            )}
          </select>
          <p style={{ fontSize: 10.5, opacity: 0.65, marginTop: 6, lineHeight: 1.4 }}>
            Giao diện, màu chủ đạo và bố cục đã chuyển vào “Cài đặt cá nhân” trên menu người dùng ở topbar.
          </p>
        </div>
      </TweaksPanel>
    </div>);

};

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<Dashboard />);