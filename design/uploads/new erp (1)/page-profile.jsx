/* HRM > Hồ sơ nhân viên — full profile view + edit drawer */

// ── Static profile data (keyed by member id) ─────────────────────

const PROFILES = {
  1: {
    id: 1, empId: '0001', name: 'Nguyễn Văn An', role: 'Senior Frontend Engineer',
    status: 'active', branch: 'Hà Nội', join: '15/01/2022', birthday: '04/08/1994',
    gender: 'Nam', rank: 'S', jp: 'N2', dept: 'System Development Dept.',
    jobTitle: 'Kỹ sư / Senior', workplace: 'Hà Nội – Tầng 7, 123 Cầu Giấy',
    email: 'an.nguyen@vnlab.vn', personalEmail: 'nguyenvanan94@gmail.com',
    phone: '0912 345 678', marital: 'Độc thân',
    identity: '038094001234', idType: 'CCCD', idDate: '12/03/2019',
    idPlace: 'Cục QLXNC – Bộ Công An', birthPlace: 'Hà Nội',
    nationality: 'Việt Nam', ethnicity: 'Kinh', religion: 'Không',
    taxCode: '8734561290',
    permanentAddress: '45 Ngõ 12 Đội Cấn, Ba Đình, Hà Nội',
    currentAddress: '123 Trần Duy Hưng, Cầu Giấy, Hà Nội',
    bankAccount: '0123456789012', insurance: 'HN-123456',
    emergency: { name: 'Nguyễn Thị Hương', relation: 'Mẹ', phone: '0934 567 890', address: '45 Ngõ 12 Đội Cấn, Ba Đình, Hà Nội' },
    education: [
    { school: 'ĐH Bách Khoa Hà Nội', major: 'Khoa học Máy tính', level: 'Đại học', grade: 'Khá', period: '09/2012 – 06/2016', cert: 'Bằng Kỹ sư CNTT' },
    { school: 'Coursera / Google', major: 'Cloud Engineering', level: 'Chứng chỉ', grade: 'Pass', period: '03/2022 – 06/2022', cert: 'Google Cloud Professional' }],

    experience: [
    { company: 'FPT Software', period: '07/2016 – 08/2019', projects: [
      { name: 'E-commerce Platform', position: 'Frontend Developer', period: '2016–2017', tech: 'ReactJS, Redux, REST API' },
      { name: 'Banking System UI', position: 'Senior Frontend', period: '2017–2019', tech: 'Vue.js, Vuex, TypeScript' }]
    },
    { company: 'VNLab (GMO-Z.com Vietnam Lab Center)', period: '01/2022 – nay', projects: [
      { name: 'Cổng thanh toán XYZ', position: 'Tech Lead', period: '2022–nay', tech: 'Vue.js, Node.js, AWS, BrSE liaison' },
      { name: 'Micro ERP', position: 'Senior Frontend', period: '2024–nay', tech: 'Vue 3, Nuxt 3, Tailwind CSS' }]
    }],

    languages: [
    { name: 'Tiếng Anh', level: 'Thành thạo', cert: 'IELTS 7.0' },
    { name: 'Tiếng Nhật', level: 'Trung cấp', cert: 'JLPT N2' }],

    skills: [
    { name: 'ReactJS / Vue.js', years: 6 },
    { name: 'TypeScript', years: 4 },
    { name: 'Node.js / Express', years: 3 },
    { name: 'AWS / Docker', years: 2 },
    { name: 'Figma / UI Design', years: 3 }],

    technologies: ['Vue.js', 'React', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'Tailwind', 'PostgreSQL'],
    awards: [
    { title: 'Best Employee Q2/2023', desc: 'Đạt rank S, vượt KPI dự án 120%.' },
    { title: 'Star of the Year 2022', desc: 'Onboard nhanh chóng và mentor team junior xuất sắc.' }],

    introduce: 'Kỹ sư frontend với 7+ năm kinh nghiệm xây dựng sản phẩm web tại Việt Nam và Nhật Bản. Đam mê UX, design systems và kiến trúc frontend scalable. Thích chia sẻ kiến thức và mentor đồng nghiệp.'
  }
};

const RANK_COLOR = { S: '#0ea5e9', A: '#22c55e', B: '#a3a3a3', C: '#eab308', D: '#f97316', E: '#ef4444' };
const STATUS_META = {
  active: { label: 'Đang làm việc', variant: 'green' },
  onboarding: { label: 'Đang onboard', variant: 'amber' },
  leave: { label: 'Nghỉ phép', variant: 'sky' },
  inactive: { label: 'Đã nghỉ việc', variant: 'gray' }
};

