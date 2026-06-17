/* Workflow > Dự án — project list + detail + quarterly targets (no Kanban) */

// ── Data ──────────────────────────────────────────────────────────

const PROJECTS_INIT = [
  { id:1, name:'Cổng thanh toán XYZ', desc:'Tích hợp cổng thanh toán cho hệ thống thương mại điện tử khách hàng Nhật Bản.', status:'active', manager:'Hoàng Đức Thành', branch:'Hà Nội', start:'15/01/2025', end:'30/09/2026', members:12, tech:['Vue.js','Node.js','AWS'],
    targets:[
      { id:11, year:2026, quarter:3, weight:5, content:'1. Hoàn thiện tích hợp VNPay & Aeon installment.\n2. Đạt tỉ lệ giao dịch thành công ≥ 99.5%.\n3. Trình bày thành quả ở mục tự đánh giá cuối quý.' },
      { id:12, year:2026, quarter:2, weight:4, content:'1. Triển khai OAuth2 refresh token flow.\n2. Webhook retry với exponential backoff.' },
    ] },
  { id:2, name:'Hệ thống CRM nội bộ', desc:'Xây dựng CRM tích hợp cho team sales và support nội bộ VNLab.', status:'active', manager:'Phạm Thu Hà', branch:'Đà Nẵng', start:'08/09/2024', end:'15/07/2026', members:7, tech:['React','PostgreSQL'],
    targets:[
      { id:21, year:2026, quarter:3, weight:5, content:'1. Hoàn thiện pipeline deal tracking.\n2. Báo cáo doanh thu monthly theo segment.' },
    ] },
  { id:3, name:'App giao đồ ăn FoodGo', desc:'Mobile app cho người dùng cuối và driver delivery. Flutter + FastAPI.', status:'active', manager:'Lê Quang Huy', branch:'HCM', start:'22/11/2024', end:'12/12/2026', members:18, tech:['Flutter','Python','Docker'],
    targets:[
      { id:31, year:2026, quarter:3, weight:5, content:'1. Lựa chọn những task có khả năng KAIZEN thông qua AI, RPA.\n2. Trình bày về thành quả KAIZEN ở mục tự đánh giá cuối quý.' },
    ] },
  { id:4, name:'Quản lý kho ABC v2', desc:'Nâng cấp hệ thống quản lý kho hàng từ monolith sang microservices.', status:'active', manager:'Trần Thị Mai', branch:'Hà Nội', start:'04/03/2025', end:'20/08/2026', members:9, tech:['Java','Kubernetes'], targets:[] },
  { id:5, name:'Module báo cáo BI', desc:'Dashboard phân tích dữ liệu real-time cho ban lãnh đạo.', status:'pending', manager:'Vũ Thị Lan', branch:'Đà Nẵng', start:'01/10/2025', end:'01/10/2026', members:4, tech:['Python','Grafana','Redash'],
    targets:[
      { id:51, year:2026, quarter:4, weight:3, content:'1. Setting mục tiêu KAIZEN 15% theo phương châm của tập đoàn.\n2. Hoàn thiện dashboard real-time cho ban lãnh đạo.' },
    ] },
  { id:6, name:'Hệ thống tuyển dụng', desc:'Nội bộ hóa quy trình tuyển dụng — ATS tích hợp ERP.', status:'pending', manager:'Đỗ Minh Tuấn', branch:'Hà Nội', start:'15/09/2024', end:'—', members:6, tech:['Vue.js','Go'], targets:[] },
  { id:7, name:'Mobile companion app', desc:'iOS/Android companion cho hệ thống ERP — check-in, xem slip lương, OT.', status:'active', manager:'Bùi Đức Thành', branch:'Osaka', start:'10/11/2024', end:'28/02/2027', members:11, tech:['React Native','TypeScript','AWS'], targets:[] },
  { id:8, name:'Cổng tích hợp API v3', desc:'Refactor API gateway layer sang REST + gRPC với rate limiting và observability.', status:'active', manager:'Hoàng Đức Thành', branch:'Hà Nội', start:'01/02/2026', end:'15/06/2026', members:8, tech:['Go','Redis','Kafka'],
    targets:[
      { id:81, year:2026, quarter:2, weight:5, content:'1. Refactor sang REST + gRPC.\n2. Triển khai rate limiting + observability stack.' },
    ] },
  { id:9, name:'Security audit & hardening', desc:'Kiểm toán bảo mật toàn diện trước ISO 27001.', status:'ended', manager:'Lê Quang Huy', branch:'HCM', start:'01/12/2024', end:'28/02/2026', members:5, tech:['OWASP','Trivy'],
    targets:[
      { id:91, year:2025, quarter:4, weight:5, content:'1. Hoàn thành kiểm toán OWASP Top 10.\n2. Đạt chứng nhận ISO 27001.' },
    ] },
];

