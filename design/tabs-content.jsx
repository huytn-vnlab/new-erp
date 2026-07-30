/* Three tab panels: Company, Personal, Project */

const SectionCard = ({ title, action, children, className = '', delay = 0 }) =>
<div className={'card-surface rise ' + className} style={{ animationDelay: `${delay}ms` }}>
    {(title || action) &&
  <div className="px-5 py-3.5 border-b border-border/70 flex items-center justify-between gap-3">
        <h3 className="section-title" style={{ fontFamily: "\"Plus Jakarta Sans\"" }}>{title}</h3>
        {action}
      </div>
  }
    <div className="p-5">{children}</div>
  </div>;


/* ---------- Reminder calendar (modal) ---------- */
const CAL_TYPE_META = {
  birthday: { label: 'Sinh nhật', bg: 'hsl(38 92% 95%)', fg: 'hsl(35 90% 42%)', dot: '#f59e0b' },
  anniversary: { label: 'Kỷ niệm vào công ty', bg: 'hsl(203 89% 95%)', fg: 'hsl(203 89% 42%)', dot: '#38bdf8' },
  contract: { label: 'Gia hạn hợp đồng', bg: 'hsl(160 60% 94%)', fg: 'hsl(160 60% 34%)', dot: '#10b981' } };

const CAL_EVENTS = [
{ d: '2026-05-05', type: 'birthday', text: 'Sinh nhật Nguyễn Hải Đăng', sub: 'Hà Nội · 29 tuổi' },
{ d: '2026-05-12', type: 'anniversary', text: 'Vào công ty Vũ Thị Lan', sub: '2 năm tại VNLab' },
{ d: '2026-05-18', type: 'contract', text: 'Gia hạn hợp đồng Ngô Bảo Châu', sub: 'HĐ xác định thời hạn · 12 tháng' },
{ d: '2026-05-21', type: 'birthday', text: 'Sinh nhật Trần Thị Mai', sub: 'Đà Nẵng · 25 tuổi' },
{ d: '2026-05-21', type: 'anniversary', text: 'Vào công ty Bùi Anh Khoa', sub: '5 năm tại VNLab' },
{ d: '2026-05-24', type: 'anniversary', text: 'Vào công ty Hoàng Đức Thành', sub: '3 năm tại VNLab' },
{ d: '2026-05-25', type: 'birthday', text: 'Sinh nhật Đỗ Minh Tuấn', sub: 'Hà Nội · 31 tuổi' },
{ d: '2026-05-29', type: 'contract', text: 'Gia hạn hợp đồng Trịnh Văn Nam', sub: 'HĐ thử việc → chính thức' },
{ d: '2026-06-03', type: 'contract', text: 'Gia hạn hợp đồng Lê Quang Huy', sub: 'HĐ xác định thời hạn · 24 tháng' },
{ d: '2026-06-08', type: 'birthday', text: 'Sinh nhật Phan Thị Ngọc', sub: 'Đà Nẵng · 27 tuổi' },
{ d: '2026-06-15', type: 'anniversary', text: 'Vào công ty Lý Thanh Sơn', sub: '1 năm tại VNLab' },
{ d: '2026-06-19', type: 'contract', text: 'Gia hạn hợp đồng Phạm Thu Hà', sub: 'HĐ không xác định thời hạn' }];

const CAL_TODAY = '2026-05-21';

