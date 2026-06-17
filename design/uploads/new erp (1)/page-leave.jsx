/* HRM > Quản lý nghỉ phép — weekly schedule grid (matches legacy SPA layout) */

// ── Members (rows) ────────────────────────────────────────────────
const LEAVE_MEMBERS = [
  { id: 1,  name: 'Nguyễn Tấn Nam',      branch: 'Hà Nội' },
  { id: 2,  name: 'default user',        branch: 'Hà Nội' },
  { id: 3,  name: 'Đặng Đình Nhân',      branch: 'Đà Nẵng' },
  { id: 4,  name: 'Đỗ Thị Hương Lan',    branch: 'Hà Nội' },
  { id: 5,  name: 'Lương Minh Thiệu',    branch: 'Hồ Chí Minh' },
  { id: 6,  name: 'Nam Vo',              branch: 'Đà Nẵng' },
  { id: 7,  name: 'Tiến Lê Đức',         branch: 'Hà Nội' },
  { id: 8,  name: 'Vũ Thị Bích Diệp',    branch: 'Hà Nội' },
  { id: 9,  name: 'Trần Cao Quý',        branch: 'Hồ Chí Minh' },
  { id: 10, name: 'Nguyễn Thị Kim Ngân', branch: 'Đà Nẵng' },
];

// ── Leave entries (memberId, ISO date range, type, status) ────────
const LEAVE_TYPE_META = {
  'Nghỉ cả ngày':   { variant: 'primary', color: 'hsl(var(--primary))', bg: 'hsl(var(--primary-h) var(--primary-s) 57% / 0.12)' },
  'Nghỉ buổi sáng': { variant: 'sky',     color: 'hsl(199 89% 45%)',    bg: 'hsl(199 89% 48% / 0.13)' },
  'Nghỉ buổi chiều':{ variant: 'violet',  color: 'hsl(265 60% 52%)',    bg: 'hsl(265 60% 55% / 0.13)' },
  'Đi muộn':        { variant: 'amber',   color: 'hsl(38 92% 42%)',     bg: 'hsl(38 92% 50% / 0.14)' },
  'Về sớm':         { variant: 'amber',   color: 'hsl(25 90% 48%)',     bg: 'hsl(25 90% 52% / 0.14)' },
  'Ra ngoài':       { variant: 'sky',     color: 'hsl(180 60% 36%)',    bg: 'hsl(180 60% 42% / 0.14)' },
  'Làm ở nhà':      { variant: 'green',   color: 'hsl(160 60% 38%)',    bg: 'hsl(160 60% 45% / 0.13)' },
  'Công tác':       { variant: 'violet',  color: 'hsl(231 60% 52%)',    bg: 'hsl(231 60% 55% / 0.13)' },
  'Khác':           { variant: 'gray',    color: 'hsl(var(--muted-foreground))', bg: 'hsl(var(--muted-foreground) / 0.12)' },
};
const LEAVE_TYPES = Object.keys(LEAVE_TYPE_META);
const LEAVE_STATUS_META = {
  pending:  { label: 'Chờ duyệt', variant: 'amber' },
  approved: { label: 'Đã duyệt',  variant: 'green' },
  rejected: { label: 'Từ chối',   variant: 'red' },
};

// Entries placed within the week of 2026-06-01 → 2026-06-07
const LEAVE_ENTRIES = [
  { id: 1, memberId: 4, type: 'Nghỉ cả ngày',   from: '2026-06-02', to: '2026-06-03', status: 'approved', reason: 'Du lịch gia đình', half: false },
  { id: 2, memberId: 6, type: 'Nghỉ buổi sáng', from: '2026-06-01', to: '2026-06-01', status: 'pending',  reason: 'Khám bệnh buổi sáng', half: true },
  { id: 3, memberId: 9, type: 'Công tác',       from: '2026-06-04', to: '2026-06-05', status: 'approved', reason: 'Công tác khách hàng Osaka', half: false },
  { id: 4, memberId: 1, type: 'Đi muộn',        from: '2026-06-05', to: '2026-06-05', status: 'pending',  reason: 'Kẹt xe / việc gia đình', half: true },
  { id: 5, memberId: 8, type: 'Làm ở nhà',      from: '2026-06-03', to: '2026-06-06', status: 'approved', reason: 'Work from home', half: false },
  { id: 6, memberId: 3, type: 'Về sớm',         from: '2026-06-04', to: '2026-06-04', status: 'approved', reason: 'Đón con', half: true },
  { id: 7, memberId: 10,type: 'Ra ngoài',       from: '2026-06-06', to: '2026-06-07', status: 'pending',  reason: 'Việc cá nhân', half: false },
];