const PROJECT_STATUS_META = {
  pending: { label: 'Chờ khởi động', variant: 'amber', dot: '#f59e0b' },
  active:  { label: 'Đang hoạt động', variant: 'green', dot: '#22c55e' },
  ended:   { label: 'Đã kết thúc',    variant: 'gray',  dot: '#a3a3a3' },
};
const STATUS_OPTS = [
  { value: 'pending', label: 'Chờ khởi động' },
  { value: 'active',  label: 'Đang hoạt động' },
  { value: 'ended',   label: 'Đã kết thúc' },
];

const ALL_MEMBERS = [
  'Nguyễn Văn An', 'Trần Thị Mai', 'Lê Quang Huy', 'Phạm Thu Hà',
  'Đỗ Minh Tuấn', 'Hoàng Đức Thành', 'Vũ Thị Lan', 'Bùi Đức Thành',
  'Ngô Thanh Tùng', 'Đặng Thị Hồng', 'Lý Quỳnh Anh', 'Trần Ngọc Huy', 'Trần Cao Quý',
];
const ALL_TECH = ['Vue.js','React','React Native','Angular','TypeScript','Node.js','Go','Python','Java','PHP','Flutter','AWS','Docker','Kubernetes','PostgreSQL','MongoDB','Redis','Kafka','GraphQL','gRPC'];

const YEAR_OPTS = [2024, 2025, 2026, 2027, 2028].map(y => ({ value: String(y), label: String(y) }));
const QUARTER_OPTS = [1, 2, 3, 4].map(q => ({ value: String(q), label: `Quý ${q}` }));

// ── Small primitives ──────────────────────────────────────────────

const PDrop = ({ value, onChange, options }) => (
  <Select value={value ?? ''} onChange={onChange} options={options} width="100%" placeholder={null} />
);

const PLabel = ({ children, req }) => (
  <label className="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">
    {children}{req && <span className="text-red-400 ml-0.5">*</span>}
  </label>
);

// ── Quarterly Target editor (inside create/edit modal) ────────────