const ReminderCalendar = ({ onClose }) => {
  const [month, setMonth] = React.useState(4); // 0-indexed, May 2026
  const [selected, setSelected] = React.useState(CAL_TODAY);
  const [filters, setFilters] = React.useState({ birthday: true, anniversary: true, contract: true });
  const year = 2026;

  const toggle = (k) => setFilters((f) => ({ ...f, [k]: !f[k] }));
  const visible = CAL_EVENTS.filter((e) => filters[e.type]);
  const key = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const lead = (new Date(year, month, 1).getDay() + 6) % 7;
  const prevDays = new Date(year, month, 0).getDate();
  const cells = [];
  for (let i = lead - 1; i >= 0; i--) cells.push({ day: prevDays - i, out: true, k: key(year, month - 1, prevDays - i) });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, out: false, k: key(year, month, d) });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - lead - daysInMonth + 1, out: true, k: 'next-' + cells.length });

  const selectedEvents = visible.filter((e) => e.d === selected);
  const monthEvents = visible.filter((e) => e.d.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`));
  const fmtLong = (k) => {
    const [y, m, d] = k.split('-').map(Number);
    const wd = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][new Date(y, m - 1, d).getDay()];
    return `${wd}, ${d}/${m}/${y}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card-surface w-full max-w-4xl rise overflow-hidden">
        <div className="px-5 py-4 border-b border-border/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary"><Icon.Calendar size={18} /></span>
            <div>
              <h3 className="text-[17px] font-bold font-heading leading-tight">Lịch nhắc nhở</h3>
              <p className="text-[12px] text-muted-foreground">{monthEvents.length} sự kiện trong tháng {month + 1}/{year}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border/70 p-0.5">
              <button onClick={() => setMonth((m) => Math.max(0, m - 1))} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><span className="block rotate-180"><Icon.ChevronRight size={15} /></span></button>
              <span className="text-[12.5px] font-semibold px-2 tabular-nums">Tháng {month + 1}/{year}</span>
              <button onClick={() => setMonth((m) => Math.min(11, m + 1))} className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"><Icon.ChevronRight size={15} /></button>
            </div>
            <button onClick={onClose} className="p-2 rounded-md hover:bg-muted text-muted-foreground"><Icon.X size={16} /></button>
          </div>
        </div>

        <div className="px-5 py-2.5 border-b border-border/70 flex items-center gap-2 flex-wrap">
          {Object.entries(CAL_TYPE_META).map(([k, m]) =>
          <button
            key={k}
            onClick={() => toggle(k)}
            className={'flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full border transition-colors ' + (
            filters[k] ? 'border-transparent font-medium' : 'border-border/70 text-muted-foreground')}
            style={filters[k] ? { background: m.bg, color: m.fg } : undefined}>
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: filters[k] ? m.dot : 'currentColor' }} />
              {m.label}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px]">
          <div className="p-5">
            <div className="grid grid-cols-7 gap-1 mb-1">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) =>
              <div key={d} className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground text-center py-1">{d}</div>
              )}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {cells.map((c, i) => {
                const evs = c.out ? [] : visible.filter((e) => e.d === c.k);
                const isToday = c.k === CAL_TODAY;
                const isSel = !c.out && c.k === selected;
                return (
                  <button
                    key={i}
                    disabled={c.out}
                    onClick={() => setSelected(c.k)}
                    className={'h-[74px] rounded-lg border text-left p-1.5 flex flex-col gap-1 transition-colors ' + (
                    c.out ? 'border-transparent text-muted-foreground/35' :
                    isSel ? 'border-primary bg-primary/[0.06]' : 'border-border/60 hover:bg-muted/40')}>
                    <span className={'text-[12px] tabular-nums font-medium h-5 w-5 flex items-center justify-center rounded-full ' + (isToday ? 'bg-primary text-primary-foreground font-bold' : '')}>{c.day}</span>
                    <span className="flex flex-col gap-0.5 min-h-0">
                      {evs.slice(0, 2).map((e, j) =>
                      <span key={j} className="text-[10.5px] leading-[13px] truncate rounded px-1 py-[1px]" style={{ background: CAL_TYPE_META[e.type].bg, color: CAL_TYPE_META[e.type].fg }}>{e.text.replace(/^(Sinh nhật|Vào công ty|Gia hạn hợp đồng) /, '')}</span>
                      )}
                      {evs.length > 2 && <span className="text-[10px] text-muted-foreground px-1">+{evs.length - 2} khác</span>}
                    </span>
                  </button>);

              })}
            </div>
          </div>

          <div className="border-t lg:border-t-0 lg:border-l border-border/70 p-5 flex flex-col">
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Chi tiết ngày</p>
            <p className="text-[14px] font-bold font-heading mt-0.5">{fmtLong(selected)}</p>
            <div className="mt-4 space-y-2.5 flex-1">
              {selectedEvents.length === 0 &&
              <p className="text-[12.5px] text-muted-foreground italic">Không có nhắc nhở nào trong ngày này.</p>
              }
              {selectedEvents.map((e, i) => {
                const m = CAL_TYPE_META[e.type];
                const Ic = e.type === 'birthday' ? Icon.Cake : e.type === 'anniversary' ? Icon.Gift : Icon.Briefcase;
                return (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: m.bg, color: m.fg }}><Ic size={14} /></span>
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-medium leading-snug">{e.text}</p>
                      <p className="text-[11.5px] text-muted-foreground">{e.sub}</p>
                    </div>
                  </div>);

              })}
            </div>
            <div className="pt-4 mt-4 border-t border-border/70 flex items-center gap-2">
              <Btn variant="outline" size="sm" onClick={() => {setMonth(4);setSelected(CAL_TODAY);}}>Hôm nay</Btn>
            </div>
          </div>
        </div>
      </div>
    </div>);

};

/* ---------- Notification centre (modal) ---------- */
const NOTIF_META = {
  leave: { label: 'Nghỉ phép', icon: 'Calendar', bg: 'hsl(38 92% 95%)', fg: 'hsl(35 90% 42%)' },
  eval: { label: 'Đánh giá', icon: 'Star', bg: 'hsl(262 70% 95%)', fg: 'hsl(262 60% 48%)' },
  project: { label: 'Dự án', icon: 'Folder', bg: 'hsl(203 89% 95%)', fg: 'hsl(203 89% 42%)' },
  overtime: { label: 'Tăng ca', icon: 'Timer', bg: 'hsl(160 60% 94%)', fg: 'hsl(160 60% 34%)' },
  system: { label: 'Hệ thống', icon: 'Bell', bg: 'hsl(226 30% 94%)', fg: 'hsl(226 30% 40%)' } };

