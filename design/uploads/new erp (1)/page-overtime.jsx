/* Yêu cầu > Tăng ca (OT) — request management + calendar view */

const OT_REQUESTS = [
  { id:1,  user:'Nguyễn Văn An',    branch:'Hà Nội',  project:'Cổng thanh toán XYZ',    date:'20/05/2026', start:'18:00', end:'22:00', hours:4,  reason:'Hoàn thành module checkout trước deadline Q2',       status:'approved',  approver:'Hoàng Đức Thành', approved:'21/05/2026', submitted:'19/05/2026' },
  { id:2,  user:'Lê Quang Huy',     branch:'HCM',     project:'App giao đồ ăn FoodGo',  date:'21/05/2026', start:'19:00', end:'23:00', hours:4,  reason:'Fix critical bug login flow trước release',           status:'approved',  approver:'Phạm Thu Hà',     approved:'21/05/2026', submitted:'21/05/2026' },
  { id:3,  user:'Trần Thị Mai',     branch:'Đà Nẵng', project:'Hệ thống CRM nội bộ',   date:'22/05/2026', start:'17:30', end:'20:30', hours:3,  reason:'Viết test case sprint review hôm nay',               status:'pending',   approver:null,              approved:null,          submitted:'22/05/2026' },
  { id:4,  user:'Phạm Thu Hà',      branch:'Đà Nẵng', project:'Quản lý kho ABC v2',     date:'23/05/2026', start:'18:00', end:'21:00', hours:3,  reason:'Họp planning sprint với khách hàng Tokyo',           status:'pending',   approver:null,              approved:null,          submitted:'22/05/2026' },
  { id:5,  user:'Đỗ Minh Tuấn',     branch:'Hà Nội',  project:'Cổng thanh toán XYZ',    date:'18/05/2026', start:'18:00', end:'23:00', hours:5,  reason:'Deploy hotfix patch production',                      status:'approved',  approver:'Hoàng Đức Thành', approved:'18/05/2026', submitted:'18/05/2026' },
  { id:6,  user:'Vũ Thị Lan',       branch:'Hà Nội',  project:'Mobile companion app',   date:'17/05/2026', start:'19:00', end:'22:00', hours:3,  reason:'Finalize mockup cho sprint demo Nhật Bản',           status:'rejected',  approver:'Hoàng Đức Thành', approved:'18/05/2026', submitted:'17/05/2026', rejectReason:'Có thể làm trong giờ hành chính.' },
  { id:7,  user:'Bùi Đức Thành',    branch:'Osaka',   project:'Cổng tích hợp API v3',   date:'15/05/2026', start:'17:00', end:'20:00', hours:3,  reason:'Support khách hàng Osaka bị issue production',       status:'approved',  approver:'Phạm Thu Hà',     approved:'15/05/2026', submitted:'15/05/2026' },
  { id:8,  user:'Hoàng Đức Thành',  branch:'Hà Nội',  project:'Module báo cáo BI',      date:'14/05/2026', start:'20:00', end:'23:00', hours:3,  reason:'Chuẩn bị slide báo cáo Q2 cho board meeting',        status:'approved',  approver:'CEO',             approved:'14/05/2026', submitted:'14/05/2026' },
  { id:9,  user:'Nguyễn Văn An',    branch:'Hà Nội',  project:'Cổng thanh toán XYZ',    date:'10/05/2026', start:'18:00', end:'22:00', hours:4,  reason:'Integration testing với đối tác VNPay',             status:'approved',  approver:'Hoàng Đức Thành', approved:'10/05/2026', submitted:'10/05/2026' },
  { id:10, user:'Lý Quỳnh Anh',     branch:'Hà Nội',  project:'Cổng tích hợp API v3',   date:'25/05/2026', start:'18:00', end:'21:00', hours:3,  reason:'Code review PR backlog trước sprint close',          status:'pending',   approver:null,              approved:null,          submitted:'22/05/2026' },
];