const TargetEditor = ({ targets, setTargets }) => {
  const [draft, setDraft] = React.useState(null); // {id?, year, quarter, weight, content}
  const blank = { year: '2026', quarter: '3', weight: '5', content: '' };

  const openNew = () => setDraft({ ...blank });
  const openEdit = t => setDraft({ id: t.id, year: String(t.year), quarter: String(t.quarter), weight: String(t.weight), content: t.content });

  const commit = () => {
    if (!draft.content.trim()) return;
    const rec = { id: draft.id || Date.now(), year: Number(draft.year), quarter: Number(draft.quarter), weight: Number(draft.weight) || 0, content: draft.content };
    setTargets(prev => draft.id ? prev.map(t => t.id === draft.id ? rec : t) : [...prev, rec]);
    setDraft(null);
  };
  const remove = id => setTargets(prev => prev.filter(t => t.id !== id));

  const sorted = [...targets].sort((a, b) => b.year - a.year || b.quarter - a.quarter);

  return (
    <div className="space-y-2.5">
      {/* Existing targets */}
      {sorted.map(t => (
        <div key={t.id} className="rounded-xl border border-border bg-muted/20 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border/60 bg-muted/30">
            <Badge variant="primary">Quý {t.quarter} · {t.year}</Badge>
            <span className="text-[11.5px] text-muted-foreground">Trọng số <strong className="text-foreground">{t.weight}</strong></span>
            <div className="ml-auto flex items-center gap-1">
              <button onClick={() => openEdit(t)} className="h-6 px-2 rounded text-[11.5px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">Chỉnh sửa</button>
              <button onClick={() => remove(t.id)} className="h-6 px-2 rounded text-[11.5px] font-medium text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-500 transition-colors">Xóa</button>
            </div>
          </div>
          <p className="px-3 py-2 text-[12.5px] text-foreground/85 whitespace-pre-wrap leading-relaxed">{t.content}</p>
        </div>
      ))}

      {/* Draft form */}
      {draft ? (
        <div className="rounded-xl border-2 border-primary/40 bg-primary/5 p-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div><PLabel>Năm</PLabel><PDrop value={draft.year} onChange={e => setDraft(d => ({ ...d, year: e.target.value }))} options={YEAR_OPTS} /></div>
            <div><PLabel>Quý</PLabel><PDrop value={draft.quarter} onChange={e => setDraft(d => ({ ...d, quarter: e.target.value }))} options={QUARTER_OPTS} /></div>
            <div>
              <PLabel>Trọng số</PLabel>
              <input type="number" min="0" max="10" value={draft.weight} onChange={e => setDraft(d => ({ ...d, weight: e.target.value }))}
                className="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
            </div>
          </div>
          <div>
            <PLabel req>Mục tiêu</PLabel>
            <textarea value={draft.content} onChange={e => setDraft(d => ({ ...d, content: e.target.value }))} rows={4}
              placeholder={'1. Lựa chọn những task có khả năng KAIZEN…\n2. Trình bày về thành quả ở mục tự đánh giá cuối quý'}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 resize-none leading-relaxed placeholder:text-muted-foreground/45" />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Btn variant="ghost" size="xs" onClick={() => setDraft(null)}>Hủy</Btn>
            <Btn variant="primary" size="xs" onClick={commit}>{draft.id ? 'Lưu mục tiêu' : 'Thêm mục tiêu'}</Btn>
          </div>
        </div>
      ) : (
        <button onClick={openNew}
          className="w-full py-3 rounded-xl border-2 border-dashed border-border text-[13px] font-medium text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors flex items-center justify-center gap-1.5">
          <Icon.Plus size={14} /> Add target
        </button>
      )}
    </div>
  );
};

// ── Create / Edit Project Modal ───────────────────────────────────