const ALL_NOTIFS = [
{ id: 1, cat: 'leave', t: 'Đơn nghỉ phép của Trần Thị Mai đang chờ duyệt', s: 'HR Admin', a: '5 phút', u: true, group: 'Hôm nay', act: 'Duyệt' },
{ id: 2, cat: 'eval', t: 'Báo cáo đánh giá Q1/2026 đã sẵn sàng', s: 'Evaluation Bot', a: '2 giờ', u: true, group: 'Hôm nay', act: 'Xem báo cáo' },
{ id: 3, cat: 'project', t: 'Bạn được thêm vào dự án “Cổng thanh toán XYZ”', s: 'Hoàng Đức Thành', a: '4 giờ', u: true, group: 'Hôm nay' },
{ id: 4, cat: 'overtime', t: 'Đơn tăng ca của Vũ Thị Lan đã được duyệt', s: 'PM Hà Nội', a: 'Hôm qua', u: false, group: 'Tuần này' },
{ id: 5, cat: 'system', t: 'Lương tháng 4 đã được phát', s: 'Finance', a: '3 ngày', u: false, group: 'Tuần này' },
{ id: 6, cat: 'leave', t: 'Đơn nghỉ không lương của Ngô Bảo Châu bị từ chối', s: 'HR Admin', a: '3 ngày', u: false, group: 'Tuần này' },
{ id: 7, cat: 'project', t: 'Dự án “ERP nội bộ” chuyển sang giai đoạn UAT', s: 'PM Đà Nẵng', a: '4 ngày', u: false, group: 'Tuần này' },
{ id: 8, cat: 'overtime', t: '5 đơn tăng ca tháng 4 chờ bạn xác nhận', s: 'Timekeeping Bot', a: '1 tuần', u: false, group: 'Cũ hơn', act: 'Xác nhận' },
{ id: 9, cat: 'system', t: 'Chính sách nghỉ phép 2026 đã được cập nhật', s: 'HR Admin', a: '2 tuần', u: false, group: 'Cũ hơn' },
{ id: 10, cat: 'eval', t: 'Kỳ đánh giá Q2/2026 sẽ mở từ 01/07', s: 'Evaluation Bot', a: '2 tuần', u: false, group: 'Cũ hơn' }];

