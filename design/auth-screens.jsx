/* Auth screens: find-org → login → register-org → verify → create-org → join → forgot → reset */

const ORG_RECENT = [
  { name: 'VNLab Technology', tag: 'vnlab', members: 128, color: 'hsl(203 89% 48%)' },
  { name: 'Minh Phát Logistics', tag: 'minhphat', members: 46, color: 'hsl(262 60% 55%)' },
];

const ORG_DB = [
  { name: 'VNLab Technology', tag: 'vnlab', id: 1, members: 128, plan: 'Doanh nghiệp', color: 'hsl(203 89% 48%)' },
  { name: 'VNLab Japan K.K.', tag: 'vnlab-jp', id: 2, members: 34, plan: 'Tăng trưởng', color: 'hsl(160 60% 38%)' },
];

const OrgAvatar = ({ name, color, size = 40 }) => (
  <span className="rounded-xl flex items-center justify-center font-heading font-bold text-white shrink-0"
    style={{ width: size, height: size, background: color, fontSize: size * 0.34 }}>
    {name.split(' ').slice(0, 2).map((w) => w[0]).join('')}
  </span>
);

/* 1 — chọn tổ chức */
const FindOrgScreen = ({ go, setOrg }) => {
  const [q, setQ] = React.useState('');
  const [results, setResults] = React.useState(null);
  const search = () => {
    const term = q.trim().toLowerCase();
    setResults(term ? ORG_DB.filter((o) => o.tag.includes(term) || o.name.toLowerCase().includes(term)) : []);
  };
  const pick = (o) => { setOrg(o); go('login'); };

  return (
    <AuthLayout onHome={() => go('landing')}
      step={0}
      eyebrow="Bước 1 / 2"
      title="Tổ chức của bạn là gì?"
      sub="Nhập mã tổ chức do quản trị viên cung cấp — ví dụ vnlab, minhphat."
      footer={<span>Tổ chức chưa có trên Micro ERP? <TextLink onClick={() => go('register-org')}>Đăng ký tổ chức mới</TextLink></span>}>
      <div className="space-y-3.5">
        <Field label="Mã tổ chức" icon="Tag" value={q} onChange={setQ} placeholder="vnlab" autoFocus
          hint={results && results.length === 0 ? undefined : 'Mã nằm trong email mời của quản trị viên.'}
          error={results && results.length === 0 ? 'Không tìm thấy tổ chức nào khớp với mã này.' : ''} />
        <PrimaryBtn onClick={search} disabled={q.trim().length < 2}>Tiếp tục</PrimaryBtn>
      </div>

      {results && results.length > 0 && (
        <div className="mt-6">
          <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">Kết quả</p>
          <ul className="mt-2.5 space-y-2">
            {results.map((o) => (
              <li key={o.id}>
                <button onClick={() => pick(o)} className="w-full flex items-center gap-3 rounded-xl border border-line bg-white p-3 text-left hover:border-primary hover:shadow-[0_8px_24px_-14px_rgba(15,26,48,0.35)] transition-all">
                  <OrgAvatar name={o.name} color={o.color} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-semibold text-ink truncate">{o.name}</span>
                    <span className="block text-[11.5px] text-slate-500 font-mono">{o.tag} · {o.members} thành viên</span>
                  </span>
                  <AIcon.Arrow size={16} className="text-slate-400" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-7">
        <p className="text-[11.5px] font-semibold uppercase tracking-[0.14em] text-slate-400">Đã đăng nhập gần đây</p>
        <ul className="mt-2.5 space-y-2">
          {ORG_RECENT.map((o) => (
            <li key={o.tag}>
              <button onClick={() => pick(o)} className="w-full flex items-center gap-3 rounded-xl bg-slate-50 p-2.5 text-left hover:bg-slate-100 transition-colors">
                <OrgAvatar name={o.name} color={o.color} size={34} />
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-ink truncate">{o.name}</span>
                  <span className="block text-[11px] text-slate-500 font-mono">{o.tag}</span>
                </span>
                <AIcon.Arrow size={15} className="text-slate-400" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </AuthLayout>
  );
};

/* 2 — đăng nhập */
const LoginScreen = ({ go, org }) => {
  const [email, setEmail] = React.useState('');
  const [pw, setPw] = React.useState('');
  const [err, setErr] = React.useState('');
  const submit = () => {
    if (!email.includes('@') || pw.length < 6) { setErr('Email hoặc mật khẩu không đúng.'); return; }
    setErr(''); go('signed-in');
  };
  return (
    <AuthLayout onHome={() => go('landing')}
      step={1}
      back="Đổi tổ chức"
      onBack={() => go('find-org')}
      eyebrow="Bước 2 / 2"
      title="Đăng nhập"
      sub="Dùng email công ty của bạn trong tổ chức này."
      footer={<span>Chưa có tài khoản trong tổ chức? <TextLink onClick={() => go('join')}>Gửi yêu cầu tham gia</TextLink></span>}>
      <div className="mb-5 flex items-center gap-3 rounded-xl border border-line bg-slate-50 p-2.5">
        <OrgAvatar name={org.name} color={org.color} size={34} />
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-ink truncate">{org.name}</span>
          <span className="block text-[11px] text-slate-500 font-mono">{org.tag}</span>
        </span>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full"><AIcon.Check size={11} />Đã chọn</span>
      </div>

      {err && <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-[12.5px] text-rose-700">{err}</div>}

      <div className="space-y-3.5">
        <Field label="Email" icon="Mail" type="email" value={email} onChange={setEmail} placeholder="ten@congty.vn" autoFocus />
        <Field label="Mật khẩu" icon="Lock" type="password" value={pw} onChange={setPw}
          right={<TextLink onClick={() => go('forgot')}>Quên mật khẩu?</TextLink>} />
        <label className="flex items-center gap-2 text-[12.5px] text-slate-600 select-none cursor-pointer">
          <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-line accent-[hsl(var(--primary-h)_var(--primary-s)_48%)]" />
          Ghi nhớ tôi trên thiết bị này
        </label>
        <PrimaryBtn onClick={submit}>Đăng nhập</PrimaryBtn>
        <Divider label="hoặc" />
        <GhostBtn icon="Google" onClick={() => go('signed-in')}>Đăng nhập bằng Google</GhostBtn>
      </div>
    </AuthLayout>
  );
};

/* 3 — đăng ký tổ chức */
const RegisterOrgScreen = ({ go }) => {
  const [email, setEmail] = React.useState('');
  const [name, setName] = React.useState('');
  const [agree, setAgree] = React.useState(false);
  return (
    <AuthLayout onHome={() => go('landing')}
      back="Về trang chủ"
      onBack={() => go('landing')}
      eyebrow="Tổ chức mới"
      title="Đăng ký tổ chức"
      sub="Chúng tôi gửi liên kết xác thực tới email quản trị. Chưa cần thẻ thanh toán."
      footer={<span>Đã có tổ chức? <TextLink onClick={() => go('find-org')}>Đăng nhập</TextLink></span>}>
      <div className="space-y-3.5">
        <Field label="Tên tổ chức" icon="Building" value={name} onChange={setName} placeholder="Công ty TNHH ABC" autoFocus />
        <Field label="Email quản trị" icon="Mail" type="email" value={email} onChange={setEmail} placeholder="admin@congty.vn" hint="Email này sẽ là tài khoản quản trị đầu tiên." />
        <label className="flex items-start gap-2.5 text-[12.5px] leading-relaxed text-slate-600 select-none cursor-pointer">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-line accent-[hsl(var(--primary-h)_var(--primary-s)_48%)]" />
          <span>Tôi đồng ý với <a href="#" className="text-primary font-semibold hover:underline">Điều khoản dịch vụ</a> và <a href="#" className="text-primary font-semibold hover:underline">Chính sách bảo mật</a>.</span>
        </label>
        <PrimaryBtn onClick={() => go('verify')} disabled={!name || !email.includes('@') || !agree}>Gửi liên kết xác thực</PrimaryBtn>
      </div>
      <ul className="mt-6 space-y-2">
        {['Dùng thử 30 ngày đầy đủ tính năng', 'Nhập dữ liệu nhân sự từ Excel', 'Huỷ bất cứ lúc nào'].map((t) => (
          <li key={t} className="flex items-center gap-2 text-[12.5px] text-slate-600"><span className="h-4 w-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center"><AIcon.Check size={10} /></span>{t}</li>
        ))}
      </ul>
    </AuthLayout>
  );
};

/* 4 — xác thực email (OTP) */
const VerifyScreen = ({ go }) => {
  const [code, setCode] = React.useState(['', '', '', '', '', '']);
  const refs = React.useRef([]);
  const filled = code.every((c) => c);
  const setAt = (i, v) => {
    const d = v.replace(/\D/g, '').slice(-1);
    setCode((c) => { const n = [...c]; n[i] = d; return n; });
    if (d && refs.current[i + 1]) refs.current[i + 1].focus();
  };
  return (
    <AuthLayout onHome={() => go('landing')}
      back="Quay lại"
      onBack={() => go('register-org')}
      eyebrow="Xác thực"
      title="Kiểm tra hộp thư của bạn"
      sub="Chúng tôi đã gửi mã 6 số tới admin@congty.vn. Mã hết hạn sau 10 phút.">
      <div className="flex gap-2">
        {code.map((c, i) => (
          <input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            value={c}
            onChange={(e) => setAt(i, e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Backspace' && !c && refs.current[i - 1]) refs.current[i - 1].focus(); }}
            inputMode="numeric"
            className="h-14 flex-1 min-w-0 rounded-xl border border-line bg-white text-center font-heading text-[20px] font-bold text-ink outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary-h)_var(--primary-s)_57%_/_0.14)] transition-shadow" />
        ))}
      </div>
      <div className="mt-5 space-y-3">
        <PrimaryBtn onClick={() => go('create-org')} disabled={!filled}>Xác thực</PrimaryBtn>
        <p className="text-center text-[12.5px] text-slate-500">Không nhận được mã? <TextLink onClick={() => {}}>Gửi lại</TextLink> · <TextLink onClick={() => go('register-org')}>Đổi email</TextLink></p>
      </div>
    </AuthLayout>
  );
};

/* 5 — hoàn tất tạo tổ chức */
const CreateOrgScreen = ({ go }) => {
  const [f, setF] = React.useState({ name: 'Công ty TNHH ABC', code: 'abc-company', full: '', pw: '' });
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  const rules = [
    { label: '8+ ký tự', ok: f.pw.length >= 8 },
    { label: 'Chữ hoa & thường', ok: /[a-z]/.test(f.pw) && /[A-Z]/.test(f.pw) },
    { label: 'Có chữ số', ok: /[0-9]/.test(f.pw) },
    { label: 'Ký tự đặc biệt', ok: /[^A-Za-z0-9\s]/.test(f.pw) },
  ];
  const passed = rules.filter((r) => r.ok).length;
  return (
    <AuthLayout onHome={() => go('landing')}
      wide
      eyebrow="Bước cuối"
      title="Hoàn tất tổ chức của bạn"
      sub="Thông tin này xuất hiện trên hợp đồng, phiếu lương và email hệ thống."
      back="Quay lại"
      onBack={() => go('verify')}>
      <div className="grid sm:grid-cols-2 gap-3.5">
        <Field label="Tên tổ chức" icon="Building" value={f.name} onChange={set('name')} />
        <Field label="Mã tổ chức" icon="Tag" value={f.code} onChange={set('code')} hint="Dùng để đăng nhập." />
        <div className="sm:col-span-2"><Field label="Họ tên quản trị viên" icon="User" value={f.full} onChange={set('full')} placeholder="Nguyễn Văn A" /></div>
        <div className="sm:col-span-2">
          <Field label="Mật khẩu" icon="Lock" type="password" value={f.pw} onChange={set('pw')} />
          {f.pw && (
            <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1.5">
              {rules.map((r) => (
                <span key={r.label} className={'inline-flex items-center gap-1.5 text-[11.5px] ' + (r.ok ? 'text-emerald-700' : 'text-slate-400')}>
                  <span className={'h-3.5 w-3.5 rounded-full flex items-center justify-center ' + (r.ok ? 'bg-emerald-500 text-white' : 'border border-line')}>{r.ok && <AIcon.Check size={8} />}</span>{r.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-6"><PrimaryBtn onClick={() => go('signed-in')} disabled={!f.full || passed < 4}>Tạo tổ chức &amp; vào hệ thống</PrimaryBtn></div>
    </AuthLayout>
  );
};

/* 6 — yêu cầu tham gia */
const JoinScreen = ({ go, org }) => {
  const [f, setF] = React.useState({ full: '', email: '', phone: '', msg: '' });
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }));
  return (
    <AuthLayout onHome={() => go('landing')}
      back="Về đăng nhập"
      onBack={() => go('login')}
      eyebrow="Thành viên mới"
      title="Yêu cầu tham gia tổ chức"
      sub={`Quản trị viên của ${org.name} sẽ nhận yêu cầu và cấp tài khoản cho bạn.`}
      wide>
      <div className="grid sm:grid-cols-2 gap-3.5">
        <Field label="Họ và tên" icon="User" value={f.full} onChange={set('full')} placeholder="Nguyễn Văn A" autoFocus />
        <Field label="Số điện thoại" icon="Phone" value={f.phone} onChange={set('phone')} placeholder="0901234567" />
        <div className="sm:col-span-2"><Field label="Email công ty" icon="Mail" type="email" value={f.email} onChange={set('email')} placeholder="ten@congty.vn" /></div>
        <label className="sm:col-span-2 block">
          <span className="text-[12.5px] font-semibold text-ink">Lời nhắn cho quản trị viên</span>
          <textarea value={f.msg} onChange={(e) => set('msg')(e.target.value)} rows="3" placeholder="Tôi là nhân viên mới phòng Kỹ thuật, bắt đầu từ 01/08."
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-slate-400 outline-none focus:border-primary focus:shadow-[0_0_0_3px_hsl(var(--primary-h)_var(--primary-s)_57%_/_0.14)] transition-shadow resize-none" />
        </label>
      </div>
      <div className="mt-5"><PrimaryBtn onClick={() => go('sent')} disabled={!f.full || !f.email.includes('@')}>Gửi yêu cầu</PrimaryBtn></div>
    </AuthLayout>
  );
};

/* 7 — quên mật khẩu */
const ForgotScreen = ({ go }) => {
  const [email, setEmail] = React.useState('');
  return (
    <AuthLayout onHome={() => go('landing')}
      back="Về đăng nhập"
      onBack={() => go('login')}
      eyebrow="Khôi phục"
      title="Quên mật khẩu?"
      sub="Nhập email của bạn, chúng tôi sẽ gửi liên kết đặt lại mật khẩu."
      footer={<span>Vẫn không vào được? <TextLink onClick={() => {}}>Liên hệ quản trị viên</TextLink></span>}>
      <div className="space-y-3.5">
        <Field label="Email" icon="Mail" type="email" value={email} onChange={setEmail} placeholder="ten@congty.vn" autoFocus />
        <PrimaryBtn onClick={() => go('reset')} disabled={!email.includes('@')}>Gửi liên kết đặt lại</PrimaryBtn>
      </div>
    </AuthLayout>
  );
};

/* 8 — đặt lại mật khẩu */
const ResetScreen = ({ go }) => {
  const [pw, setPw] = React.useState('');
  const [c2, setC2] = React.useState('');
  const rules = [
    { label: 'Tối thiểu 8 ký tự', ok: pw.length >= 8 },
    { label: 'Có chữ hoa và chữ thường', ok: /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
    { label: 'Có ít nhất 1 chữ số', ok: /[0-9]/.test(pw) },
    { label: 'Có ký tự đặc biệt', ok: /[^A-Za-z0-9\s]/.test(pw) },
  ];
  const passed = rules.filter((r) => r.ok).length;
  const bar = ['hsl(220 14% 91%)', 'hsl(0 72% 55%)', 'hsl(35 90% 50%)', 'hsl(203 89% 48%)', 'hsl(160 60% 40%)'][passed];
  const mismatch = c2.length > 0 && c2 !== pw;
  return (
    <AuthLayout onHome={() => go('landing')} eyebrow="Khôi phục" title="Đặt lại mật khẩu" sub="Mật khẩu mới sẽ áp dụng cho tất cả thiết bị của bạn.">
      <div className="space-y-3.5">
        <Field label="Mật khẩu mới" icon="Lock" type="password" value={pw} onChange={setPw} autoFocus />
        {pw && (
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden"><span className="block h-full rounded-full transition-all" style={{ width: passed / 4 * 100 + '%', background: bar }} /></span>
              <span className="text-[11.5px] font-semibold" style={{ color: bar }}>{['Rất yếu', 'Yếu', 'Trung bình', 'Khá', 'Mạnh'][passed]}</span>
            </div>
            <ul className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
              {rules.map((r) => (
                <li key={r.label} className={'flex items-center gap-1.5 text-[11.5px] ' + (r.ok ? 'text-ink' : 'text-slate-400')}>
                  <span className={'h-3.5 w-3.5 rounded-full flex items-center justify-center shrink-0 ' + (r.ok ? 'bg-emerald-500 text-white' : 'border border-line')}>{r.ok && <AIcon.Check size={8} />}</span>{r.label}
                </li>
              ))}
            </ul>
          </div>
        )}
        <Field label="Xác nhận mật khẩu" icon="Lock" type="password" value={c2} onChange={setC2} error={mismatch ? 'Mật khẩu xác nhận chưa khớp.' : ''} />
        <PrimaryBtn onClick={() => go('login')} disabled={passed < 4 || mismatch || !c2}>Cập nhật mật khẩu</PrimaryBtn>
      </div>
    </AuthLayout>
  );
};

/* 9 — trạng thái kết quả */
const StatusScreen = ({ go, kind }) => {
  const map = {
    sent: { icon: 'Mail', tone: 'primary', title: 'Đã gửi yêu cầu', sub: 'Quản trị viên sẽ phê duyệt trong vòng 1 ngày làm việc. Bạn nhận email khi tài khoản được cấp.', cta: 'Về trang đăng nhập', to: 'login' },
    'signed-in': { icon: 'Check', tone: 'emerald', title: 'Đăng nhập thành công', sub: 'Đang chuyển bạn tới bảng điều khiển của tổ chức…', cta: 'Mở bảng điều khiển', to: 'admin' },
  }[kind];
  const tone = map.tone === 'emerald' ? { bg: 'hsl(152 60% 95%)', fg: 'hsl(155 60% 32%)' } : { bg: 'hsl(203 89% 95%)', fg: 'hsl(203 89% 40%)' };
  return (
    <AuthLayout onHome={() => go('landing')} title={map.title} sub={map.sub}>
      <div className="-mt-2">
        <span className="h-14 w-14 rounded-2xl flex items-center justify-center" style={{ background: tone.bg, color: tone.fg }}>{React.createElement(AIcon[map.icon], { size: 26 })}</span>
        <div className="mt-6">
          {map.to === 'admin' ? (
            <a href="ui_kits/erp-admin/index.html" className="group w-full h-11 rounded-[10px] text-white text-[13.5px] font-bold inline-flex items-center justify-center gap-2 transition-all hover:-translate-y-px" style={{ background: 'linear-gradient(135deg,#109cf1,#1565c0)', boxShadow: '0 4px 20px rgba(16,156,241,0.4)' }}>
              {map.cta}<span className="transition-transform group-hover:translate-x-0.5"><AIcon.Arrow size={15} /></span>
            </a>
          ) : (
            <PrimaryBtn onClick={() => go(map.to)}>{map.cta}</PrimaryBtn>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

Object.assign(window, { FindOrgScreen, LoginScreen, RegisterOrgScreen, VerifyScreen, CreateOrgScreen, JoinScreen, ForgotScreen, ResetScreen, StatusScreen, OrgAvatar, ORG_DB });