const ProjectModal = ({ open, editing, onClose, onSubmit }) => {
  const [form, setForm] = React.useState({ name:'', manager:'Hoàng Đức Thành', start:'', end:'', desc:'', status:'pending' });
  const [members, setMembers] = React.useState([]);
  const [memberQ, setMemberQ] = React.useState('');
  const [techQ, setTechQ] = React.useState('');
  const [techs, setTechs] = React.useState([]);
  const [targets, setTargets] = React.useState([]);
  const [errors, setErrors] = React.useState({});
  const upd = k => e => { setForm(p => ({ ...p, [k]: e.target.value })); setErrors(p => ({ ...p, [k]:'' })); };
  const toDateInput = d => /^\d{2}\/\d{2}\/\d{4}$/.test(d || '') ? d.split('/').reverse().join('-') : '';

  React.useEffect(() => {
    if (!open) return;
    if (editing) {
      setForm({ name: editing.name, manager: editing.manager, start: toDateInput(editing.start), end: toDateInput(editing.end), desc: editing.desc || '', status: editing.status });
      setMembers(editing._memberNames || []);
      setTechs(editing.tech || []);
      setTargets(editing.targets || []);
    } else {
      setForm({ name:'', manager:'Hoàng Đức Thành', start:'', end:'', desc:'', status:'pending' });
      setMembers([]); setTechs([]); setTargets([]);
    }
    setMemberQ(''); setTechQ(''); setErrors({});
  }, [open, editing]);

  const memberResults = ALL_MEMBERS.filter(m => !members.includes(m) && m.toLowerCase().includes(memberQ.toLowerCase()));
  const techResults = ALL_TECH.filter(t => !techs.includes(t) && t.toLowerCase().includes(techQ.toLowerCase()));

  const submit = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Vui lòng nhập tên dự án';
    if (!form.start) e.start = 'Chọn ngày bắt đầu';
    if (Object.keys(e).length) { setErrors(e); return; }
    const fmt = d => d ? d.split('-').reverse().join('/') : '—';
    onSubmit({
      name: form.name, desc: form.desc, manager: form.manager, status: form.status,
      start: fmt(form.start), end: form.end ? fmt(form.end) : '—',
      members: members.length, _memberNames: members, tech: techs.slice(0, 4), targets,
    });
    onClose();
  };

  if (!open) return null;
  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(4px)' }} />
      <div className="relative card-surface rise" style={{ maxWidth:560, width:'100%', zIndex:1, borderRadius:20, overflow:'hidden', animationDuration:'0.22s', maxHeight:'92vh', display:'flex', flexDirection:'column' }}>

        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background:'linear-gradient(135deg,hsl(var(--primary-h) var(--primary-s) 65%),hsl(var(--primary-h) var(--primary-s) 45%))' }}>
              <Icon.Folder size={14} className="text-white" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[15px] text-foreground">{editing ? 'Sửa dự án' : 'Tạo dự án mới'}</h3>
              <p className="text-[11.5px] text-muted-foreground">Thông tin chung và mục tiêu hằng quý</p>
            </div>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"><Icon.X size={14} /></button>
        </div>

        <div className="overflow-y-auto scrollbar-thin flex-1 p-6 space-y-5">
          {/* Name */}
          <div>
            <PLabel req>Tên dự án</PLabel>
            <input value={form.name} onChange={upd('name')} placeholder="VD: Setting mục tiêu KAIZEN 15% theo phương châm của tập đoàn"
              className={'w-full h-9 px-3 rounded-lg border text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/45 bg-card ' +
                (errors.name ? 'border-red-400' : 'border-border focus:border-primary/60')} />
            {errors.name && <p className="text-[11.5px] text-red-400 mt-1">{errors.name}</p>}
          </div>

          {/* Manager + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <PLabel>Quản lý</PLabel>
              <PDrop value={form.manager} onChange={upd('manager')} options={ALL_MEMBERS.map(m => ({ value: m, label: m }))} />
            </div>
            <div>
              <PLabel>Trạng thái</PLabel>
              <PDrop value={form.status} onChange={upd('status')} options={STATUS_OPTS} />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <PLabel req>Ngày bắt đầu</PLabel>
              <input type="date" value={form.start} onChange={upd('start')}
                className={'w-full h-9 px-3 rounded-lg border text-[13px] text-foreground outline-none bg-card ' + (errors.start ? 'border-red-400' : 'border-border focus:border-primary/60')} />
              {errors.start && <p className="text-[11.5px] text-red-400 mt-1">{errors.start}</p>}
            </div>
            <div>
              <PLabel>Ngày kết thúc dự kiến</PLabel>
              <input type="date" value={form.end} onChange={upd('end')}
                className="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
            </div>
          </div>

          {/* Members */}
          <div>
            <PLabel>Người phụ trách</PLabel>
            {members.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {members.map(m => (
                  <span key={m} className="inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded-full text-[12px] font-medium"
                    style={{ background:'hsl(var(--primary-h) var(--primary-s) 60% / 0.12)', color:'hsl(var(--primary-h) var(--primary-s) 42%)' }}>
                    {m}
                    <button onClick={() => setMembers(ms => ms.filter(x => x !== m))} className="h-4 w-4 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors"><Icon.X size={9} /></button>
                  </span>
                ))}
              </div>
            )}
            <div className="relative">
              <Icon.Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input value={memberQ} onChange={e => setMemberQ(e.target.value)} placeholder="Tìm và thêm nhân viên…"
                className="w-full h-9 pl-8 pr-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 placeholder:text-muted-foreground/45" />
            </div>
            {memberQ && memberResults.length > 0 && (
              <div className="card-surface border border-border shadow-popover rounded-xl overflow-hidden mt-1">
                {memberResults.slice(0, 5).map(m => (
                  <button key={m} onClick={() => { setMembers(ms => [...ms, m]); setMemberQ(''); }}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-muted/40 transition-colors text-left">
                    <Avatar name={m} size={24} /><span className="text-[13px] text-foreground">{m}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <PLabel>Mô tả</PLabel>
            <textarea value={form.desc} onChange={upd('desc')} rows={3} placeholder="Mục tiêu, phạm vi, khách hàng…"
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 resize-none placeholder:text-muted-foreground/45" />
          </div>

          {/* Tech */}
          <div>
            <PLabel>Công nghệ</PLabel>
            {techs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {techs.map(t => (
                  <span key={t} className="inline-flex items-center gap-1.5 pl-2 pr-1 py-0.5 rounded bg-muted text-[11.5px] font-mono text-foreground/80">
                    {t}
                    <button onClick={() => setTechs(ts => ts.filter(x => x !== t))} className="h-4 w-4 flex items-center justify-center hover:text-red-500 transition-colors"><Icon.X size={9} /></button>
                  </span>
                ))}
              </div>
            )}
            <input value={techQ} onChange={e => setTechQ(e.target.value)} placeholder="VD: React, Go, Docker…"
              className="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 placeholder:text-muted-foreground/45" />
            {techQ && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {techResults.slice(0, 8).map(t => (
                  <button key={t} onClick={() => { setTechs(ts => [...ts, t]); setTechQ(''); }}
                    className="h-7 px-2.5 rounded-md bg-muted hover:bg-primary/10 hover:text-primary text-[12px] font-mono text-muted-foreground transition-colors">+ {t}</button>
                ))}
              </div>
            )}
          </div>

          {/* Quarterly targets */}
          <div className="pt-1 border-t border-dashed border-border/70">
            <div className="flex items-center gap-2 mb-3 mt-4">
              <Icon.Target size={14} className="text-primary" />
              <p className="text-[12.5px] font-semibold text-foreground">Mục tiêu hằng quý</p>
              {targets.length > 0 && <span className="text-[11px] font-mono text-muted-foreground">({targets.length})</span>}
            </div>
            <TargetEditor targets={targets} setTargets={setTargets} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/70 bg-muted/20 shrink-0">
          <Btn variant="outline" size="sm" onClick={onClose}>Hủy</Btn>
          <Btn variant="primary" size="sm" icon={editing ? null : 'Plus'} onClick={submit}>{editing ? 'Submit All' : 'Tạo dự án'}</Btn>
        </div>
      </div>
    </div>
  );
};

// ── Project Card ──────────────────────────────────────────────────

const ProjectCard = ({ p, delay, onClick }) => {
  const sm = PROJECT_STATUS_META[p.status];
  const totalWeight = (p.targets || []).reduce((a, t) => a + (t.weight || 0), 0);
  return (
    <div className={'card-surface interactive p-5 flex flex-col gap-4 cursor-pointer rise ' + (p.status === 'ended' ? 'opacity-75' : '')}
      style={{ animationDelay: `${delay}ms` }} onClick={onClick}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Badge variant={sm.variant} dot>{sm.label}</Badge>
          <h3 className="font-semibold text-foreground line-clamp-2 leading-snug mt-2">{p.name}</h3>
        </div>
        <Avatar name={p.manager} size={28} className="shrink-0" />
      </div>

      <p className="text-[12.5px] text-muted-foreground line-clamp-2">{p.desc}</p>

      {(p.targets || []).length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
            <Icon.Target size={11} /> {p.targets.length} mục tiêu quý
          </span>
          <span className="text-[11px] text-muted-foreground">· Tổng trọng số {totalWeight}</span>
        </div>
      )}

      <div className="flex flex-wrap gap-1">
        {(p.tech || []).map(t => <span key={t} className="text-[10.5px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono">{t}</span>)}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-border/60 text-[12px]">
        <div className="flex -space-x-2">
          {Array.from({ length: Math.min(p.members, 5) }, (_, i) => (
            <div key={i} className="h-6 w-6 rounded-md border-2 border-card"
              style={{ background: `linear-gradient(135deg, hsl(${(i * 60 + 180) % 360} 70% 62%), hsl(${(i * 60 + 180) % 360} 70% 42%))` }} />
          ))}
          {p.members > 5 && <div className="h-6 w-6 rounded-md border-2 border-card bg-muted flex items-center justify-center text-[9.5px] font-semibold text-muted-foreground">+{p.members - 5}</div>}
        </div>
        <span className="font-mono text-muted-foreground text-[11.5px]">{p.start} → {p.end}</span>
      </div>
    </div>
  );
};