const NotificationCenter = ({ onClose }) => {
  const [tab, setTab] = React.useState('all');
  const [read, setRead] = React.useState([]);
  const isUnread = (n) => n.u && !read.includes(n.id);
  const unreadCount = ALL_NOTIFS.filter(isUnread).length;
  const list = ALL_NOTIFS.filter((n) => tab === 'all' ? true : tab === 'unread' ? isUnread(n) : n.cat === tab);
  const groups = ['Hôm nay', 'Tuần này', 'Cũ hơn'].map((g) => [g, list.filter((n) => n.group === g)]).filter(([, v]) => v.length);
  const tabs = [['all', 'Tất cả'], ['unread', `Chưa đọc${unreadCount ? ' · ' + unreadCount : ''}`], ...Object.entries(NOTIF_META).map(([k, m]) => [k, m.label])];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card-surface w-full max-w-2xl rise overflow-hidden flex flex-col" style={{ maxHeight: '80vh' }}>
        <div className="px-5 py-4 border-b border-border/70 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary"><Icon.Bell size={18} /></span>
            <div>
              <h3 className="text-[17px] font-bold font-heading leading-tight">Thông báo</h3>
              <p className="text-[12px] text-muted-foreground">{unreadCount} chưa đọc · {ALL_NOTIFS.length} tổng cộng</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Btn variant="ghost" size="sm" onClick={() => setRead(ALL_NOTIFS.map((n) => n.id))}>Đánh dấu đã đọc</Btn>
            <button onClick={onClose} className="p-2 rounded-md hover:bg-muted text-muted-foreground"><Icon.X size={16} /></button>
          </div>
        </div>

        <div className="px-5 py-2.5 border-b border-border/70 flex items-center gap-1.5 flex-wrap">
          {tabs.map(([k, label]) =>
          <button
            key={k}
            onClick={() => setTab(k)}
            className={'text-[12px] px-2.5 py-1 rounded-full border transition-colors ' + (
            tab === k ? 'border-transparent bg-primary text-primary-foreground font-medium' : 'border-border/70 text-muted-foreground hover:bg-muted/50')}>
              {label}
            </button>
          )}
        </div>

        <div className="overflow-y-auto flex-1">
          {groups.length === 0 &&
          <p className="p-8 text-center text-[12.5px] text-muted-foreground italic">Không có thông báo nào.</p>
          }
          {groups.map(([g, items]) =>
          <div key={g}>
              <p className="px-5 py-1.5 text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground bg-muted/40 sticky top-0">{g}</p>
              <ul className="divide-y divide-border/70">
                {items.map((n) => {
                const m = NOTIF_META[n.cat];
                const Ic = Icon[m.icon] || Icon.Bell;
                return (
                  <li
                    key={n.id}
                    onClick={() => setRead((r) => r.includes(n.id) ? r : [...r, n.id])}
                    className="px-5 py-3 flex items-start gap-3 cursor-pointer hover:bg-muted/30 transition-colors">
                      <span className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0" style={{ background: m.bg, color: m.fg }}><Ic size={15} /></span>
                      <div className="min-w-0 flex-1">
                        <p className={'text-[13px] leading-snug ' + (isUnread(n) ? 'font-medium text-foreground' : 'text-muted-foreground')}>{n.t}</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">{m.label} · {n.s} · {n.a} trước</p>
                      </div>
                      {n.act && <Btn variant="outline" size="sm">{n.act}</Btn>}
                      {isUnread(n) && <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                    </li>);

              })}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>);

};

/* ---------- TAB 1: COMPANY ---------- */
const CompanyTab = () => {
  const [calOpen, setCalOpen] = React.useState(false);
  const [notifOpen, setNotifOpen] = React.useState(false);
  const reminders = [
  { id: 1, type: 'birthday', text: 'Sinh nhật Trần Thị Mai', sub: 'Đà Nẵng · 25 tuổi', date: 'Hôm nay', color: 'amber' },
  { id: 2, type: 'birthday', text: 'Sinh nhật Đỗ Minh Tuấn', sub: 'Hà Nội · 31 tuổi', date: 'Thứ Hai', color: 'amber' },
  { id: 3, type: 'anniversary', text: 'Vào công ty Hoàng Đức Thành', sub: '3 năm tại VNLab', date: '24/05', color: 'sky' },
  { id: 4, type: 'contract', text: 'Gia hạn hợp đồng Lê Quang Huy', sub: 'Còn 12 ngày', date: '03/06', color: 'emerald' },
  { id: 5, type: 'contract', text: 'Gia hạn hợp đồng Phạm Thu Hà', sub: 'Còn 28 ngày', date: '19/06', color: 'emerald' }];


  const notifs = [
  { t: 'Đơn nghỉ phép của Trần Thị Mai đang chờ duyệt', s: 'HR Admin', a: '5 phút', u: true },
  { t: 'Báo cáo đánh giá Q1/2026 đã sẵn sàng', s: 'Evaluation Bot', a: '2 giờ', u: true },
  { t: 'Bạn được thêm vào dự án "Cổng thanh toán XYZ"', s: 'Hoàng Đức Thành', a: '4 giờ', u: true },
  { t: 'Đơn tăng ca của Vũ Thị Lan đã được duyệt', s: 'PM Hà Nội', a: 'Hôm qua', u: false },
  { t: 'Lương tháng 4 đã được phát', s: 'Finance', a: '3 ngày', u: false }];


  const jobTitles = [
  { label: 'Lập trình viên', value: 98 },
  { label: 'Tester / QA', value: 32 },
  { label: 'BrSE', value: 28 },
  { label: 'Designer', value: 18 },
  { label: 'PM / Trưởng nhóm', value: 14 },
  { label: 'DevOps', value: 8 },
  { label: 'Khác', value: 6 }];

  const maxJob = Math.max(...jobTitles.map((j) => j.value));

  const jpLevels = [
  { lv: 'N1', count: 12 },
  { lv: 'N2', count: 38 },
  { lv: 'N3', count: 65 },
  { lv: 'N4', count: 42 },
  { lv: 'N5', count: 30 },
  { lv: 'Chưa thi', count: 61 }];

  const maxJp = Math.max(...jpLevels.map((j) => j.count));

  const tech = [
  { n: 'Vue.js', c: 64 }, { n: 'React', c: 58 }, { n: 'Node.js', c: 52 }, { n: 'Python', c: 41 },
  { n: 'TypeScript', c: 38 }, { n: 'Docker', c: 29 }, { n: 'AWS', c: 27 }, { n: 'Java', c: 22 },
  { n: 'Go', c: 14 }, { n: 'Rust', c: 8 }, { n: 'PHP / Laravel', c: 16 }, { n: 'Kubernetes', c: 11 },
  { n: 'PostgreSQL', c: 24 }, { n: 'Figma', c: 18 }].
  sort((a, b) => b.c - a.c);

  const ranks = ['S', 'A', 'B', 'C', 'D', 'E'];
  const quarters = ['Q3/25', 'Q4/25', 'Q1/26', 'Q2/26'];
  const evalData = [
  [3, 4, 6, 8],
  [22, 26, 31, 35],
  [54, 58, 60, 62],
  [38, 32, 28, 24],
  [12, 8, 6, 4],
  [4, 2, 1, 0]];

  const rankColors = ['#0ea5e9', '#22c55e', '#a3a3a3', '#eab308', '#f97316', '#ef4444'];

  const reminderColor = (c) => ({
    amber: 'bg-amber-400',
    sky: 'bg-sky-400',
    emerald: 'bg-emerald-500'
  })[c] || 'bg-muted-foreground';

  const reminderIcon = (t) => t === 'birthday' ? Icon.Cake : t === 'anniversary' ? Icon.Gift : Icon.Briefcase;

  return (
    <div className="space-y-6">
      {calOpen && <ReminderCalendar onClose={() => setCalOpen(false)} />}
      {notifOpen && <NotificationCenter onClose={() => setNotifOpen(false)} />}
      {/* Row 1: reminders + notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SectionCard
          delay={50}
          title="Nhắc nhở sắp tới"
          action={<button onClick={() => setCalOpen(true)} className="text-[12px] text-primary hover:underline">Xem lịch →</button>}>
          
          <ul className="space-y-3">
            {reminders.map((r) => {
              const Ic = reminderIcon(r.type);
              return (
                <li key={r.id} className="flex items-center gap-3 group">
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{
                      background: r.color === 'amber' ? 'hsl(38 92% 95%)' : r.color === 'sky' ? 'hsl(203 89% 95%)' : 'hsl(160 60% 94%)',
                      color: r.color === 'amber' ? 'hsl(35 90% 45%)' : r.color === 'sky' ? 'hsl(203 89% 45%)' : 'hsl(160 60% 38%)'
                    }}>
                    
                    <Ic size={15} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] text-foreground font-medium truncate">{r.text}</p>
                    <p className="text-[11.5px] text-muted-foreground">{r.sub}</p>
                  </div>
                  <span className="text-[11.5px] font-mono font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">{r.date}</span>
                </li>);

            })}
          </ul>
        </SectionCard>

        <SectionCard
          delay={100}
          title="Thông báo gần đây"
          action={
          <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary live-dot" /> 3 mới
              </span>
              <button onClick={() => setNotifOpen(true)} className="text-[12px] text-primary hover:underline">Tất cả →</button>
            </div>
          }>
          
          <ul className="divide-y divide-border/70 -my-2">
            {notifs.map((n, i) =>
            <li key={i} className="py-2.5 flex items-start gap-3 group cursor-pointer hover:bg-muted/30 -mx-2 px-2 rounded-md transition-colors">
                <span className={'mt-1.5 h-1.5 w-1.5 rounded-full shrink-0 ' + (n.u ? 'bg-primary' : 'bg-muted-foreground/30')} />
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] text-foreground leading-snug">{n.t}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{n.s} · {n.a} trước</p>
                </div>
                {n.u && <span className="text-[10px] font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded">MỚI</span>}
              </li>
            )}
          </ul>
        </SectionCard>
      </div>

      {/* Row 2: job title bars + Japanese level */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <SectionCard
          delay={150}
          className="lg:col-span-3"
          title="Nhân viên theo chức vụ"
          action={
<Select value="" placeholder={null} width={130}
              options={[{value:'',label:'Toàn công ty'},{value:'hn',label:'Hà Nội'},{value:'dn',label:'Đà Nẵng'}]}
              onChange={()=>{}} />
          }>
          
          <div className="space-y-3">
            {jobTitles.map((j, i) =>
            <BarRow key={i} label={j.label} value={j.value} max={maxJob} accent={i === 0} />
            )}
          </div>
        </SectionCard>

        <SectionCard
          delay={200}
          className="lg:col-span-2"
          title="Trình độ tiếng Nhật"
          action={<span className="text-[11px] font-mono text-muted-foreground">N=248</span>}>
          
          <div className="grid grid-cols-3 gap-2.5">
            {jpLevels.map((j, i) => {
              const isTop = i < 2;
              return (
                <div
                  key={j.lv}
                  className={'rounded-xl border p-3 flex flex-col items-center justify-center gap-0.5 transition-colors ' + (
                  isTop ?
                  'border-primary/40 bg-primary/5' :
                  'border-border bg-muted/30')}>
                  
                  <span className={'text-[20px] font-bold font-heading tabular-nums ' + (isTop ? 'text-primary' : 'text-foreground')}>{j.count}</span>
                  <span className="text-[10.5px] uppercase font-semibold tracking-wider text-muted-foreground">{j.lv}</span>
                  <div className="w-full h-0.5 rounded-full bg-muted/70 mt-1.5 overflow-hidden">
                    <div className="h-full" style={{ width: `${j.count / maxJp * 100}%`, background: isTop ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground)/0.5)' }} />
                  </div>
                </div>);

            })}
          </div>
        </SectionCard>
      </div>

      {/* Row 3: tech chips + evaluation rank */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <SectionCard
          delay={250}
          className="lg:col-span-2"
          title="Công nghệ quan tâm"
          action={<span className="text-[11px] text-muted-foreground">Top 14</span>}>
          
          <div className="flex flex-wrap gap-1.5">
            {tech.map((t, i) =>
            <button
              key={t.n}
              className={'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[12px] font-medium border transition-colors hover:border-primary/50 ' + (
              i === 0 ?
              'border-primary/40 bg-primary/10 text-primary' :
              'border-border bg-muted/40 text-foreground/85')}>
              
                {t.n}
                <span className={'text-[10.5px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full ' + (i === 0 ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground')}>
                  {t.c}
                </span>
              </button>
            )}
          </div>
        </SectionCard>

        <SectionCard
          delay={300}
          className="lg:col-span-3"
          title="Phân bố rank đánh giá — 4 quý gần nhất"
          action={<button className="text-[12px] text-primary hover:underline">Xem chi tiết →</button>}>
          
          <table className="w-full text-[13px]">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left font-semibold pb-2 pr-3">Rank</th>
                {quarters.map((q) => <th key={q} className="text-center font-semibold pb-2 px-1 text-[12px] font-mono">{q}</th>)}
                <th className="pl-3 pb-2 text-left text-[11px] font-semibold">Xu hướng</th>
              </tr>
            </thead>
            <tbody>
              {ranks.map((r, i) =>
              <tr key={r} className="border-t border-border/60">
                  <td className="py-2 pr-3">
                    <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold text-white tabular-nums"
                    style={{ background: rankColors[i] }}>
                    {r}</span>
                  </td>
                  {evalData[i].map((v, j) =>
                <td key={j} className="text-center font-medium tabular-nums py-2 px-1">{v}</td>
                )}
                  <td className="pl-3 py-2" style={{ color: rankColors[i] }}>
                    <Sparkline data={evalData[i]} width={56} height={20} stroke="currentColor" filled={false} />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </SectionCard>
      </div>
    </div>);

};

/* ---------- TAB 2: PERSONAL ---------- */
const PersonalTab = () => {
  const rankGrowth = [
  { label: 'Q1/24', value: 5 },
  { label: 'Q2/24', value: 4 },
  { label: 'Q3/24', value: 4 },
  { label: 'Q4/24', value: 3 },
  { label: 'Q1/25', value: 3 },
  { label: 'Q2/25', value: 2 },
  { label: 'Q3/25', value: 2 },
  { label: 'Q4/25', value: 2 },
  { label: 'Q1/26', value: 1 }];


  const projects = [
  { name: 'Cổng thanh toán XYZ', role: 'Tech Lead', joined: '15/01/2025', members: 12, progress: 68, color: 'sky' },
  { name: 'Hệ thống CRM nội bộ', role: 'Frontend', joined: '08/09/2024', members: 7, progress: 92, color: 'emerald' },
  { name: 'App giao đồ ăn FoodGo', role: 'Reviewer', joined: '22/11/2024', members: 18, progress: 35, color: 'amber' },
  { name: 'Quản lý kho ABC v2', role: 'Backend', joined: '04/03/2025', members: 9, progress: 54, color: 'violet' }];


  const leaveUsed = 6;
  const leaveTotal = 14;

  const Field = ({ icon, label, value, hint }) => {
    const Ic = Icon[icon];
    return (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-primary/8 text-primary flex items-center justify-center shrink-0">
          <Ic size={14} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{label}</p>
          <p className="text-[13.5px] text-foreground font-medium truncate">{value}</p>
        </div>
        {hint && <span className="text-[11px] text-muted-foreground font-mono">{hint}</span>}
      </div>);

  };

  return (
    <div className="space-y-6">
      {/* Row 1: contact + leave */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <SectionCard
          delay={50}
          className="lg:col-span-3"
          title="Thông tin cá nhân"
          action={<button className="text-[12px] text-primary hover:underline inline-flex items-center gap-1">Chỉnh sửa <Icon.ArrowRight size={11} /></button>}>
          
          <div className="flex items-start gap-5">
            <span
              className="w-16 h-16 rounded-xl inline-flex items-center justify-center text-[20px] font-bold text-white font-heading shrink-0"
              style={{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 38%))' }}>
              NA</span>
            <div className="min-w-0 flex-1">
              <h4 className="text-[18px] font-bold text-foreground font-heading">Nguyễn Văn An</h4>
              <p className="text-[12.5px] text-muted-foreground mt-0.5">Senior Frontend Engineer · Hà Nội</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px]">
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">Rank A → S</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-medium">3 năm 4 tháng</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium">JLPT N2</span>
              </div>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-3.5 pt-5 border-t border-border/70">
            <Field icon="Mail" label="Email" value="an.nguyen@vnlab.vn" />
            <Field icon="Phone" label="Điện thoại" value="0912 345 678" />
            <Field icon="Calendar" label="Ngày sinh" value="04/08/1994" hint="31 tuổi" />
            <Field icon="Building" label="Chi nhánh" value="Hà Nội – Trụ sở chính" />
          </div>
        </SectionCard>

        <SectionCard
          delay={100}
          className="lg:col-span-2"
          title="Phép năm 2026"
          action={<button className="text-[12px] text-primary hover:underline">Tạo đơn →</button>}>
          
          <div className="flex items-center gap-5">
            <Donut used={leaveUsed} total={leaveTotal} label={`${leaveTotal - leaveUsed}`} sublabel={`/ ${leaveTotal} ngày còn`} />
            <div className="flex-1 space-y-2.5 text-[13px]">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full" style={{ background: 'hsl(var(--primary))' }} />
                  Đã dùng
                </span>
                <span className="font-semibold tabular-nums">{leaveUsed} ngày</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 text-muted-foreground">
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/30" />
                  Còn lại
                </span>
                <span className="font-semibold tabular-nums text-emerald-600">{leaveTotal - leaveUsed} ngày</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/70">
                <span className="text-muted-foreground">Phép thêm</span>
                <span className="font-semibold tabular-nums">+2 ngày</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Còn lại kỳ trước</span>
                <span className="font-semibold tabular-nums">3 ngày</span>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Row 2: rank growth line */}
      <SectionCard
        delay={150}
        title="Hạng tăng trưởng của bạn"
        action={
        <div className="flex items-center gap-3 text-[12px]">
            <span className="text-muted-foreground">Kỳ hiện tại:</span>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">Rank S <Icon.TrendUp size={11} /></span>
          </div>
        }>
        
        <div className="h-[240px]">
          <LineChart data={rankGrowth} />
        </div>
        <p className="text-[11.5px] text-muted-foreground mt-2 italic">Rank được đo từ 1 (S) đến 6 (E). Xu hướng càng lên thì hạng càng cao.</p>
      </SectionCard>

      {/* Row 3: projects */}
      <SectionCard
        delay={200}
        title="Dự án bạn tham gia"
        action={<span className="text-[11.5px] text-muted-foreground">{projects.length} dự án đang hoạt động</span>}>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {projects.map((p, i) =>
          <button
            key={i}
            className="card-surface interactive p-4 text-left flex flex-col gap-3"
            style={{ borderRadius: 12 }}>
            
              <div className="flex items-start gap-2.5">
                <div
                className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-[13px] font-heading"
                style={{
                  background:
                  p.color === 'sky' ? 'linear-gradient(135deg,#67d4ff,#0e7eb5)' :
                  p.color === 'emerald' ? 'linear-gradient(135deg,#6ee7b7,#047857)' :
                  p.color === 'amber' ? 'linear-gradient(135deg,#fcd34d,#b45309)' :
                  'linear-gradient(135deg,#c4b5fd,#5b21b6)'
                }}>
                {p.name.slice(0, 1)}</div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-foreground truncate">{p.name}</p>
                  <p className="text-[11px] text-muted-foreground">{p.role}</p>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="text-muted-foreground">Tiến độ</span>
                  <span className="font-semibold tabular-nums text-foreground">{p.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${p.progress}%`, background: 'linear-gradient(90deg, hsl(var(--primary-h) var(--primary-s) 65%), hsl(var(--primary-h) var(--primary-s) 45%))' }} />
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/70 pt-2.5">
                <span className="inline-flex items-center gap-1"><Icon.Users size={11} />{p.members} thành viên</span>
                <span className="font-mono">{p.joined}</span>
              </div>
            </button>
          )}
        </div>
      </SectionCard>
    </div>);

};

/* ---------- TAB 3: PROJECT ---------- */
const ProjectTab = () => {
  const projects = [
  { id: 1, name: 'Cổng thanh toán XYZ', manager: 'Hoàng Đức Thành', members: 12, status: 'active', branch: 'Hà Nội', targets: 2 },
  { id: 2, name: 'Hệ thống CRM nội bộ', manager: 'Phạm Thu Hà', members: 7, status: 'active', branch: 'Đà Nẵng', targets: 1 },
  { id: 3, name: 'App giao đồ ăn FoodGo', manager: 'Lê Quang Huy', members: 18, status: 'active', branch: 'HCM', targets: 1 },
  { id: 4, name: 'Quản lý kho ABC v2', manager: 'Trần Thị Mai', members: 9, status: 'active', branch: 'Hà Nội', targets: 0 },
  { id: 5, name: 'Module báo cáo BI', manager: 'Vũ Thị Lan', members: 4, status: 'pending', branch: 'Đà Nẵng', targets: 1 },
  { id: 6, name: 'Hệ thống tuyển dụng', manager: 'Đỗ Minh Tuấn', members: 6, status: 'pending', branch: 'Hà Nội', targets: 0 },
  { id: 7, name: 'Mobile companion app', manager: 'Bùi Đức Thành', members: 11, status: 'active', branch: 'Osaka', targets: 0 },
  { id: 8, name: 'Security audit & hardening', manager: 'Lê Quang Huy', members: 5, status: 'ended', branch: 'HCM', targets: 1 }];

  const PROJ_STATUS = {
    active:  { label: 'Đang hoạt động', dot: '#22c55e', cls: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' },
    pending: { label: 'Chờ khởi động', dot: '#f59e0b', cls: 'text-amber-600 bg-amber-50 dark:bg-amber-950/30' },
    ended:   { label: 'Đã kết thúc',   dot: '#a3a3a3', cls: 'text-muted-foreground bg-muted' },
  };

  const totalMembers = projects.reduce((a, p) => a + p.members, 0);
  const activeCount = projects.filter((p) => p.status === 'active').length;
  const pendingCount = projects.filter((p) => p.status === 'pending').length;
  const endedCount = projects.filter((p) => p.status === 'ended').length;
  const totalTargets = projects.reduce((a, p) => a + p.targets, 0);

  const branchDist = [
  { label: 'Hà Nội', color: 'hsl(var(--primary))', value: projects.filter((p) => p.branch === 'Hà Nội').reduce((a, p) => a + p.members, 0) },
  { label: 'Đà Nẵng', color: 'hsl(var(--primary-h) 70% 70%)', value: projects.filter((p) => p.branch === 'Đà Nẵng').reduce((a, p) => a + p.members, 0) },
  { label: 'HCM', color: 'hsl(38 92% 60%)', value: projects.filter((p) => p.branch === 'HCM').reduce((a, p) => a + p.members, 0) },
  { label: 'Osaka', color: 'hsl(160 60% 50%)', value: projects.filter((p) => p.branch === 'Osaka').reduce((a, p) => a + p.members, 0) }];


  const [openProject, setOpenProject] = React.useState(null);

  return (
    <div className="space-y-6">
      {/* Mini summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
        { l: 'Tổng dự án', v: projects.length, sub: `${activeCount} đang hoạt động` },
        { l: 'Chờ / Kết thúc', v: `${pendingCount} / ${endedCount}`, sub: 'Chờ khởi động · đã xong' },
        { l: 'Tổng thành viên', v: totalMembers, sub: 'Trên tất cả dự án' },
        { l: 'Mục tiêu quý', v: totalTargets, sub: 'Đang theo dõi' }].
        map((s, i) =>
        <div key={i} className="card-surface p-4 rise" style={{ animationDelay: `${i * 40}ms` }}>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{s.l}</p>
            <p className="text-[24px] font-bold font-heading text-foreground mt-0.5 tabular-nums">{s.v}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.sub}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Project list */}
        <SectionCard
          delay={200}
          className="lg:col-span-3"
          title="Danh sách dự án"
          action={
          <div className="flex items-center gap-2">
              <button className="text-[12px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-md hover:bg-muted">Lọc</button>
              <button onClick={() => window.__erp_navigate && window.__erp_navigate('/workflow/project')}
                className="inline-flex items-center gap-1 text-[12px] font-semibold text-white px-2.5 py-1.5 rounded-md"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 42%))' }}>
                <Icon.Plus size={12} /> Dự án mới
              </button>
            </div>
          }>
          
          <div className="-m-5">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="thead-primary border-b border-border/70">
                  <th className="text-left font-semibold py-2.5 px-5">Dự án</th>
                  <th className="text-left font-semibold py-2.5 px-2">Quản lý</th>
                  <th className="text-right font-semibold py-2.5 px-2">Thành viên</th>
                  <th className="text-left font-semibold py-2.5 px-3">Trạng thái</th>
                  <th className="text-center font-semibold py-2.5 px-3">Mục tiêu quý</th>
                  <th className="py-2.5 px-3" />
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => {
                  const sm = PROJ_STATUS[p.status];
                  return (
                <tr
                  key={p.id}
                  onClick={() => setOpenProject(p)}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors">
                  
                    <td className="py-3 px-5">
                      <div className="flex items-center gap-2.5">
                        <span className="h-2 w-2 rounded-full shrink-0" style={{ background: sm.dot }} />
                        <div>
                          <p className="font-medium text-foreground">{p.name}</p>
                          <p className="text-[11px] text-muted-foreground">{p.branch}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-foreground/80">{p.manager}</td>
                    <td className="py-3 px-2 text-right font-bold text-primary tabular-nums">{p.members}</td>
                    <td className="py-3 px-3">
                      <span className={'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ' + sm.cls}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: sm.dot }} />{sm.label}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {p.targets > 0
                        ? <span className="inline-flex items-center gap-1 text-[12px] font-medium text-primary"><Icon.Target size={11} />{p.targets}</span>
                        : <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="py-3 px-3 text-right text-muted-foreground">
                      <Icon.ChevronRight size={14} />
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* Right side — branch distribution + status */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard delay={250} title="Phân bố thành viên theo chi nhánh">
            <div className="space-y-3">
              <StackedBar segments={branchDist} height={10} />
              <ul className="grid grid-cols-2 gap-2 text-[12px]">
                {branchDist.map((b) =>
                <li key={b.label} className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: b.color }} />
                    <span className="text-foreground/80 flex-1">{b.label}</span>
                    <span className="font-semibold tabular-nums">{b.value}</span>
                  </li>
                )}
              </ul>
            </div>
          </SectionCard>

          <SectionCard delay={300} title="Top quản lý dự án">
            <ul className="space-y-3">
              {[
              { n: 'Hoàng Đức Thành', c: 2, p: 'PM Senior' },
              { n: 'Phạm Thu Hà', c: 1, p: 'Tech Lead' },
              { n: 'Lê Quang Huy', c: 1, p: 'Engineering Manager' },
              { n: 'Trần Thị Mai', c: 1, p: 'PM' },
              { n: 'Đỗ Minh Tuấn', c: 1, p: 'PM' }].
              map((u, i) =>
              <li key={i} className="flex items-center gap-3">
                  <span
                  className="h-9 w-9 rounded-lg flex items-center justify-center text-[11px] font-semibold text-white"
                  style={{ background: `linear-gradient(135deg, hsl(${(i * 60 + 200) % 360} 70% 65%), hsl(${(i * 60 + 200) % 360} 70% 45%))` }}>
                  {u.n.split(' ').map((s) => s[0]).slice(-2).join('')}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-medium text-foreground truncate">{u.n}</p>
                    <p className="text-[11px] text-muted-foreground">{u.p}</p>
                  </div>
                  <span className="text-[11.5px] font-mono font-medium text-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                    {u.c} dự án
                  </span>
                </li>
              )}
            </ul>
          </SectionCard>
        </div>
      </div>

      {/* Modal */}
      {openProject &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setOpenProject(null)} />
          <div className="relative card-surface w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col rise">
            <div className="px-5 py-4 border-b border-border/70 flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-bold font-heading text-foreground">{openProject.name}</h3>
                <p className="text-[12px] text-muted-foreground mt-0.5">Quản lý: {openProject.manager} · {openProject.members} thành viên</p>
              </div>
              <button onClick={() => setOpenProject(null)} className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <Icon.X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto scrollbar-thin p-5">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="text-muted-foreground border-b border-border/70">
                    <th className="text-left font-semibold pb-2">Thành viên</th>
                    <th className="text-left font-semibold pb-2">Chi nhánh</th>
                    <th className="text-right font-semibold pb-2">Ngày tham gia</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                ['Nguyễn Văn An', 'Hà Nội', '15/01/2025'],
                ['Trần Thị Mai', 'Đà Nẵng', '15/01/2025'],
                ['Lê Quang Huy', 'Hồ Chí Minh', '04/03/2025'],
                ['Phạm Thu Hà', 'Đà Nẵng', '12/02/2025'],
                ['Hoàng Đức Thành', 'Hà Nội', '15/01/2025'],
                ['Đỗ Minh Tuấn', 'Hà Nội', '20/04/2025'],
                ['Vũ Thị Lan', 'Hà Nội', '02/05/2025']].
                slice(0, openProject.members).map((row, i) =>
                <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/40 cursor-pointer">
                      <td className="py-2.5 text-foreground">{row[0]}</td>
                      <td className="py-2.5 text-foreground/80">{row[1]}</td>
                      <td className="py-2.5 text-right font-mono text-muted-foreground">{row[2]}</td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-border/70 flex items-center justify-end gap-2">
              <button onClick={() => setOpenProject(null)} className="px-3 py-1.5 text-[13px] rounded-md hover:bg-muted text-foreground/80">Đóng</button>
              <button className="px-3 py-1.5 text-[13px] rounded-md text-white font-semibold inline-flex items-center gap-1"
            style={{ background: 'linear-gradient(135deg, hsl(var(--primary-h) var(--primary-s) 60%), hsl(var(--primary-h) var(--primary-s) 42%))' }}>
                Chi tiết dự án <Icon.External size={12} />
              </button>
            </div>
          </div>
        </div>
      }
    </div>);

};

Object.assign(window, { SectionCard, CompanyTab, PersonalTab, ProjectTab });