// Build fallback profiles from MEMBERS (defined in page-member.jsx)
const getProfile = (id) => {
  if (PROFILES[id]) return PROFILES[id];
  if (typeof MEMBERS !== 'undefined') {
    const m = MEMBERS.find((x) => x.id === id);
    if (m) return { ...m, empId: String(m.id).padStart(4, '0'), dept: '—', jobTitle: m.role, workplace: '—', marital: '—', identity: '—', idType: '—', idDate: '—', idPlace: '—', birthPlace: '—', nationality: 'Việt Nam', ethnicity: 'Kinh', religion: 'Không', taxCode: '—', permanentAddress: '—', currentAddress: '—', bankAccount: '—', insurance: '—', personalEmail: m.email, emergency: { name: '—', relation: '—', phone: '—', address: '—' }, education: [], experience: [], languages: [], skills: [], technologies: [], awards: [], introduce: '' };
  }
  return PROFILES[1];
};

// ── Field display primitive ───────────────────────────────────────
const PF = ({ label, value, wide }) =>
<div className={wide ? 'col-span-2' : ''}>
    <p className="text-[10.5px] uppercase tracking-[0.1em] font-semibold text-muted-foreground mb-1">{label}</p>
    <p className="text-[13.5px] text-foreground">{value || <span className="text-muted-foreground/50">—</span>}</p>
  </div>;