// ── Project Detail Drawer ─────────────────────────────────────────

const ProjectDetail = ({ p, onClose, onEdit }) => {
  const [dtab, setDtab] = React.useState('overview');
  const sm = PROJECT_STATUS_META[p.status];
  const members = [
    { n: 'Nguyễn Văn An', r: 'Tech Lead', b: 'Hà Nội', join: '15/01/2025' },
    { n: 'Trần Thị Mai', r: 'QA Engineer', b: 'Đà Nẵng', join: '22/01/2025' },
    { n: 'Lê Quang Huy', r: 'BrSE', b: 'HCM', join: '15/01/2025' },
    { n: 'Phạm Thu Hà', r: 'PM', b: 'Đà Nẵng', join: '15/01/2025' },
  ].slice(0, Math.min(p.members, 7));
  const sortedTargets = [...(p.targets || [])].sort((a, b) => b.year - a.year || b.quarter - a.quarter);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background border-l border-border w-full max-w-2xl h-full flex flex-col rise" style={{ animationDuration: '.3s' }}>
        <div className="p-5 border-b border-border/70 flex items-start justify-between gap-4"
          style={{ background: `linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 57% / 0.04), transparent 60%)` }}>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <Badge variant={sm.variant} dot>{sm.label}</Badge>
              {(p.tech || []).map(t => <span key={t} className="text-[10.5px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>)}
            </div>
            <h2 className="font-bold text-[20px] font-heading text-foreground">{p.name}</h2>
            <div className="flex items-center gap-3 mt-1 text-[12px] text-muted-foreground flex-wrap">
              <span className="inline-flex items-center gap-1"><Avatar name={p.manager} size={16} className="rounded" /> {p.manager}</span>
              <span>·</span>
              <span className="font-mono">{p.start} → {p.end}</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted text-muted-foreground"><Icon.X size={16} /></button>
        </div>

        <div className="border-b border-border/70 px-5 flex gap-5">
          {[
            { k: 'overview', l: 'Tổng quan' },
            { k: 'targets', l: `Mục tiêu quý (${(p.targets || []).length})` },
            { k: 'members', l: `Thành viên (${p.members})` },
          ].map(t => (
            <button key={t.k} onClick={() => setDtab(t.k)} data-active={dtab === t.k} className="tab-trigger text-[13px]">{t.l}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-5">
          {dtab === 'overview' && (
            <>
              <div className="card-surface p-5">
                <h3 className="section-title mb-2">Mô tả</h3>
                <p className="text-[13.5px] text-foreground/85 leading-relaxed whitespace-pre-wrap">{p.desc || 'Chưa có mô tả'}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="card-surface p-4">
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Quản lý</p>
                  <div className="flex items-center gap-2 mt-1"><Avatar name={p.manager} size={24} /><p className="font-medium text-foreground text-[13.5px]">{p.manager}</p></div>
                </div>
                <div className="card-surface p-4">
                  <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Chi nhánh</p>
                  <p className="font-medium text-foreground text-[13.5px] mt-2">{p.branch}</p>
                </div>
              </div>
              {sortedTargets.length > 0 && (
                <div className="card-surface p-5">
                  <h3 className="section-title mb-3">Mục tiêu gần nhất · Quý {sortedTargets[0].quarter}/{sortedTargets[0].year}</h3>
                  <p className="text-[13px] text-foreground/85 whitespace-pre-wrap leading-relaxed">{sortedTargets[0].content}</p>
                </div>
              )}
            </>
          )}

          {dtab === 'targets' && (
            sortedTargets.length === 0
              ? <div className="card-surface py-16 text-center text-muted-foreground"><Icon.Target size={36} className="mx-auto mb-2 opacity-30" /><p>Chưa có mục tiêu quý nào</p></div>
              : <div className="space-y-3">
                {sortedTargets.map(t => (
                  <div key={t.id} className="card-surface overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/60"
                      style={{ background: 'linear-gradient(90deg, hsl(var(--primary-h) var(--primary-s) 57% / 0.06), transparent)' }}>
                      <Badge variant="primary">Quý {t.quarter} · {t.year}</Badge>
                      <span className="text-[11.5px] text-muted-foreground ml-1">Trọng số <strong className="text-foreground">{t.weight}</strong></span>
                    </div>
                    <p className="px-4 py-3 text-[13px] text-foreground/85 whitespace-pre-wrap leading-relaxed">{t.content}</p>
                  </div>
                ))}
              </div>
          )}

          {dtab === 'members' && (
            <ul className="space-y-2.5">
              {members.map((m, i) => (
                <li key={i} className="flex items-center gap-3 p-3 card-surface hover:border-primary/40 transition-colors cursor-pointer">
                  <Avatar name={m.n} size={36} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{m.n}</p>
                    <p className="text-[12px] text-muted-foreground">{m.r} · {m.b}</p>
                  </div>
                  <span className="text-[11px] font-mono text-muted-foreground">{m.join}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-border/70 flex items-center gap-2">
          <Btn variant="ghost" size="sm" onClick={onClose}>Đóng</Btn>
          <div className="flex-1" />
          <Btn variant="primary" size="sm" icon="FileText" onClick={() => onEdit(p)}>Chỉnh sửa</Btn>
        </div>
      </div>
    </div>
  );
};

// ── Page root ────────────────────────────────────────────────────

const PageProject = () => {
  const [projects, setProjects] = React.useState(PROJECTS_INIT);
  const [tab, setTab] = React.useState('all');
  const [search, setSearch] = React.useState('');
  const [statusF, setStatusF] = React.useState('');
  const [openProject, setOpenProject] = React.useState(null);
  const [modal, setModal] = React.useState({ open: false, editing: null });
  const [toast, setToast] = React.useState('');

  const notify = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = projects.filter(p => {
    if (tab === 'mine' && p.manager !== 'Hoàng Đức Thành') return false;
    if (tab === 'active' && p.status !== 'active') return false;
    if (tab === 'ended' && p.status !== 'ended') return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusF && p.status !== statusF) return false;
    return true;
  });

  const active = projects.filter(p => p.status === 'active').length;
  const pending = projects.filter(p => p.status === 'pending').length;
  const ended = projects.filter(p => p.status === 'ended').length;
  const myProjects = projects.filter(p => p.manager === 'Hoàng Đức Thành').length;

  const handleSubmit = (data) => {
    if (modal.editing) {
      setProjects(ps => ps.map(p => p.id === modal.editing.id ? { ...p, ...data } : p));
      setOpenProject(op => op && op.id === modal.editing.id ? { ...op, ...data } : op);
      notify('Đã cập nhật dự án: ' + data.name);
    } else {
      const np = { ...data, id: Date.now(), branch: 'Hà Nội' };
      setProjects(ps => [np, ...ps]);
      notify('Đã tạo dự án: ' + data.name);
    }
  };

  const openCreate = () => setModal({ open: true, editing: null });
  const openEdit = (p) => { setOpenProject(null); setModal({ open: true, editing: p }); };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workflow"
        title="Quản lí dự án"
        description="Theo dõi trạng thái, thành viên và mục tiêu hằng quý của tất cả dự án."
        actions={
          <>
            <Btn variant="outline" icon="FileText">Báo cáo</Btn>
            <Btn variant="primary" icon="Plus" onClick={openCreate}>Tạo dự án mới</Btn>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat label="Tổng dự án" value={projects.length} sublabel="Tất cả trạng thái" accent="primary" delay={40} />
        <MiniStat label="Đang hoạt động" value={active} sublabel={`${pending} chờ khởi động`} accent="green" delay={80} />
        <MiniStat label="Đã kết thúc" value={ended} sublabel="Đã hoàn tất" accent="gray" delay={120} />
        <MiniStat label="Dự án của tôi" value={myProjects} sublabel="Quản lý trực tiếp" accent="violet" delay={160} />
      </div>

      <div className="border-b border-border/70">
        <div className="flex gap-7">
          {[
            { k: 'all',    l: 'Tất cả',         n: projects.length },
            { k: 'mine',   l: 'Của tôi',         n: myProjects },
            { k: 'active', l: 'Đang hoạt động',  n: active },
            { k: 'ended',  l: 'Đã kết thúc',     n: ended },
          ].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} data-active={tab === t.k} className="tab-trigger inline-flex items-center gap-2">
              {t.l}
              <span className={'inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10.5px] font-semibold tabular-nums ' +
                (tab === t.k ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground')}>{t.n}</span>
            </button>
          ))}
        </div>
      </div>

      <FilterBar>
        <FieldInput icon="Search" placeholder="Tìm tên dự án…" value={search} onChange={e => setSearch(e.target.value)} width={240} />
        <Select value={statusF} onChange={e => setStatusF(e.target.value)} placeholder="Tất cả trạng thái" width={170} options={STATUS_OPTS} />
        <div className="flex-1" />
        <span className="text-[12px] text-muted-foreground">{filtered.length} dự án</span>
      </FilterBar>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((p, i) => (
          <ProjectCard key={p.id} p={p} delay={40 + i * 30} onClick={() => setOpenProject(p)} />
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full card-surface py-16 text-center text-muted-foreground">
            <Icon.Folder size={40} className="mx-auto mb-3 opacity-30" />
            Không có dự án phù hợp
          </div>
        )}
      </div>

      {openProject && <ProjectDetail p={openProject} onClose={() => setOpenProject(null)} onEdit={openEdit} />}

      <ProjectModal open={modal.open} editing={modal.editing} onClose={() => setModal({ open: false, editing: null })} onSubmit={handleSubmit} />

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium text-white shadow-popover rise"
          style={{ background: 'hsl(160 60% 40%)', animationDuration: '0.2s' }}>
          <Icon.Check size={13} /> {toast}
        </div>
      )}
    </div>
  );
};

window.PageProject = PageProject;
