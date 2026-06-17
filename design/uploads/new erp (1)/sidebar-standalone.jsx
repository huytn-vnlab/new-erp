/* Sidebar matching the existing nav structure: Overview, Module (HRM/Eval/Workflow/Recruitment/Request), System */

const NAV = {
  overview: [
    { key: 'dashboard', label: 'Tổng quan', icon: 'Dashboard', to: '/home-admin' },
  ],
  module: [
    {
      key: 'hrm', label: 'Nhân sự (HRM)', icon: 'Users',
      children: [
        { key: 'member', label: 'Quản lý nhân viên', to: '/hrm/member' },
        { key: 'leave', label: 'Đơn nghỉ phép', to: '/hrm/leave' },
        { key: 'assets', label: 'Tài sản công ty', to: '/hrm/asset' },
        { key: 'contract', label: 'Hợp đồng', to: '/hrm/contract' },
        { key: 'timekeeping', label: 'Chấm công', to: '/hrm/timekeeping' },
      ],
    },
    { key: 'evaluation', label: 'Đánh giá nhân sự', icon: 'Star', to: '/evaluation' },
    {
      key: 'workflow', label: 'Workflow', icon: 'Folder',
      children: [
        { key: 'project', label: 'Dự án', to: '/workflow/project' },
      ],
    },
    {
      key: 'recruitment', label: 'Tuyển dụng', icon: 'UserPlus',
      children: [
        { key: 'manage-recruitment', label: 'Quản lý tin tuyển dụng', to: '/recruitment' },
      ],
    },
    {
      key: 'request', label: 'Yêu cầu', icon: 'Timer',
      children: [
        { key: 'overtime', label: 'Tăng ca', to: '/request/overtime' },
      ],
    },
  ],
  system: [
    { key: 'setting', label: 'Cài đặt hệ thống', icon: 'Sliders', to: '/settings' },
  ],
};

const NavGroupLabel = ({ children }) => (
  <div className="px-3 pt-4 pb-1.5 text-[10.5px] font-semibold tracking-[0.14em] uppercase text-muted-foreground/70 font-heading">
    {children}
  </div>
);

const NavLink = ({ item, active, onClick }) => {
  const Ic = Icon[item.icon];
  return (
    <button
      onClick={onClick}
      data-active={active}
      style={!active ? { color: 'hsl(var(--foreground) / 0.82)' } : undefined}
      className={
        'nav-item w-full group flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium ' +
        (active ? 'sidebar-item-active' : '')
      }
    >
      {Ic && <span className="nav-ico"><Ic size={16} /></span>}
      <span className="flex-1 text-left truncate">{item.label}</span>
    </button>
  );
};

const NavCollapsible = ({ item, activeChild, onChild }) => {
  const [open, setOpen] = React.useState(!!activeChild);
  const Ic = Icon[item.icon];
  React.useEffect(() => { if (activeChild) setOpen(true); }, [activeChild]);
  return (
    <div>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ color: 'hsl(var(--foreground) / 0.82)' }}
        className={
          'nav-item w-full group flex items-center gap-3 rounded-lg px-3 py-2 text-[13.5px] font-medium'
        }
      >
        {Ic && <span className="nav-ico"><Ic size={16} /></span>}
        <span className="flex-1 text-left truncate">{item.label}</span>
        <Icon.ChevronRight size={14} className={'transition-transform duration-200 ' + (open ? 'rotate-90' : '')} />
      </button>
      <div
        className="overflow-hidden transition-[max-height] duration-300"
        style={{ maxHeight: open ? `${item.children.length * 40}px` : 0 }}
      >
        <div className="mt-1 ml-3 pl-3 border-l border-border/70 space-y-0.5">
          {item.children.map(c => (
            <button
              key={c.key}
              onClick={() => onChild(c)}
              data-active={activeChild === c.key}
              style={activeChild !== c.key ? { color: 'hsl(var(--foreground) / 0.72)' } : undefined}
              className={
                'nav-item is-sub w-full flex items-center gap-2.5 text-left rounded-md px-2.5 py-1.5 text-[12.5px] ' +
                (activeChild === c.key
                  ? 'sidebar-item-active'
                  : '')
              }
            >
              <span className="nav-dot" />
              <span className="flex-1 truncate">{c.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const Sidebar = ({ activeRoute, onNavigate }) => {
  const isActive = (to) => activeRoute === to;
  const activeChildKey = (item) => item.children?.find(c => isActive(c.to))?.key;
  return (
    <aside className="sidebar-bg w-[260px] shrink-0 h-svh sticky top-0 border-r border-border/60 flex flex-col">
      {/* Logo */}
      <div className="h-14 px-5 flex items-center gap-2.5 border-b border-border/60">
        <img src=window.__resources && window.__resources.logoImg || "assets/logo.png" alt="VNLab" className="h-7 w-auto select-none" draggable="false" />
        <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-muted-foreground/60 mt-0.5">ERP</span>
      </div>
      {/* Nav scroll */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin px-2 pb-6">
        <NavGroupLabel>Tổng quan</NavGroupLabel>
        <div className="space-y-0.5">
          {NAV.overview.map(item => (
            <NavLink key={item.key} item={item} active={isActive(item.to)} onClick={() => onNavigate(item.to)} />
          ))}
        </div>

        <NavGroupLabel>Module</NavGroupLabel>
        <div className="space-y-0.5">
          {NAV.module.map(item =>
            item.children ? (
              <NavCollapsible
                key={item.key}
                item={item}
                activeChild={activeChildKey(item)}
                onChild={c => onNavigate(c.to)}
              />
            ) : (
              <NavLink key={item.key} item={item} active={isActive(item.to)} onClick={() => onNavigate(item.to)} />
            )
          )}
        </div>

        <NavGroupLabel>Hệ thống</NavGroupLabel>
        <div className="space-y-0.5">
          {NAV.system.map(item => (
            <NavLink key={item.key} item={item} active={isActive(item.to)} onClick={() => onNavigate(item.to)} />
          ))}
        </div>
      </nav>

      {/* Footer mini card — version + status */}
      <div className="mx-3 mb-3 rounded-xl border border-border/70 bg-card/60 backdrop-blur p-3">
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          <span className="relative inline-flex h-1.5 w-1.5">
            <span className="absolute inset-0 rounded-full bg-emerald-500 live-dot" />
          </span>
          <span>Tất cả hệ thống hoạt động</span>
        </div>
        <div className="mt-1.5 text-[10.5px] font-mono text-muted-foreground/70">v3.4.1 · build 1788</div>
      </div>
    </aside>
  );
};

window.Sidebar = Sidebar;