const OT_STATUS_META = {
  pending:  { label:'Chờ duyệt', variant:'amber', dot:true },
  approved: { label:'Đã duyệt',  variant:'green', dot:true },
  rejected: { label:'Từ chối',   variant:'red',   dot:true },
};

/* Hours worked OT per day in May 2026 for the bar chart */
const OT_BY_DAY = (() => {
  const m = {};
  OT_REQUESTS.filter(r => r.status === 'approved').forEach(r => {
    const d = parseInt(r.date.split('/')[0]);
    m[d] = (m[d] || 0) + r.hours;
  });
  return m;
})();

const MY_OT_HOURS = OT_REQUESTS.filter(r => r.user === 'Nguyễn Văn An').reduce((a,r) => a + (r.status !== 'rejected' ? r.hours : 0), 0);

const PageOvertime = () => {
  const [tab, setTab] = React.useState('manage'); // manage | mine
  const [statusF, setStatusF] = React.useState('');
  const [search, setSearch] = React.useState('');
  const [requests, setRequests] = React.useState(OT_REQUESTS);
  const [openReject, setOpenReject] = React.useState(null);
  const [rejectReason, setRejectReason] = React.useState('');
  const [showCreate, setShowCreate] = React.useState(false);

  const filtered = requests.filter(r => {
    if (tab === 'mine' && r.user !== 'Nguyễn Văn An') return false;
    if (statusF && r.status !== statusF) return false;
    if (search && !r.user.toLowerCase().includes(search.toLowerCase()) && !r.project.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const pending = requests.filter(r => r.status === 'pending').length;
  const approvedThisMonth = requests.filter(r => r.status === 'approved').length;
  const totalHours = requests.filter(r => r.status === 'approved').reduce((a,r) => a+r.hours, 0);
  const myPending = requests.filter(r => r.user === 'Nguyễn Văn An' && r.status === 'pending').length;

  const handleApprove = (row) => setRequests(rs => rs.map(r => r.id === row.id ? { ...r, status:'approved', approver:'Hoàng Đức Thành' } : r));
  const handleReject = (row, reason) => {
    setRequests(rs => rs.map(r => r.id === row.id ? { ...r, status:'rejected', approver:'Hoàng Đức Thành', rejectReason: reason } : r));
    setOpenReject(null); setRejectReason('');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Yêu cầu"
        title="Quản lý tăng ca (OT)"
        description="Theo dõi và phê duyệt yêu cầu làm thêm giờ. Admin có thể duyệt/từ chối; nhân viên theo dõi trạng thái đơn của mình."
        actions={
          <>
            <Btn variant="outline" icon="FileText">Xuất Excel</Btn>
            <Btn variant="primary" icon="Plus" onClick={() => setShowCreate(true)}>Đăng ký OT</Btn>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat label="Chờ duyệt" value={pending} sublabel="Cần xử lý hôm nay" accent="amber" delay={40} />
        <MiniStat label="Đã duyệt tháng này" value={approvedThisMonth} sublabel={`${totalHours} giờ OT`} accent="green" delay={80} trend={{ dir:'up', value:'+3' }} />
        <MiniStat label="OT của tôi (tháng)" value={`${MY_OT_HOURS}h`} sublabel={`${myPending} đơn chờ duyệt`} accent="primary" delay={120} />
        <MiniStat label="Trung bình/người" value={`${(totalHours / 8).toFixed(1)}h`} sublabel="Mức khuyến cáo <20h/tháng" accent={totalHours/8 > 20 ? 'red' : 'violet'} delay={160} />
      </div>

      {/* Bottom: calendar heat + stats — full width, 3 cols */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          <SectionCard delay={200} title="OT tháng 5/2026 — theo ngày" action={<span className="text-[11px] font-mono text-muted-foreground">{totalHours}h tổng</span>}>
            <OTCalendar />
          </SectionCard>

          <SectionCard delay={260} title="Phân bổ OT theo dự án">
            <div className="space-y-3">
              {(() => {
                const byProject = {};
                requests.filter(r => r.status === 'approved').forEach(r => {
                  byProject[r.project] = (byProject[r.project] || 0) + r.hours;
                });
                const sorted = Object.entries(byProject).sort((a,b) => b[1]-a[1]);
                const maxH = sorted[0]?.[1] || 1;
                return sorted.map(([name, hours]) => (
                  <BarRow key={name} label={name.length > 22 ? name.slice(0, 20) + '…' : name} value={hours} max={maxH} accent={name === 'Cổng thanh toán XYZ'} />
                ));
              })()}
            </div>
          </SectionCard>

          <SectionCard delay={320} title="Top OT tháng này">
            <ul className="space-y-2.5">
              {(() => {
                const byUser = {};
                requests.filter(r => r.status === 'approved').forEach(r => { byUser[r.user] = (byUser[r.user]||0) + r.hours; });
                return Object.entries(byUser).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([name, hours], i) => (
                  <li key={name} className="flex items-center gap-3 text-[13px]">
                    <span className="w-5 text-center text-[11px] font-bold text-muted-foreground tabular-nums">#{i+1}</span>
                    <Avatar name={name} size={28} />
                    <span className="flex-1 font-medium text-foreground truncate">{name}</span>
                    <span className={`font-bold tabular-nums font-mono ${hours >= 12 ? 'text-amber-600' : 'text-foreground'}`}>{hours}h</span>
                    {hours >= 16 && <span className="text-[10px] text-amber-600">⚠</span>}
                  </li>
                ));
              })()}
            </ul>
          </SectionCard>
        </div>

      {/* Table — full width */}
      <div className="space-y-4">
          {/* Tab + filters */}
          <div className="border-b border-border/70">
            <div className="flex gap-7">
              {[
                { k:'manage', l:'Tất cả yêu cầu', n:requests.length },
                { k:'mine', l:'Đơn của tôi', n:requests.filter(r=>r.user==='Nguyễn Văn An').length },
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
            <FieldInput icon="Search" placeholder="Tên hoặc tên dự án…" value={search} onChange={e => setSearch(e.target.value)} width={200} />
            <Select value={statusF} onChange={e => setStatusF(e.target.value)} placeholder="Tất cả trạng thái" width={150}
              options={Object.entries(OT_STATUS_META).map(([k,v])=>({value:k,label:v.label}))} />
          </FilterBar>

          <div className="card-surface overflow-hidden rise" style={{ animationDelay:'160ms' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="text-left py-3 px-5">Nhân viên</th>
                    <th className="text-left py-3 px-3">Dự án</th>
                    <th className="text-left py-3 px-3">Ngày · Thời gian</th>
                    <th className="text-center py-3 px-3">Giờ</th>
                    <th className="text-center py-3 px-3">Trạng thái</th>
                    <th className="text-right py-3 px-5">Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <Avatar name={r.user} size={30} />
                          <div>
                            <p className="font-semibold text-foreground">{r.user}</p>
                            <p className="text-[11px] text-muted-foreground">{r.branch}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <p className="text-foreground/85 text-[12.5px] truncate max-w-[200px]">{r.project}</p>
                        <p className="text-[11px] text-muted-foreground truncate max-w-[200px]">{r.reason}</p>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-mono text-foreground/85">{r.date}</p>
                        <p className="text-[11.5px] font-mono text-primary">{r.start} – {r.end}</p>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className="font-bold tabular-nums text-foreground">{r.hours}</span>
                        <span className="text-muted-foreground text-[11px]">h</span>
                      </td>
                      <td className="py-3 px-3 text-center">
                        <div>
                          <Badge variant={OT_STATUS_META[r.status].variant} dot>{OT_STATUS_META[r.status].label}</Badge>
                          {r.status === 'rejected' && r.rejectReason && (
                            <p className="text-[10.5px] text-muted-foreground mt-0.5 italic truncate max-w-[100px]">{r.rejectReason}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-5 text-right">
                        {r.status === 'pending' ? (
                          tab === 'manage' ? (
                            <div className="inline-flex gap-1.5">
                              <Btn variant="success" size="xs" icon="Check" onClick={() => handleApprove(r)}>Duyệt</Btn>
                              <Btn variant="ghost" size="xs" onClick={() => { setOpenReject(r); setRejectReason(''); }}>Từ chối</Btn>
                            </div>
                          ) : (
                            <Btn variant="ghost" size="xs">Huỷ đơn</Btn>
                          )
                        ) : (
                          <span className="text-[11px] text-muted-foreground">{r.approver || '—'}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan="6" className="py-14 text-center text-muted-foreground">
                      <Icon.Clock size={36} className="mx-auto mb-2 opacity-30" />
                      Không có yêu cầu OT phù hợp
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      {/* Reject modal */}
      {openReject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setOpenReject(null)} />
          <div className="relative card-surface w-full max-w-md rise overflow-hidden">
            <div className="p-5 border-b border-border/70 flex items-center justify-between">
              <h3 className="font-bold text-[16px] font-heading">Từ chối yêu cầu OT</h3>
              <button onClick={() => setOpenReject(null)} className="p-2 rounded-md hover:bg-muted text-muted-foreground"><Icon.X size={14} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/40">
                <Avatar name={openReject.user} size={32} />
                <div>
                  <p className="font-semibold">{openReject.user}</p>
                  <p className="text-[12px] text-muted-foreground">{openReject.date} · {openReject.hours}h · {openReject.project}</p>
                </div>
              </div>
              <div>
                <label className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1.5">Lý do từ chối <span className="text-red-500">*</span></label>
                <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối để nhân viên được thông báo…" rows={3}
                  className="w-full px-3 py-2 rounded-md border border-border bg-muted/30 text-[13px] outline-none focus:border-primary/60 resize-none" />
              </div>
            </div>
            <div className="px-5 py-3 border-t border-border/70 flex items-center justify-end gap-2">
              <Btn variant="ghost" size="sm" onClick={() => setOpenReject(null)}>Huỷ</Btn>
              <Btn variant="danger" size="sm" icon="X" onClick={() => handleReject(openReject, rejectReason)} className={!rejectReason.trim() ? 'opacity-50 pointer-events-none' : ''}>
                Xác nhận từ chối
              </Btn>
            </div>
          </div>
        </div>
      )}

      {showCreate && <OTCreateModal onClose={() => setShowCreate(false)} />}
    </div>
  );
};

/* Heatmap calendar showing OT hours per day */
const OTCalendar = () => {
  const daysInMay = 31;
  const firstDow = (new Date(2026, 4, 1).getDay() + 6) % 7; // Mon-first
  const cells = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMay; d++) cells.push(d);
  while (cells.length % 7) cells.push(null);

  const maxH = Math.max(...Object.values(OT_BY_DAY), 1);

  return (
    <div>
      <div className="grid grid-cols-7 gap-1">
        {['T2','T3','T4','T5','T6','T7','CN'].map(d => (
          <div key={d} className="text-[10px] uppercase font-semibold text-muted-foreground text-center py-1">{d}</div>
        ))}
        {cells.map((d, i) => {
          if (!d) return <div key={i} />;
          const h = OT_BY_DAY[d] || 0;
          const isToday = d === 22;
          const intensity = h > 0 ? Math.max(0.15, h / maxH) : 0;
          return (
            <div
              key={i}
              title={h > 0 ? `${d}/5: ${h}h OT` : `${d}/5`}
              className={'aspect-square rounded-md flex items-center justify-center cursor-pointer transition-all hover:scale-[1.05] relative ' +
                (isToday ? 'ring-1 ring-primary' : '')}
              style={{
                background: h > 0
                  ? `hsl(var(--primary-h) var(--primary-s) ${Math.round(58 - intensity * 18)}% / ${Math.round(intensity * 85 + 15)}%)`
                  : 'hsl(var(--muted))',
              }}
            >
              <span className={`text-[11px] tabular-nums font-medium ${h > 0 ? 'text-white' : isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>{d}</span>
              {h > 0 && <span className="absolute bottom-0.5 right-0.5 text-[7.5px] font-bold text-white/80">{h}</span>}
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-3 text-[10.5px] text-muted-foreground">
        <span>Ít giờ</span>
        <div className="flex gap-0.5">
          {[0.2,0.4,0.6,0.8,1].map(i => (
            <div key={i} className="w-3.5 h-3.5 rounded-sm" style={{ background:`hsl(var(--primary-h) var(--primary-s) ${Math.round(58-i*18)}% / ${Math.round(i*85+15)}%)` }} />
          ))}
        </div>
        <span>Nhiều giờ</span>
      </div>
    </div>
  );
};

const OTCreateModal = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
    <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
    <div className="relative card-surface w-full max-w-lg rise overflow-hidden">
      <div className="p-5 border-b border-border/70 flex items-center justify-between">
        <h3 className="font-bold text-[16px] font-heading">Đăng ký tăng ca</h3>
        <button onClick={onClose} className="p-2 rounded-md hover:bg-muted text-muted-foreground"><Icon.X size={14} /></button>
      </div>
      <div className="p-5 space-y-4 text-[13px]">
        <div>
          <label className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1.5">Dự án</label>
          <Select value="" placeholder="-- Chọn dự án --" onChange={() => {}} width="100%"
            options={['Cổng thanh toán XYZ','Hệ thống CRM nội bộ','App giao đồ ăn FoodGo','Module báo cáo BI'].map(p=>({value:p,label:p}))} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1.5">Ngày làm OT</label>
            <input type="date" defaultValue="2026-05-23" className="w-full h-9 px-3 rounded-md border border-border bg-muted/30 text-[13px] outline-none focus:border-primary/60" />
          </div>
          <div>
            <label className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1.5">Từ</label>
            <input type="time" defaultValue="18:00" className="w-full h-9 px-3 rounded-md border border-border bg-muted/30 text-[13px] outline-none focus:border-primary/60 font-mono" />
          </div>
          <div>
            <label className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1.5">Đến</label>
            <input type="time" defaultValue="21:00" className="w-full h-9 px-3 rounded-md border border-border bg-muted/30 text-[13px] outline-none focus:border-primary/60 font-mono" />
          </div>
        </div>
        <div>
          <label className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider block mb-1.5">Lý do</label>
          <textarea placeholder="Mô tả công việc cần hoàn thành…" rows={3}
            className="w-full px-3 py-2 rounded-md border border-border bg-muted/30 text-[13px] outline-none focus:border-primary/60 resize-none" />
        </div>
        <div className="rounded-lg bg-muted/40 p-3 text-[12px] text-muted-foreground">
          <p className="font-semibold text-foreground mb-0.5">Lưu ý:</p>
          <p>OT tháng này của bạn: <span className="font-semibold text-primary">{MY_OT_HOURS}h</span> / giới hạn khuyến cáo 20h. Đơn sẽ được gửi đến quản lý trực tiếp để duyệt.</p>
        </div>
      </div>
      <div className="px-5 py-3 border-t border-border/70 flex items-center justify-end gap-2">
        <Btn variant="ghost" size="sm" onClick={onClose}>Huỷ</Btn>
        <Btn variant="primary" size="sm" icon="Check">Gửi yêu cầu</Btn>
      </div>
    </div>
  </div>
);

window.PageOvertime = PageOvertime;
