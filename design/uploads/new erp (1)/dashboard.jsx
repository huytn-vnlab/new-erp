/* Main Dashboard shell — sidebar, topbar, router, tweaks panel */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "light",
  "accent": "sky",
  "density": "comfortable"
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

const Dashboard = () => {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

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
      <Sidebar activeRoute={activeRoute} onNavigate={setActiveRoute} />
      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar
          pageTitle={route.title}
          crumbs={route.crumb.map((c) => ({ label: c }))}
          isDark={isDark}
          onToggleTheme={toggleTheme}
          locale={locale}
          onLocaleChange={setLocale}
          unread={3} />
        
        <main ref={mainRef} className="app-canvas flex-1 overflow-y-auto scrollbar-thin" style={{ opacity: "1" }}>
          <div
            key={activeRoute /* re-mount to retrigger entry animations */}
            className={'mx-auto max-w-[1400px] flex flex-col min-h-full ' + (tweaks.density === 'compact' ? 'p-4' : 'p-6')}>
            
            <div className={'flex-1 ' + (tweaks.density === 'compact' ? 'space-y-4' : 'space-y-6')}>
              <PageComp />
            </div>

            <footer className="pt-4 pb-2 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/70 mt-auto">
              <span>© 2026 GMO-Z.com Vietnam Lab Center · VNLab Internal</span>
              <span className="font-mono">Cập nhật lần cuối · {new Date().toLocaleString('vi-VN')}</span>
            </footer>
          </div>
        </main>
      </div>

      {/* Tweaks panel */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Giao diện" />
        <TweakRadio
          label="Chế độ"
          value={tweaks.theme}
          options={[{ value: 'light', label: 'Sáng' }, { value: 'dark', label: 'Tối' }]}
          onChange={(v) => setTweak('theme', v)} />
        
        <TweakRadio
          label="Mật độ"
          value={tweaks.density}
          options={[{ value: 'comfortable', label: 'Thoáng' }, { value: 'compact', label: 'Đặc' }]}
          onChange={(v) => setTweak('density', v)} />
        

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
            Hoặc dùng sidebar để chuyển trang.
          </p>
        </div>

        <TweakSection label="Màu chủ đạo" />
        <div style={{ padding: '6px 14px 12px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {Object.entries(ACCENT_PRESETS).map(([k, p]) => {
              const active = tweaks.accent === k;
              return (
                <button
                  key={k}
                  onClick={() => setTweak('accent', k)}
                  title={p.label}
                  style={{
                    aspectRatio: '1 / 1',
                    borderRadius: 8,
                    border: active ? '2px solid #fff' : '1px solid rgba(0,0,0,0.06)',
                    boxShadow: active ? `0 0 0 2px hsl(${p.h} ${p.s}% 50%)` : 'none',
                    background: `linear-gradient(135deg, hsl(${p.h} ${p.s}% 65%), hsl(${p.h} ${p.s}% 42%))`,
                    cursor: 'pointer',
                    transition: 'transform .15s',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff'
                  }}>
                  
                  {active && <Icon.Check size={12} />}
                </button>);

            })}
          </div>
          <p style={{ fontSize: 10.5, opacity: 0.65, marginTop: 8, lineHeight: 1.4 }}>
            Đổi màu chủ đạo cho toàn giao diện.
          </p>
        </div>
      </TweaksPanel>
    </div>);

};

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<Dashboard />);