/* Router + screen picker for the pre-login flow */

const AUTH_FLOW = [
  { k: 'landing', label: 'Landing' },
  { k: 'find-org', label: 'Chọn tổ chức' },
  { k: 'login', label: 'Đăng nhập' },
  { k: 'register-org', label: 'Đăng ký tổ chức' },
  { k: 'verify', label: 'Xác thực email' },
  { k: 'create-org', label: 'Hoàn tất tổ chức' },
  { k: 'join', label: 'Yêu cầu tham gia' },
  { k: 'forgot', label: 'Quên mật khẩu' },
  { k: 'reset', label: 'Đặt lại mật khẩu' },
  { k: 'sent', label: 'Đã gửi yêu cầu' },
  { k: 'signed-in', label: 'Thành công' },
];

const AuthApp = () => {
  const [screen, setScreen] = React.useState(() => localStorage.getItem('erp-auth-screen') || 'landing');
  const [org, setOrg] = React.useState(ORG_DB[0]);
  React.useEffect(() => {
    const reveal = () => {
      document.querySelectorAll('[data-animate]').forEach((el) => {
        if (el.getBoundingClientRect().top < window.innerHeight + 80 && !el.classList.contains('is-visible')) el.classList.add('is-visible');
      });
    };
    requestAnimationFrame(reveal);
    const t = setTimeout(reveal, 200);
    window.addEventListener('scroll', reveal, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener('scroll', reveal); };
  }, [screen]);

  const go = (k) => { setScreen(k); localStorage.setItem('erp-auth-screen', k); window.scrollTo(0, 0); };

  const view = {
    landing: <LandingScreen go={go} />,
    'find-org': <FindOrgScreen go={go} setOrg={setOrg} />,
    login: <LoginScreen go={go} org={org} />,
    'register-org': <RegisterOrgScreen go={go} />,
    verify: <VerifyScreen go={go} />,
    'create-org': <CreateOrgScreen go={go} />,
    join: <JoinScreen go={go} org={org} />,
    forgot: <ForgotScreen go={go} />,
    reset: <ResetScreen go={go} />,
    sent: <StatusScreen go={go} kind="sent" />,
    'signed-in': <StatusScreen go={go} kind="signed-in" />,
  }[screen];

  return (
    <div className="min-h-svh flex flex-col">
      <div className="flex-1 flex flex-col">{view}</div>

      {/* screen picker */}
      <div className="sticky bottom-0 z-40 border-t border-line bg-white/90 backdrop-blur">
        <div className="flex items-center gap-2 px-4 py-2.5 overflow-x-auto scrollbar-thin">
          <span className="text-[10.5px] font-semibold uppercase tracking-[0.14em] text-slate-400 shrink-0 pr-1">Luồng</span>
          {AUTH_FLOW.map((s, i) => (
            <button
              key={s.k}
              onClick={() => go(s.k)}
              className={'shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition-colors ' + (screen === s.k ? 'bg-ink text-white font-semibold' : 'text-slate-500 hover:bg-slate-100')}>
              <span className={'font-mono text-[10px] ' + (screen === s.k ? 'text-white/60' : 'text-slate-400')}>{String(i + 1).padStart(2, '0')}</span>{s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<AuthApp />);