// ── Edit Drawer ───────────────────────────────────────────────────
const EditDrawer = ({ p, onClose }) => {
  const [form, setForm] = React.useState({ ...p });
  const [saving, setSaving] = React.useState(false);
  const upd = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const SI = ({ k, placeholder, type = 'text' }) =>
  <input type={type} value={form[k] || ''} onChange={upd(k)} placeholder={placeholder}
  className="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 placeholder:text-muted-foreground/40" />;

  const SL = ({ label, req, children }) =>
  <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground">
        {label}{req && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>;


  const save = () => {
    setSaving(true);
    setTimeout(() => {setSaving(false);onClose();}, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background border-l border-border w-full max-w-2xl h-full flex flex-col rise" style={{ animationDuration: '.3s' }}>

        <div className="px-6 py-4 border-b border-border shrink-0 flex items-center justify-between">
          <div>
            <h3 className="font-heading font-bold text-[16px] text-foreground">Chỉnh sửa hồ sơ</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">{p.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted text-muted-foreground"><Icon.X size={15} /></button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5 space-y-7">

          {/* General */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] font-bold text-muted-foreground/70 mb-3 pb-2 border-b border-border/60">Thông tin chung</p>
            <div className="grid grid-cols-2 gap-4">
              <SL label="Họ và tên" req><SI k="name" placeholder="Nguyễn Văn An" /></SL>
              <SL label="Mã nhân viên"><SI k="empId" placeholder="0001" /></SL>
              <SL label="Chi nhánh">
                <Select value={form.branch || ''} onChange={upd('branch')} width="100%" placeholder={null}
                  options={['Hà Nội','Đà Nẵng','Hồ Chí Minh','Osaka'].map(b=>({value:b,label:b}))} />
              </SL>
              <SL label="Ngày sinh"><SI k="birthday" placeholder="dd/mm/yyyy" /></SL>
              <SL label="Giới tính">
                <Select value={form.gender || ''} onChange={upd('gender')} width="100%" placeholder="— Chọn —"
                  options={[{value:'Nam',label:'Nam'},{value:'Nữ',label:'Nữ'}]} />
              </SL>
              <SL label="Ngày vào công ty"><SI k="join" placeholder="dd/mm/yyyy" /></SL>
              <SL label="Phòng ban"><SI k="dept" placeholder="System Development Dept." /></SL>
              <SL label="Vị trí / Chức danh"><SI k="jobTitle" /></SL>
              <SL label="Địa điểm làm việc"><div className="col-span-2"><SI k="workplace" /></div></SL>
            </div>
          </div>

          {/* Personal */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] font-bold text-muted-foreground/70 mb-3 pb-2 border-b border-border/60">Thông tin cá nhân</p>
            <div className="grid grid-cols-2 gap-4">
              <SL label="Tình trạng hôn nhân"><SI k="marital" /></SL>
              <SL label="Email cá nhân"><SI k="personalEmail" type="email" /></SL>
              <SL label="Số điện thoại"><SI k="phone" /></SL>
              <SL label="Số CMND/CCCD"><SI k="identity" /></SL>
              <SL label="Loại giấy tờ">
                <Select value={form.idType || ''} onChange={upd('idType')} width="100%" placeholder={null}
                  options={[{value:'CCCD',label:'CCCD'},{value:'CMND',label:'CMND'}]} />
              </SL>
              <SL label="Ngày cấp"><SI k="idDate" /></SL>
              <SL label="Nơi cấp"><SI k="idPlace" /></SL>
              <SL label="Mã số thuế"><SI k="taxCode" /></SL>
              <SL label="Hộ khẩu thường trú"><div className="col-span-2"><SI k="permanentAddress" /></div></SL>
              <SL label="Địa chỉ hiện tại"><div className="col-span-2"><SI k="currentAddress" /></div></SL>
              <SL label="Số tài khoản VietcomBank"><SI k="bankAccount" /></SL>
              <SL label="Số sổ BHXH"><SI k="insurance" /></SL>
            </div>
          </div>

          {/* Emergency */}
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] font-bold text-muted-foreground/70 mb-3 pb-2 border-b border-border/60">Liên hệ khẩn cấp</p>
            <div className="grid grid-cols-2 gap-4">
              <SL label="Họ tên người liên hệ">
                <input value={form.emergency?.name || ''} onChange={(e) => setForm((f) => ({ ...f, emergency: { ...f.emergency, name: e.target.value } }))}
                className="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
              </SL>
              <SL label="Quan hệ">
                <input value={form.emergency?.relation || ''} onChange={(e) => setForm((f) => ({ ...f, emergency: { ...f.emergency, relation: e.target.value } }))}
                className="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
              </SL>
              <SL label="Điện thoại">
                <input value={form.emergency?.phone || ''} onChange={(e) => setForm((f) => ({ ...f, emergency: { ...f.emergency, phone: e.target.value } }))}
                className="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
              </SL>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/70 bg-muted/20 shrink-0">
          <Btn variant="ghost" size="sm" onClick={onClose}>Huỷ</Btn>
          <Btn variant="primary" size="sm" onClick={save}>
            {saving ? <span className="flex items-center gap-2"><span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Đang lưu…</span> : 'Xác nhận'}
          </Btn>
        </div>
      </div>
    </div>);

};

// ── Page root ────────────────────────────────────────────────────

const PageProfile = () => {
  const profileId = window.__profileMember?.id || 1;
  const p = React.useMemo(() => getProfile(profileId), [profileId]);

  const [tab, setTab] = React.useState('overview');
  const [editing, setEditing] = React.useState(false);
  const [toast, setToast] = React.useState('');

  const sm = STATUS_META[p.status] || STATUS_META.active;
  const rankColor = RANK_COLOR[p.rank] || '#a3a3a3';

  const goBack = () => {
    if (typeof window.__erp_navigate === 'function') window.__erp_navigate('/hrm/member');
  };

  // Hue derived from the user's name — shared by avatar & hero banner
  const avatarHue = (p.name || '').split('').reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 0);

  const TABS = [
  { k: 'overview', l: 'Tổng quan' },
  { k: 'education', l: 'Học vấn & Chứng chỉ' },
  { k: 'experience', l: 'Kinh nghiệm' },
  { k: 'skills', l: 'Kỹ năng & Ngôn ngữ' },
  { k: 'awards', l: 'Giải thưởng' }];


  return (
    <div className="space-y-6">

      {/* ── Hero ── */}
      <div className="card-surface overflow-hidden rise" style={{ animationDelay: '0ms', backgroundImage: `linear-gradient(180deg, hsl(${avatarHue} 52% 50% / 0.11), hsl(${avatarHue} 52% 50% / 0.11))` }}>
        {/* Banner — same soft tint as the rest of the card */}
        <div className="h-28 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20"
          style={{ backgroundImage: `radial-gradient(circle at 20% 50%, hsl(${avatarHue} 60% 60%) 0%, transparent 60%), radial-gradient(circle at 80% 20%, hsl(${avatarHue} 60% 65%) 0%, transparent 50%)` }} />
        </div>

        <div className="px-7 pb-6 relative z-10">
          {/* Avatar — overlaps banner */}
          <div className="flex items-end justify-between -mt-12 mb-4">
            <div className="flex items-end gap-5">
              <div className="h-24 w-24 rounded-2xl border-4 border-card shadow-lg flex items-center justify-center text-[28px] font-bold text-white font-heading shrink-0"
              style={{ background: `linear-gradient(135deg, hsl(${avatarHue} 70% 62%), hsl(${avatarHue} 70% 42%))` }}>
                {(p.name || '').split(' ').map((s) => s[0]).slice(-2).join('').toUpperCase()}
              </div>
              <div className="mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-heading font-bold text-[22px] text-foreground leading-tight">{p.name}</h1>
                  <Badge variant="gray">#{p.empId || String(p.id).padStart(4, '0')}</Badge>
                </div>
                <p className="text-[13.5px] text-muted-foreground mt-0.5">{p.jobTitle || p.role} · {p.dept || p.branch}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mb-1">
              <button onClick={goBack}
              className="h-8 px-3 rounded-md text-[12.5px] font-medium text-muted-foreground hover:bg-muted border border-border transition-colors inline-flex items-center gap-1.5">
                <Icon.ChevronRight size={12} className="rotate-180" /> Danh sách
              </button>
              <Btn variant="outline" size="sm" icon="FileText">Xuất PDF</Btn>
              <Btn variant="primary" size="sm" onClick={() => setEditing(true)}>Chỉnh sửa</Btn>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-border/60">
            <Badge variant={sm.variant} dot>{sm.label}</Badge>
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-foreground/80">
              <Icon.Building size={13} className="text-muted-foreground" /> {p.branch}
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-foreground/80">
              <Icon.Calendar size={13} className="text-muted-foreground" /> Vào {p.join}
            </span>
            {p.rank && p.rank !== '—' &&
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-foreground/80">
                <span className="inline-flex items-center justify-center w-5 h-5 rounded text-[10px] font-bold text-white" style={{ background: rankColor }}>{p.rank}</span>
                Rank {p.rank}
              </span>
            }
            {p.jp && p.jp !== '—' &&
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-foreground/80">
                <Icon.Globe size={13} className="text-muted-foreground" /> JLPT {p.jp}
              </span>
            }
          </div>
        </div>
      </div>

      {/* ── Tab strip ── */}
      <div className="border-b border-border/70">
        <div className="flex gap-6 flex-wrap">
          {TABS.map((t) =>
          <button key={t.k} onClick={() => setTab(t.k)} data-active={tab === t.k} className="tab-trigger text-[13.5px]">{t.l}</button>
          )}
        </div>
      </div>

      {/* ── Tab: Tổng quan ── */}
      {tab === 'overview' &&
      <div className="space-y-5 rise" style={{ animationDuration: '0.3s' }}>
          <div className="card-surface p-6">
            <h3 className="section-title mb-5">Thông tin liên hệ & Công việc</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-6">
              <PF label="Email công ty" value={p.email} />
              <PF label="Email cá nhân" value={p.personalEmail} />
              <PF label="Số điện thoại" value={p.phone} />
              <PF label="Phòng ban" value={p.dept} />
              <PF label="Chức danh" value={p.jobTitle} />
              <PF label="Địa điểm làm việc" value={p.workplace} wide />
            </div>

            <div className="mt-6 pt-5 border-t border-dashed border-border/70">
              <h3 className="section-title mb-5">Thông tin cá nhân</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-6">
                <PF label="Ngày sinh" value={p.birthday} />
                <PF label="Giới tính" value={p.gender} />
                <PF label="Tình trạng hôn nhân" value={p.marital} />
                <PF label="Nguyên quán / Nơi sinh" value={p.birthPlace} />
                <PF label="Số CMND/CCCD" value={p.identity} />
                <PF label="Loại giấy tờ" value={p.idType} />
                <PF label="Ngày cấp" value={p.idDate} />
                <PF label="Nơi cấp" value={p.idPlace} />
                <PF label="Quốc tịch" value={p.nationality} />
                <PF label="Dân tộc" value={p.ethnicity} />
                <PF label="Tôn giáo" value={p.religion} />
                <PF label="Mã số thuế" value={p.taxCode} />
                <PF label="Hộ khẩu thường trú" value={p.permanentAddress} wide />
                <PF label="Địa chỉ hiện tại" value={p.currentAddress} wide />
                <PF label="Số tài khoản VCB" value={p.bankAccount} />
                <PF label="Số sổ BHXH" value={p.insurance} />
              </div>
            </div>
          </div>

          {/* Emergency contact */}
          <div className="card-surface p-6">
            <h3 className="section-title mb-4">Liên hệ khẩn cấp</h3>
            <div className="flex items-start gap-5">
              <div className="h-11 w-11 rounded-xl bg-red-50 dark:bg-red-950/30 flex items-center justify-center shrink-0">
                <Icon.Phone size={16} className="text-red-500" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 flex-1">
                <PF label="Họ tên" value={p.emergency?.name} />
                <PF label="Quan hệ" value={p.emergency?.relation} />
                <PF label="Điện thoại" value={p.emergency?.phone} />
                <PF label="Địa chỉ" value={p.emergency?.address} wide />
              </div>
            </div>
          </div>
        </div>
      }

      {/* ── Tab: Học vấn ── */}
      {tab === 'education' &&
      <div className="space-y-4 rise" style={{ animationDuration: '0.3s' }}>
          {(p.education || []).length === 0 ?
        <div className="card-surface py-16 text-center text-muted-foreground"><Icon.Award size={36} className="mx-auto mb-2 opacity-30" /><p>Chưa có thông tin học vấn</p></div> :
        (p.education || []).map((ed, i) =>
        <div key={i} className="card-surface p-6 flex gap-5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'hsl(var(--primary-h) var(--primary-s) 57% / 0.1)', color: 'hsl(var(--primary))' }}>
                  <Icon.Award size={18} />
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
                    <div>
                      <h4 className="font-semibold text-[15px] text-foreground">{ed.school}</h4>
                      <p className="text-[13px] text-muted-foreground">{ed.major}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[12px] font-mono text-muted-foreground">{ed.period}</p>
                      <Badge variant="primary" className="mt-1">{ed.level}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <PF label="Xếp loại" value={ed.grade} />
                    <PF label="Chứng chỉ" value={ed.cert} wide />
                  </div>
                </div>
              </div>
        )
        }
        </div>
      }

      {/* ── Tab: Kinh nghiệm ── */}
      {tab === 'experience' &&
      <div className="space-y-5 rise" style={{ animationDuration: '0.3s' }}>
          {(p.experience || []).length === 0 ?
        <div className="card-surface py-16 text-center text-muted-foreground"><Icon.Briefcase size={36} className="mx-auto mb-2 opacity-30" /><p>Chưa có kinh nghiệm làm việc</p></div> :
        (p.experience || []).map((exp, i) =>
        <div key={i} className="card-surface overflow-hidden">
                {/* Company header */}
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border/70"
          style={{ background: 'linear-gradient(90deg, hsl(var(--primary-h) var(--primary-s) 57% / 0.05), transparent)' }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: `linear-gradient(135deg, hsl(${(i * 80 + 160) % 360} 65% 60%), hsl(${(i * 80 + 160) % 360} 65% 42%))` }}>
                    <Icon.Building size={14} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-[14px] text-foreground">{exp.company}</h4>
                    <p className="text-[11.5px] font-mono text-muted-foreground">{exp.period}</p>
                  </div>
                </div>
                {/* Projects table */}
                <table className="w-full text-[13px]">
                  <thead>
                    <tr className="thead-primary border-b border-border/60 text-[10.5px] uppercase tracking-wider font-semibold">
                      <th className="text-left py-2.5 px-5">Dự án</th>
                      <th className="text-left py-2.5 px-3">Vị trí</th>
                      <th className="text-left py-2.5 px-3">Thời gian</th>
                      <th className="text-left py-2.5 px-3">Công nghệ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(exp.projects || []).map((proj, j) =>
              <tr key={j} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-5 font-medium text-foreground">{proj.name}</td>
                        <td className="py-3 px-3 text-foreground/80">{proj.position}</td>
                        <td className="py-3 px-3 font-mono text-muted-foreground text-[12px]">{proj.period}</td>
                        <td className="py-3 px-3">
                          <div className="flex flex-wrap gap-1">
                            {(proj.tech || '').split(',').map((t) =>
                    <span key={t.trim()} className="text-[10.5px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{t.trim()}</span>
                    )}
                          </div>
                        </td>
                      </tr>
              )}
                  </tbody>
                </table>
              </div>
        )
        }
        </div>
      }

      {/* ── Tab: Kỹ năng & Ngôn ngữ ── */}
      {tab === 'skills' &&
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 rise" style={{ animationDuration: '0.3s' }}>
          {/* Languages */}
          <div className="card-surface p-5">
            <h3 className="section-title mb-4">Ngoại ngữ</h3>
            {(p.languages || []).length === 0 ?
          <p className="text-muted-foreground text-[13px]">Chưa cập nhật</p> :
          <div className="space-y-3">
                {(p.languages || []).map((lang, i) =>
            <div key={i} className="flex items-start gap-3 p-3 rounded-xl border border-border/60">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold text-[12px] font-mono">
                      {lang.name.includes('Nhật') ? '日' : lang.name.includes('Anh') ? 'EN' : '??'}
                    </div>
                    <div>
                      <p className="font-semibold text-[13.5px] text-foreground">{lang.name}</p>
                      <p className="text-[12px] text-muted-foreground">{lang.level}</p>
                      <p className="text-[11.5px] font-mono text-primary mt-0.5">{lang.cert}</p>
                    </div>
                  </div>
            )}
              </div>
          }
          </div>

          {/* Skills */}
          <div className="card-surface p-5">
            <h3 className="section-title mb-4">Kỹ năng kỹ thuật</h3>
            {(p.skills || []).length === 0 ?
          <p className="text-muted-foreground text-[13px]">Chưa cập nhật</p> :
          <div className="space-y-4">
                {(p.skills || []).map((sk, i) => {
              const maxYears = Math.max(...(p.skills || []).map((s) => s.years), 1);
              return (
                <div key={i}>
                      <div className="flex items-center justify-between text-[12.5px] mb-1.5">
                        <span className="font-medium text-foreground">{sk.name}</span>
                        <span className="font-mono text-muted-foreground">{sk.years} năm</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{
                      width: `${sk.years / maxYears * 100}%`,
                      background: 'linear-gradient(90deg, hsl(var(--primary-h) var(--primary-s) 65%), hsl(var(--primary-h) var(--primary-s) 45%))'
                    }} />
                      </div>
                    </div>);

            })}
              </div>
          }
          </div>

          {/* Technologies */}
          <div className="card-surface p-5">
            <h3 className="section-title mb-4">Lĩnh vực quan tâm</h3>
            {(p.technologies || []).length === 0 ?
          <p className="text-muted-foreground text-[13px]">Chưa cập nhật</p> :
          <div className="flex flex-wrap gap-2">
                {(p.technologies || []).map((tech, i) =>
            <span key={i} className={'px-3 py-1.5 rounded-lg text-[12.5px] font-medium font-mono border transition-colors ' + (
            i === 0 ? 'border-primary/40 bg-primary/10 text-primary' : 'border-border bg-muted/40 text-foreground/80')}>
                    {tech}
                  </span>
            )}
              </div>
          }
            {p.introduce &&
          <div className="mt-5 pt-4 border-t border-border/60">
                <h3 className="section-title mb-2">Giới thiệu bản thân</h3>
                <p className="text-[13px] text-foreground/85 leading-relaxed font-display italic"
            style={{ fontWeight: 400 }}>
                  "{p.introduce}"
                </p>
              </div>
          }
          </div>
        </div>
      }

      {/* ── Tab: Giải thưởng ── */}
      {tab === 'awards' &&
      <div className="space-y-4 rise" style={{ animationDuration: '0.3s' }}>
          {(p.awards || []).length === 0 ?
        <div className="card-surface py-16 text-center text-muted-foreground"><Icon.Star size={36} className="mx-auto mb-2 opacity-30" /><p>Chưa có giải thưởng</p></div> :
        (p.awards || []).map((aw, i) =>
        <div key={i} className="card-surface p-6 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: 'hsl(38 92% 50% / 0.12)', color: 'hsl(38 92% 45%)' }}>
                  <Icon.Award size={18} />
                </div>
                <div>
                  <h4 className="font-semibold text-[15px] text-foreground">{aw.title}</h4>
                  <p className="text-[13px] text-muted-foreground mt-1">{aw.desc}</p>
                </div>
              </div>
        )
        }
        </div>
      }

      {/* ── Edit Drawer ── */}
      {editing && <EditDrawer p={p} onClose={() => {setEditing(false);setToast('Đã lưu hồ sơ thành công.');setTimeout(() => setToast(''), 3000);}} />}

      {toast &&
      <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium text-white shadow-popover rise"
      style={{ background: 'hsl(160 60% 40%)', animationDuration: '0.2s' }}>
          <Icon.Check size={13} /> {toast}
        </div>
      }
    </div>);

};

window.PageProfile = PageProfile;