// ── Date helpers ──────────────────────────────────────────────────
const WD_VI = ['CN', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const iso = d => d.toISOString().slice(0, 10);
const fmtVN = d => `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`;
const fmtSlash = d => `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
const mondayOf = (d) => { const x = new Date(d); const day = (x.getDay() + 6) % 7; x.setDate(x.getDate() - day); x.setHours(0,0,0,0); return x; };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

// ── Sub-tabs ──────────────────────────────────────────────────────
const LEAVE_TABS = [
  { k: 'manage',  l: 'Quản lí xin nghỉ' },
  { k: 'create',  l: 'Tạo xin nghỉ' },
  { k: 'info',    l: 'Thông tin nghỉ phép' },
  { k: 'history', l: 'Lịch sử thêm ngày phép' },
];

const PER_PAGE = 8;

// ════════════════════════════════════════════════════════════════
const PageLeave = () => {
  const [tab, setTab] = React.useState('manage');
  const [weekStart, setWeekStart] = React.useState(() => mondayOf(new Date('2026-06-01')));
  const [search, setSearch] = React.useState('');
  const [fromDate, setFromDate] = React.useState('');
  const [toDate, setToDate] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [entries, setEntries] = React.useState(LEAVE_ENTRIES);
  const [detail, setDetail] = React.useState(null);
  const [addDaysRow, setAddDaysRow] = React.useState(null);
  const [toast, setToast] = React.useState('');

  const notify = m => { setToast(m); setTimeout(() => setToast(''), 2800); };

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const weekStartISO = iso(weekStart);
  const weekEndISO = iso(addDays(weekStart, 6));

  const filteredMembers = LEAVE_MEMBERS.filter(m => !search || m.name.toLowerCase().includes(search.toLowerCase()));
  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / PER_PAGE));
  const pageMembers = filteredMembers.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // entry covering a given member+date
  const entryFor = (memberId, dISO) =>
    entries.find(e => e.memberId === memberId && dISO >= e.from && dISO <= e.to);

  const stats = {
    pending: entries.filter(e => e.status === 'pending').length,
    approved: entries.filter(e => e.status === 'approved').length,
    onLeaveThisWeek: new Set(entries.filter(e => e.from <= weekEndISO && e.to >= weekStartISO).map(e => e.memberId)).size,
  };

  const approve = (e) => { setEntries(es => es.map(x => x.id === e.id ? { ...x, status: 'approved' } : x)); setDetail(d => d ? { ...d, status: 'approved' } : d); notify('Đã duyệt đơn nghỉ.'); };
  const reject  = (e) => { setEntries(es => es.map(x => x.id === e.id ? { ...x, status: 'rejected' } : x)); setDetail(d => d ? { ...d, status: 'rejected' } : d); notify('Đã từ chối đơn nghỉ.'); };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="HRM · Nghỉ phép"
        title="Quản lý nghỉ phép"
        description="Lịch nghỉ phép theo tuần của toàn bộ nhân viên. Chọn ô để xem chi tiết và duyệt đơn."
        actions={
          <>
            <Btn variant="primary" icon="Plus" onClick={() => setTab('create')}>Tạo xin nghỉ</Btn>
          </>
        }
      />

      {/* Sub-tabs (segmented) */}
      <div className="flex flex-wrap gap-2">
        {LEAVE_TABS.map(t => {
          const active = tab === t.k;
          return (
            <button key={t.k} onClick={() => setTab(t.k)}
              className={'h-10 px-5 rounded-lg text-[13.5px] font-semibold transition-all ' +
                (active ? 'text-white shadow-sm' : 'border border-border text-foreground/70 hover:text-foreground hover:border-primary/40 bg-card')}
              style={active ? { background: 'linear-gradient(135deg,hsl(var(--primary-h) var(--primary-s) 60%),hsl(var(--primary-h) var(--primary-s) 44%))' } : {}}>
              {t.l}
            </button>
          );
        })}
      </div>

      {tab === 'manage' && (
        <>
          {/* Search bar */}
          <div className="card-surface p-4">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_1fr_auto] gap-4 items-end">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Tìm kiếm tên</label>
                <div className="relative">
                  <Icon.Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                  <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Tìm kiếm…"
                    className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 placeholder:text-muted-foreground/50" />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Từ ngày</label>
                <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Đến ngày</label>
                <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" />
              </div>
              <Btn variant="primary" icon="Search" onClick={() => {
                if (fromDate) setWeekStart(mondayOf(new Date(fromDate)));
                notify('Đã áp dụng bộ lọc.');
              }}>Tìm kiếm</Btn>
            </div>
          </div>

          {/* Stat chips */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MiniStat label="Chờ duyệt" value={stats.pending} sublabel="Cần xử lý" accent="amber" delay={40} />
            <MiniStat label="Đã duyệt" value={stats.approved} sublabel="Trong hệ thống" accent="green" delay={80} />
            <MiniStat label="Nghỉ trong tuần" value={stats.onLeaveThisWeek} sublabel={`${fmtVN(weekStart)} – ${fmtVN(addDays(weekStart,6))}`} accent="primary" delay={120} />
            <MiniStat label="Tổng nhân viên" value={LEAVE_MEMBERS.length} sublabel="Đang theo dõi" accent="violet" delay={160} />
          </div>

          {/* Weekly grid */}
          <div className="card-surface overflow-hidden rise" style={{ animationDelay: '200ms' }}>
            {/* Week navigation */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-border/70 bg-muted/20">
              <div className="flex items-center gap-2">
                <button onClick={() => setWeekStart(addDays(weekStart, -7))}
                  className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors">
                  <Icon.ChevronRight size={14} className="rotate-180" />
                </button>
                <span className="text-[13px] font-semibold text-foreground font-mono tabular-nums px-2">
                  {fmtSlash(weekStart)} – {fmtSlash(addDays(weekStart, 6))}
                </span>
                <button onClick={() => setWeekStart(addDays(weekStart, 7))}
                  className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors">
                  <Icon.ChevronRight size={14} />
                </button>
                <button onClick={() => setWeekStart(mondayOf(new Date('2026-06-01')))}
                  className="h-8 px-3 rounded-lg border border-border bg-card text-[12px] font-medium text-foreground/70 hover:text-primary hover:border-primary/50 transition-colors ml-1">
                  Tuần này
                </button>
              </div>
              {/* Legend */}
              <div className="hidden lg:flex items-center gap-3.5 text-[11.5px] text-muted-foreground flex-wrap">
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded" style={{ background: 'hsl(var(--primary))' }} />Nghỉ cả ngày</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded" style={{ background: 'hsl(199 89% 48%)' }} />Nửa ngày</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded" style={{ background: 'hsl(160 60% 45%)' }} />Làm ở nhà</span>
                <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded" style={{ background: 'hsl(231 60% 55%)' }} />Công tác</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: 880 }}>
                <thead>
                  <tr>
                    <th className="sticky left-0 z-10 bg-muted/40 text-left px-5 py-3 w-[220px] border-b border-r border-border/70">
                      <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Thành viên</span>
                    </th>
                    {weekDays.map((d, i) => {
                      const isWeekend = i >= 5;
                      return (
                        <th key={i} className={'px-2 py-2.5 text-center border-b border-r border-border/50 last:border-r-0 ' + (isWeekend ? 'bg-muted/40' : 'bg-muted/20')} style={{ minWidth: 94 }}>
                          <div className="text-[12px] font-semibold text-foreground">{WD_VI[d.getDay()]}</div>
                          <div className="text-[11px] text-muted-foreground font-mono tabular-nums">{fmtSlash(d).slice(5)}</div>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {pageMembers.map(m => (
                    <tr key={m.id} className="group">
                      {/* Member cell */}
                      <td className="sticky left-0 z-10 bg-card group-hover:bg-muted/20 px-5 py-3 border-b border-r border-border/70 transition-colors">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={m.name} size={30} />
                          <div className="min-w-0">
                            <p className="text-[13px] font-medium text-foreground truncate">{m.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{m.branch}</p>
                          </div>
                        </div>
                      </td>
                      {/* Day cells */}
                      {weekDays.map((d, i) => {
                        const dISO = iso(d);
                        const e = entryFor(m.id, dISO);
                        const isWeekend = i >= 5;
                        const tm = e && LEAVE_TYPE_META[e.type];
                        const isStart = e && e.from === dISO;
                        return (
                          <td key={i}
                            className={'px-1.5 py-2 border-b border-r border-border/40 last:border-r-0 align-middle ' + (isWeekend ? 'bg-muted/15' : '')}>
                            {e ? (
                              <button onClick={() => setDetail(e)}
                                className="w-full rounded-md px-2 py-1.5 text-left transition-transform hover:scale-[1.03] cursor-pointer"
                                style={{ background: tm.bg, borderLeft: `3px solid ${tm.color}`, opacity: e.status === 'rejected' ? 0.5 : 1 }}
                                title={`${e.type} · ${LEAVE_STATUS_META[e.status].label}`}>
                                {isStart ? (
                                  <>
                                    <span className="block text-[11px] font-semibold leading-tight" style={{ color: tm.color }}>{e.type}{e.half && ' ½'}</span>
                                    <span className="flex items-center gap-1 mt-0.5">
                                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{
                                        background: e.status === 'approved' ? 'hsl(160 60% 45%)' : e.status === 'rejected' ? 'hsl(0 70% 52%)' : 'hsl(38 92% 50%)' }} />
                                      <span className="text-[10px] text-muted-foreground truncate">{LEAVE_STATUS_META[e.status].label}</span>
                                    </span>
                                  </>
                                ) : (
                                  <span className="block h-[26px] flex items-center text-[10.5px]" style={{ color: tm.color }}>•••</span>
                                )}
                              </button>
                            ) : (
                              <div className="h-[40px]" />
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  {pageMembers.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-muted-foreground">
                        <Icon.CalendarCheck size={36} className="mx-auto mb-2 opacity-30" />
                        Không tìm thấy nhân viên phù hợp
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer: week range + pagination */}
            <div className="flex items-center justify-between gap-4 flex-wrap px-5 py-3 border-t border-border/70 bg-muted/10">
              <span className="text-[12px] text-muted-foreground font-mono tabular-nums">
                {fmtSlash(weekStart)} – {fmtSlash(addDays(weekStart, 6))}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[12px] text-muted-foreground">Trang {page}/{totalPages}</span>
                <div className="flex items-center gap-1">
                  <button disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="h-7 w-7 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <Icon.ChevronRight size={12} className="rotate-180" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <button key={p} onClick={() => setPage(p)}
                      className={'h-7 min-w-7 px-2 rounded-md text-[12px] font-medium transition-colors ' +
                        (p === page ? 'text-white' : 'border border-border bg-card text-foreground/70 hover:border-primary/50')}
                      style={p === page ? { background: 'hsl(var(--primary))' } : {}}>{p}</button>
                  ))}
                  <button disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="h-7 w-7 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <Icon.ChevronRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'create' && <LeaveCreateForm onSubmit={() => { notify('Đã gửi đơn xin nghỉ.'); setTab('manage'); }} members={LEAVE_MEMBERS} />}
      {tab === 'info' && <LeaveInfoTable onAddDays={(r) => setAddDaysRow(r)} onCreateLeave={() => setTab('create')} />}
      {tab === 'history' && <LeaveHistoryTable />}

      {addDaysRow && <AddDaysModal row={addDaysRow} onClose={() => setAddDaysRow(null)} onSave={() => { setAddDaysRow(null); notify('Đã thêm ngày nghỉ.'); }} />}

      {/* Detail drawer */}
      {detail && <LeaveDetailDrawer e={detail} member={LEAVE_MEMBERS.find(m => m.id === detail.memberId)} onApprove={approve} onReject={reject} onClose={() => setDetail(null)} />}

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium text-white shadow-popover rise"
          style={{ background: 'hsl(160 60% 40%)', animationDuration: '0.2s' }}>
          <Icon.Check size={13} /> {toast}
        </div>
      )}
    </div>
  );
};

// ── Detail drawer ─────────────────────────────────────────────────
const LeaveDetailDrawer = ({ e, member, onApprove, onReject, onClose }) => {
  const tm = LEAVE_TYPE_META[e.type];
  const sm = LEAVE_STATUS_META[e.status];
  const dFrom = new Date(e.from), dTo = new Date(e.to);
  const days = Math.round((dTo - dFrom) / 86400000) + 1 - (e.half ? 0.5 : 0);
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background border-l border-border w-full max-w-md h-full flex flex-col rise" style={{ animationDuration: '.3s' }}>
        <div className="p-5 border-b border-border/70 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar name={member?.name} size={42} />
            <div>
              <p className="font-bold text-[16px] text-foreground">{member?.name}</p>
              <p className="text-[12px] text-muted-foreground">{member?.branch}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted text-muted-foreground"><Icon.X size={15} /></button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-5">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant={tm.variant}>{e.type}{e.half && ' (nửa ngày)'}</Badge>
            <Badge variant={sm.variant} dot>{sm.label}</Badge>
          </div>
          <div className="card-surface p-4 grid grid-cols-2 gap-4">
            <div><p className="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Từ ngày</p><p className="text-[14px] font-mono text-foreground">{fmtVN(dFrom)}</p></div>
            <div><p className="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Đến ngày</p><p className="text-[14px] font-mono text-foreground">{fmtVN(dTo)}</p></div>
            <div><p className="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">Số ngày</p><p className="text-[14px] font-bold text-foreground tabular-nums">{days} ngày</p></div>
          </div>
          <div>
            <p className="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground mb-1.5">Lý do</p>
            <p className="text-[13.5px] text-foreground/85 leading-relaxed">{e.reason}</p>
          </div>
        </div>
        {e.status === 'pending' && (
          <div className="p-4 border-t border-border/70 flex items-center gap-2">
            <Btn variant="ghost" size="sm" onClick={() => onReject(e)}>Từ chối</Btn>
            <div className="flex-1" />
            <Btn variant="success" size="sm" icon="Check" onClick={() => onApprove(e)}>Duyệt đơn</Btn>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Create form (tab) ─────────────────────────────────────────────
const LeaveCreateForm = ({ onSubmit, members }) => {
  const [f, setF] = React.useState({ member: '', type: 'Nghỉ cả ngày', from: '', to: '', half: false, reason: '' });
  const upd = k => e => setF(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const Lbl = ({ children, req }) => <label className="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{children}{req && <span className="text-red-400 ml-0.5">*</span>}</label>;
  return (
    <div className="card-surface p-6 max-w-[640px] rise">
      <h3 className="font-heading font-bold text-[17px] text-foreground mb-5">Tạo đơn xin nghỉ</h3>
      <div className="space-y-4">
        <div>
          <Lbl req>Nhân viên</Lbl>
          <Select value={f.member} onChange={upd('member')} width="100%" placeholder="— Chọn nhân viên —"
            options={members.map(m => ({ value: m.name, label: m.name }))} />
        </div>
        <div>
          <Lbl req>Loại nghỉ phép</Lbl>
          <Select value={f.type} onChange={upd('type')} width="100%" placeholder={null}
            options={LEAVE_TYPES.map(t => ({ value: t, label: t }))} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><Lbl req>Từ ngày</Lbl><input type="date" value={f.from} onChange={upd('from')} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" /></div>
          <div><Lbl req>Đến ngày</Lbl><input type="date" value={f.to} onChange={upd('to')} className="w-full h-10 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60" /></div>
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer select-none">
          <input type="checkbox" checked={f.half} onChange={upd('half')} className="h-4 w-4 rounded accent-primary cursor-pointer" />
          <span className="text-[13px] text-foreground/85">Nghỉ nửa ngày</span>
        </label>
        <div>
          <Lbl req>Lý do</Lbl>
          <textarea value={f.reason} onChange={upd('reason')} rows={3} placeholder="Nhập lý do xin nghỉ…"
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 resize-none placeholder:text-muted-foreground/50" />
        </div>
        <div className="pt-2 flex items-center justify-end gap-2">
          <Btn variant="primary" icon="Send" onClick={onSubmit}>Gửi đơn</Btn>
        </div>
      </div>
    </div>
  );
};

// ── Info table (tab) — remaining leave per member ─────────────────
const LEAVE_INFO_ROWS = [
  { name: 'default user',        email: 'bladeandsoul3337@yopmail.com', branch: '—',       used: 0,   curr: 12, prev: 0,   active: true },
  { name: 'Trần Cao Quý',        email: 'quytc@yopmail.com',            branch: 'Hà Nội',  used: 4,   curr: 10, prev: 2,   active: true },
  { name: 'Tiến Lê Đức',         email: 'tienld@yopmail.com',           branch: 'Hà Nội',  used: 6,   curr: 8,  prev: 0,   active: true },
  { name: 'Đỗ Thị Hương Lan',    email: 'landth@yopmail.com',           branch: 'Hà Nội',  used: 2.5, curr: 11.5, prev: 1, active: true },
  { name: 'Nguyễn Tấn Nam',      email: 'namnt@yopmail.com',            branch: 'Đà Nẵng', used: 9,   curr: 5,  prev: 0,   active: true },
  { name: 'Lê Minh Long',        email: 'longlm@yopmail.com',           branch: 'Hà Nội',  used: 1,   curr: 13, prev: 3,   active: true },
  { name: 'Phạm Văn Hậu',        email: 'haupv@yopmail.com',            branch: 'Hà Nội',  used: 7,   curr: 7,  prev: 0,   active: false },
  { name: 'Đặng Đình Nhân',      email: 'nhandd@yopmail.com',           branch: 'Đà Nẵng', used: 3,   curr: 11, prev: 0,   active: true },
  { name: 'Lương Minh Thiệu',    email: 'luongminhthieu@yopmail.com',   branch: 'Hà Nội',  used: 12,  curr: 4,  prev: 2,   active: true },
  { name: 'Trịnh Ngọc Tuấn',     email: 'tuantn@yopmail.com',           branch: 'Đà Nẵng', used: 0,   curr: 14, prev: 0,   active: false },
];
const INFO_BRANCHES = ['Hà Nội', 'Đà Nẵng', 'Hồ Chí Minh', 'Osaka'];

const Toggle = ({ on, onClick }) => (
  <button onClick={onClick} role="switch" aria-checked={on}
    className="relative inline-flex h-5 w-9 rounded-full transition-colors shrink-0"
    style={{ background: on ? 'hsl(160 60% 45%)' : 'hsl(var(--border))' }}>
    <span className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all" style={{ left: on ? 18 : 2 }} />
  </button>
);

const LeaveInfoTable = ({ onAddDays, onCreateLeave }) => {
  const [rows, setRows] = React.useState(LEAVE_INFO_ROWS);
  const [search, setSearch] = React.useState('');
  const [branch, setBranch] = React.useState('');
  const [applied, setApplied] = React.useState({ search: '', branch: '' });

  const filtered = rows.filter(r =>
    (!applied.search || r.name.toLowerCase().includes(applied.search.toLowerCase())) &&
    (!applied.branch || r.branch === applied.branch)
  );
  const num = n => n.toFixed(2);

  return (
    <div className="space-y-4 rise">
      {/* Search bar */}
      <div className="card-surface p-4">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto] gap-4 items-end">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Tìm kiếm tên</label>
            <div className="relative">
              <Icon.Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm kiếm…"
                className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 placeholder:text-muted-foreground/50" />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">Chi nhánh</label>
            <Select value={branch} onChange={e => setBranch(e.target.value)} width="100%" placeholder="Tất cả"
              options={INFO_BRANCHES.map(b => ({ value: b, label: b }))} />
          </div>
          <Btn variant="primary" icon="Search" onClick={() => setApplied({ search, branch })}>Tìm kiếm</Btn>
          <Btn variant="outline" icon="External">Tải lên</Btn>
        </div>
      </div>

      {/* Table */}
      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]" style={{ minWidth: 880 }}>
            <thead>
              <tr className="thead-primary text-[11px] uppercase tracking-wider font-semibold">
                <th rowSpan={2} className="text-left py-3 px-5 border-b border-border/40 align-middle">Tên</th>
                <th rowSpan={2} className="text-left py-3 px-3 border-b border-border/40 align-middle">Email</th>
                <th rowSpan={2} className="text-left py-3 px-3 border-b border-border/40 align-middle">Chi nhánh</th>
                <th rowSpan={2} className="text-center py-3 px-3 border-b border-border/40 align-middle">Ngày nghỉ<br/>đã dùng</th>
                <th colSpan={2} className="text-center py-2 px-3 border-b border-l border-border/40">Ngày nghỉ còn lại</th>
                <th rowSpan={2} className="text-center py-3 px-5 border-b border-border/40 align-middle w-56">Hành động</th>
              </tr>
              <tr className="thead-primary text-[11px] uppercase tracking-wider font-semibold">
                <th className="text-center py-2 px-3 border-b border-l border-border/40">Năm nay</th>
                <th className="text-center py-2 px-3 border-b border-border/40">Năm trước</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={i} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-5"><div className="flex items-center gap-2.5"><Avatar name={r.name} size={30} /><span className="font-medium text-foreground">{r.name}</span></div></td>
                  <td className="py-3 px-3 font-mono text-[12px] text-muted-foreground">{r.email}</td>
                  <td className="py-3 px-3 text-foreground/85">{r.branch}</td>
                  <td className="py-3 px-3 text-center tabular-nums text-amber-600 font-semibold">{num(r.used)}</td>
                  <td className="py-3 px-3 text-center tabular-nums font-bold text-emerald-600 border-l border-border/40">{num(r.curr)}</td>
                  <td className="py-3 px-3 text-center tabular-nums text-muted-foreground">{num(r.prev)}</td>
                  <td className="py-3 px-5">
                    <div className="flex items-center justify-end gap-1.5">
                      <Btn variant="outline" size="xs" icon="Plus" onClick={() => onAddDays(r)}>Thêm ngày nghỉ</Btn>
                      <Btn variant="primary" size="xs" icon="Send" onClick={() => onCreateLeave(r)}>Tạo xin nghỉ</Btn>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-14 text-center text-muted-foreground">
                  <Icon.CalendarCheck size={36} className="mx-auto mb-2 opacity-30" />Không tìm thấy bản ghi
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
        {/* Footer */}
        <div className="flex items-center justify-between gap-4 flex-wrap px-5 py-3 border-t border-border/70 bg-muted/10">
          <span className="text-[12.5px] text-muted-foreground">Tổng bản ghi: <span className="font-semibold text-foreground tabular-nums">{filtered.length}</span></span>
          <div className="flex items-center gap-1">
            <button className="h-7 w-7 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"><Icon.ChevronRight size={12} className="rotate-180" /></button>
            <button className="h-7 min-w-7 px-2 rounded-md text-[12px] font-medium text-white" style={{ background: 'hsl(var(--primary))' }}>1</button>
            <button className="h-7 min-w-7 px-2 rounded-md border border-border bg-card text-[12px] font-medium text-foreground/70 hover:border-primary/50 transition-colors">2</button>
            <button className="h-7 min-w-7 px-2 rounded-md border border-border bg-card text-[12px] font-medium text-foreground/70 hover:border-primary/50 transition-colors">3</button>
            <button className="h-7 w-7 rounded-md border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"><Icon.ChevronRight size={12} /></button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── History table (tab) — added-days log ──────────────────────────
const LeaveHistoryTable = () => {
  const rows = [
    { date: '01/01/2026', name: 'Nguyễn Tấn Nam',      amount: '+14', reason: 'Cấp phép năm 2026',      by: 'Hệ thống' },
    { date: '01/01/2026', name: 'Đỗ Thị Hương Lan',    amount: '+14', reason: 'Cấp phép năm 2026',      by: 'Hệ thống' },
    { date: '15/03/2026', name: 'Trần Cao Quý',        amount: '+2',  reason: 'Thưởng phép dự án XYZ',   by: 'Hoàng Đức Thành' },
    { date: '02/04/2026', name: 'Nam Vo',              amount: '+1',  reason: 'Bù ngày lễ làm việc',    by: 'Phạm Thu Hà' },
    { date: '20/04/2026', name: 'Lương Minh Thiệu',    amount: '-1',  reason: 'Điều chỉnh sai sót',     by: 'Phạm Thu Hà' },
  ];
  return (
    <div className="card-surface overflow-hidden rise">
      <table className="w-full text-[13px]">
        <thead>
          <tr className="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
            <th className="text-left py-3 px-5">Ngày</th>
            <th className="text-left py-3 px-3">Nhân viên</th>
            <th className="text-center py-3 px-3">Số ngày</th>
            <th className="text-left py-3 px-3">Lý do</th>
            <th className="text-left py-3 px-5">Người thực hiện</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
              <td className="py-3 px-5 font-mono text-muted-foreground">{r.date}</td>
              <td className="py-3 px-3"><div className="flex items-center gap-2.5"><Avatar name={r.name} size={28} /><span className="font-medium text-foreground">{r.name}</span></div></td>
              <td className="py-3 px-3 text-center"><span className={'font-bold tabular-nums ' + (r.amount.startsWith('-') ? 'text-red-500' : 'text-emerald-600')}>{r.amount}</span></td>
              <td className="py-3 px-3 text-foreground/85">{r.reason}</td>
              <td className="py-3 px-5 text-muted-foreground">{r.by}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ── Add-days modal ────────────────────────────────────────────────
const LEAVE_ADD_TYPES = ['Nghỉ thường niên', 'Nghỉ thâm niên', 'Nghỉ ốm', 'Nghỉ cưới', 'Nghỉ thai sản', 'Nghỉ tang lễ', 'Xóa phép', 'Phép OT'];

const AddDaysModal = ({ row, onClose, onSave }) => {
  const [f, setF] = React.useState({ type: '', amount: '1', year: '2026', reason: '' });
  const [err, setErr] = React.useState({});
  const upd = k => e => { setF(p => ({ ...p, [k]: e.target.value })); setErr(p => ({ ...p, [k]: '' })); };
  const Lbl = ({ children, req }) => <label className="block text-[11px] font-semibold uppercase tracking-[0.09em] text-muted-foreground mb-1.5">{children}{req && <span className="text-red-400 ml-0.5">*</span>}</label>;

  const used = row.used ?? 0;
  const remaining = (row.remaining ?? ((row.curr ?? 0) + (row.prev ?? 0)));

  const submit = () => {
    const e = {};
    if (!f.type) e.type = 1;
    if (!f.amount || Number(f.amount) <= 0) e.amount = 1;
    if (!f.reason.trim()) e.reason = 1;
    if (Object.keys(e).length) { setErr(e); return; }
    onSave(f);
  };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:60, display:'flex', alignItems:'center', justifyContent:'center', padding:'1rem' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.45)', backdropFilter:'blur(4px)' }} />
      <div className="relative card-surface rise" style={{ maxWidth:720, width:'100%', zIndex:1, borderRadius:20, overflow:'hidden', animationDuration:'0.2s' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background:'linear-gradient(135deg,hsl(var(--primary-h) var(--primary-s) 65%),hsl(var(--primary-h) var(--primary-s) 45%))' }}>
              <Icon.Plus size={15} className="text-white" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[15px] text-foreground">Thêm ngày nghỉ</h3>
              <p className="text-[11.5px] text-muted-foreground">Cấp / điều chỉnh quỹ phép cho nhân viên</p>
            </div>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"><Icon.X size={14} /></button>
        </div>

        {/* Body — 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-[230px_1fr]">
          {/* Left: member info */}
          <div className="p-6 border-b md:border-b-0 md:border-r border-border/70 bg-muted/20">
            <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-primary mb-4">Thông tin thành viên</p>
            <div className="flex flex-col items-center text-center">
              <Avatar name={row.name} size={64} />
              <p className="font-semibold text-[14px] text-foreground mt-3">{row.name}</p>
              <p className="text-[11.5px] text-muted-foreground font-mono break-all mt-0.5">{row.email || '—'}</p>
            </div>
            <div className="mt-5 pt-4 border-t border-border/60 space-y-3">
              <div>
                <p className="text-[10.5px] uppercase tracking-wide font-semibold text-muted-foreground">Ngày nghỉ đã dùng</p>
                <p className="text-[18px] font-bold font-heading text-foreground tabular-nums mt-0.5">{used.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-[10.5px] uppercase tracking-wide font-semibold text-muted-foreground">Ngày nghỉ còn lại</p>
                <p className="text-[18px] font-bold font-heading tabular-nums mt-0.5" style={{ color: 'hsl(var(--primary))' }}>{remaining.toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="p-6 space-y-4">
            <div>
              <Lbl req>Loại phép</Lbl>
              <Select value={f.type} onChange={upd('type')} width="100%" placeholder="— Chọn loại phép —"
                options={LEAVE_ADD_TYPES.map(t => ({ value: t, label: t }))} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Lbl req>Số ngày</Lbl>
                <input type="number" step="0.5" min="0" value={f.amount} onChange={upd('amount')}
                  style={err.amount ? { borderColor: 'rgb(248 113 113)' } : undefined}
                  className={'w-full h-9 px-3 rounded-lg border bg-card text-[13px] text-foreground outline-none ' + (err.amount ? 'border-red-400' : 'border-border focus:border-primary/60')} />
              </div>
              <div>
                <Lbl req>Năm</Lbl>
                <Select value={f.year} onChange={upd('year')} width="100%" placeholder={null}
                  options={['2025','2026','2027'].map(y => ({ value: y, label: y }))} />
              </div>
            </div>

            <div>
              <Lbl req>Lí do</Lbl>
              <textarea value={f.reason} onChange={upd('reason')} rows={4} placeholder="VD: Thưởng phép dự án, bù ngày lễ, điều chỉnh quỹ phép…"
                style={err.reason ? { borderColor: 'rgb(248 113 113)' } : undefined}
                className={'w-full px-3 py-2 rounded-lg border bg-card text-[13px] text-foreground outline-none resize-none placeholder:text-muted-foreground/45 ' + (err.reason ? 'border-red-400' : 'border-border focus:border-primary/60')} />
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Btn variant="outline" size="sm" onClick={onClose}>Hủy</Btn>
              <Btn variant="primary" size="sm" icon="Plus" onClick={submit}>Thêm</Btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

window.PageLeave = PageLeave;