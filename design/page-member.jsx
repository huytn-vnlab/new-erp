/* HRM > Quản lý nhân viên — member list with filters, stats, table */

const MEMBERS = [
{ id: 1, name: 'Nguyễn Văn An', branch: 'Hà Nội', role: 'Senior Frontend', email: 'an.nguyen@vnlab.vn', phone: '0912 345 678', status: 'active', jp: 'N2', join: '15/01/2022', rank: 'S' },
{ id: 2, name: 'Trần Thị Mai', branch: 'Đà Nẵng', role: 'QA Engineer', email: 'mai.tran@vnlab.vn', phone: '0934 567 123', status: 'active', jp: 'N3', join: '08/06/2023', rank: 'A' },
{ id: 3, name: 'Lê Quang Huy', branch: 'Hồ Chí Minh', role: 'BrSE', email: 'huy.le@vnlab.vn', phone: '0987 654 321', status: 'active', jp: 'N1', join: '02/03/2021', rank: 'S' },
{ id: 4, name: 'Phạm Thu Hà', branch: 'Đà Nẵng', role: 'Tech Lead', email: 'ha.pham@vnlab.vn', phone: '0901 234 567', status: 'active', jp: 'N2', join: '17/09/2020', rank: 'S' },
{ id: 5, name: 'Đỗ Minh Tuấn', branch: 'Hà Nội', role: 'Backend Engineer', email: 'tuan.do@vnlab.vn', phone: '0945 678 901', status: 'active', jp: 'N3', join: '11/11/2022', rank: 'B' },
{ id: 6, name: 'Hoàng Đức Thành', branch: 'Hà Nội', role: 'PM Senior', email: 'thanh.hoang@vnlab.vn', phone: '0967 890 123', status: 'active', jp: 'N1', join: '04/05/2019', rank: 'S' },
{ id: 7, name: 'Vũ Thị Lan', branch: 'Hà Nội', role: 'Designer', email: 'lan.vu@vnlab.vn', phone: '0978 012 345', status: 'active', jp: 'N4', join: '23/07/2023', rank: 'A' },
{ id: 8, name: 'Bùi Đức Thành', branch: 'Osaka', role: 'DevOps', email: 'thanh.bui@vnlab.vn', phone: '+81 90 1234 5678', status: 'active', jp: 'N1', join: '12/10/2022', rank: 'A' },
{ id: 9, name: 'Ngô Thanh Tùng', branch: 'Hà Nội', role: 'Junior Developer', email: 'tung.ngo@vnlab.vn', phone: '0989 123 456', status: 'onboarding', jp: '—', join: '03/05/2026', rank: 'C' },
{ id: 10, name: 'Đặng Thị Hồng', branch: 'Đà Nẵng', role: 'Tester', email: 'hong.dang@vnlab.vn', phone: '0923 456 789', status: 'active', jp: 'N3', join: '20/04/2024', rank: 'B' },
{ id: 11, name: 'Nguyễn Hữu Phước', branch: 'Hồ Chí Minh', role: 'Backend Engineer', email: 'phuoc.nh@vnlab.vn', phone: '0956 789 012', status: 'leave', jp: 'N2', join: '15/02/2023', rank: 'A' },
{ id: 12, name: 'Lý Quỳnh Anh', branch: 'Hà Nội', role: 'BrSE', email: 'anh.ly@vnlab.vn', phone: '0901 567 890', status: 'active', jp: 'N1', join: '08/08/2021', rank: 'A' },
{ id: 13, name: 'Phan Văn Cường', branch: 'Đà Nẵng', role: 'DevOps', email: 'cuong.phan@vnlab.vn', phone: '0934 678 234', status: 'active', jp: 'N3', join: '19/11/2023', rank: 'B' },
{ id: 14, name: 'Tô Thị Kim Anh', branch: 'Hà Nội', role: 'Frontend Engineer', email: 'kimanh.to@vnlab.vn', phone: '0912 890 456', status: 'active', jp: 'N2', join: '07/03/2024', rank: 'B' },
{ id: 15, name: 'Hà Minh Quân', branch: 'Hồ Chí Minh', role: 'PM', email: 'quan.ha@vnlab.vn', phone: '0978 234 567', status: 'inactive', jp: '—', join: '12/06/2020', rank: '—' }];


const MEMBER_STATUS_META = {
  active: { label: 'Đang làm việc', variant: 'green' },
  onboarding: { label: 'Đang onboard', variant: 'amber' },
  leave: { label: 'Nghỉ phép', variant: 'sky' },
  inactive: { label: 'Đã nghỉ việc', variant: 'gray' }
};

const ROLES_OPTS = ['Frontend Engineer', 'Backend Engineer', 'Senior Frontend', 'Senior Backend', 'Tech Lead', 'QA Engineer', 'Tester', 'BrSE', 'DevOps', 'PM', 'PM Senior', 'Designer', 'Scrum Master', 'Business Analyst'];
const BRANCHES_OPTS = ['Hà Nội', 'Đà Nẵng', 'Hồ Chí Minh', 'Osaka'];

const InviteModal = ({ open, onClose, onSend }) => {
  const [emails, setEmails] = React.useState([]);
  const [input, setInput] = React.useState('');
  const [error, setError] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const inputRef = React.useRef(null);

  const isValidEmail = v => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v.trim());

  const addEmail = (val) => {
    const v = val.trim();
    if (!v) return;
    if (!isValidEmail(v)) { setError('Email không hợp lệ: ' + v); return; }
    if (emails.includes(v)) { setError('Email đã được thêm'); return; }
    setEmails(prev => [...prev, v]);
    setInput('');
    setError('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail(input);
    } else if (e.key === 'Backspace' && !input && emails.length) {
      setEmails(prev => prev.slice(0, -1));
    }
  };

  const removeEmail = (em) => setEmails(prev => prev.filter(x => x !== em));

  const send = () => {
    // commit any pending input first
    const pending = input.trim();
    const allEmails = pending && isValidEmail(pending) ? [...emails, pending] : emails;
    if (allEmails.length === 0) { setError('Nhập ít nhất một địa chỉ email'); return; }
    if (pending && !isValidEmail(pending)) { setError('Email không hợp lệ: ' + pending); return; }
    setSending(true);
    setTimeout(() => {
      allEmails.forEach(em => onSend({ email: em, sent: new Date().toLocaleDateString('vi-VN'), by: 'Hoàng Đức Thành', status: 'pending' }));
      setSending(false);
      setEmails([]); setInput(''); setError('');
      onClose();
    }, 800);
  };

  const handleClose = () => { setEmails([]); setInput(''); setError(''); onClose(); };

  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={handleClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(4px)' }} />
      <div className="relative card-surface mx-4 rise" style={{ maxWidth: 480, width: '100%', zIndex: 1, borderRadius: 18, overflow: 'hidden', animationDuration: '0.2s' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,hsl(var(--primary-h) var(--primary-s) 65%),hsl(var(--primary-h) var(--primary-s) 45%))' }}>
              <Icon.UserPlus size={14} className="text-white" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-[15px] text-foreground">Mời thành viên</h3>
              <p className="text-[11.5px] text-muted-foreground mt-0.5">Nhấn Enter để thêm nhiều email</p>
            </div>
          </div>
          <button onClick={handleClose} className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
            <Icon.X size={14} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div
            className={'min-h-[80px] flex flex-wrap gap-1.5 p-3 rounded-xl border cursor-text transition-colors ' +
              (error ? 'border-red-400 bg-red-50 dark:bg-red-950/20' : 'border-border bg-card focus-within:border-primary/60')}
            onClick={() => inputRef.current?.focus()}>
            {emails.map(em => (
              <span key={em} className="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-lg text-[12.5px] font-medium"
                style={{ background: 'hsl(var(--primary-h) var(--primary-s) 57% / 0.1)', color: 'hsl(var(--primary))' }}>
                <Icon.Mail size={11} />
                {em}
                <button onClick={e => { e.stopPropagation(); removeEmail(em); }}
                  className="h-4 w-4 rounded flex items-center justify-center hover:bg-primary/20 transition-colors ml-0.5">
                  <Icon.X size={9} />
                </button>
              </span>
            ))}
            <input
              ref={inputRef}
              type="email"
              value={input}
              onChange={e => { setInput(e.target.value); setError(''); }}
              onKeyDown={handleKeyDown}
              onBlur={() => input.trim() && addEmail(input)}
              placeholder={emails.length === 0 ? 'ten@congty.com, nhấn Enter để thêm tiếp…' : ''}
              className="flex-1 min-w-[180px] bg-transparent text-[13px] text-foreground outline-none placeholder:text-muted-foreground/50 py-0.5"
            />
          </div>
          {error
            ? <p className="text-[11.5px] text-red-400 mt-1.5">{error}</p>
            : <p className="text-[11.5px] text-muted-foreground mt-2">
                {emails.length > 0
                  ? <><span className="font-semibold text-foreground">{emails.length}</span> email · Link có hiệu lực <strong>7 ngày</strong></>
                  : 'Nhập email rồi nhấn Enter. Có thể mời nhiều người cùng lúc.'}
              </p>
          }
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/70 bg-muted/20">
          <Btn variant="outline" size="sm" onClick={handleClose}>Huỷ</Btn>
          <Btn variant="primary" size="sm" onClick={send} icon={sending ? null : 'Send'}>
            {sending
              ? <span className="flex items-center gap-2"><span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>Đang gửi…</span>
              : emails.length > 1 ? `Gửi ${emails.length} lời mời` : 'Gửi lời mời'}
          </Btn>
        </div>
      </div>
    </div>);

};

const PageMember = () => {
  const [search, setSearch] = React.useState('');
  const [branch, setBranch] = React.useState('');
  const [role, setRole] = React.useState('');
  const [status, setStatus] = React.useState('');
  const [tab, setTab] = React.useState('list');
  const [page, setPage] = React.useState(1);
  const [openMember, setOpenMember] = React.useState(null);
  const [inviteOpen, setInviteOpen] = React.useState(false);
  const [invitations, setInvitations] = React.useState([
  { email: 'phong.le@example.com', role: 'Frontend Engineer', branch: 'Hà Nội', sent: '20/05/2026', by: 'Hoàng Đức Thành', status: 'pending' },
  { email: 'mai.t@example.com', role: 'QA', branch: 'Đà Nẵng', sent: '18/05/2026', by: 'Phạm Thu Hà', status: 'pending' },
  { email: 'duc.tran@example.com', role: 'BrSE', branch: 'Hà Nội', sent: '15/05/2026', by: 'Hoàng Đức Thành', status: 'expired' },
  { email: 'tuan.bui@example.com', role: 'PM', branch: 'HCM', sent: '12/05/2026', by: 'Lê Quang Huy', status: 'pending' }]
  );
  const [invToast, setInvToast] = React.useState('');
  const handleInviteSent = (inv) => {
    setInvitations((p) => [{ ...inv, id: Date.now() }, ...p]);
    setInvToast('Lời mời đã được gửi tới ' + inv.email + '!');
    setTimeout(() => setInvToast(''), 3000);
  };

  const filtered = MEMBERS.filter((m) => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase()) && !m.email.toLowerCase().includes(search.toLowerCase())) return false;
    if (branch && m.branch !== branch) return false;
    if (role && m.role !== role) return false;
    if (status && m.status !== status) return false;
    return true;
  });

  const perPage = 10;
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const pendingCount = invitations.filter((i) => i.status === 'pending').length;

  const stats = [
  { label: 'Tổng nhân viên', value: MEMBERS.length, sublabel: '4 chi nhánh', trend: { dir: 'up', value: '+2 tháng này' }, accent: 'primary' },
  { label: 'Đang làm việc', value: MEMBERS.filter((m) => m.status === 'active').length, sublabel: '88% tổng số', accent: 'green' },
  { label: 'Đang onboard', value: MEMBERS.filter((m) => m.status === 'onboarding').length, sublabel: '2 sẽ chính thức tháng 6', accent: 'amber' },
  { label: 'Lời mời chờ duyệt', value: pendingCount, sublabel: 'Cần phản hồi', accent: 'violet' }];


  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="HRM · Nhân sự"
        title="Quản lý nhân viên"
        description="Toàn bộ thành viên VNLab. Tìm kiếm, lọc theo chi nhánh / chức vụ / trạng thái và quản lý lời mời tham gia."
        actions={
        <>
            <Btn variant="outline" icon="FileText">Xuất Excel</Btn>
            <Btn variant="primary" icon="UserPlus" onClick={() => setInviteOpen(true)}>Mời thành viên</Btn>
          </>
        } />
      

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => <MiniStat key={i} {...s} delay={40 + i * 40} />)}
      </div>

      {/* Tab strip */}
      <div className="border-b border-border/70">
        <div className="flex gap-7">
          {[{ k: 'list', l: 'Danh sách thành viên', n: filtered.length }, { k: 'invites', l: 'Yêu cầu mời thành viên', n: invitations.length }].map((t) =>
          <button key={t.k} onClick={() => setTab(t.k)} data-active={tab === t.k} className="tab-trigger inline-flex items-center gap-2">
              {t.l}
              <span className={'inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10.5px] font-semibold tabular-nums ' + (
            tab === t.k ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground')}>{t.n}</span>
            </button>
          )}
        </div>
      </div>

      {tab === 'list' ?
      <>
          <FilterBar>
            <FieldInput icon="Search" placeholder="Tìm tên, email…" value={search} onChange={(e) => {setSearch(e.target.value);setPage(1);}} />
            <Select
            value={branch}
            onChange={(e) => {setBranch(e.target.value);setPage(1);}}
            placeholder="Tất cả chi nhánh"
            options={[
            { value: 'Hà Nội', label: 'Hà Nội' },
            { value: 'Đà Nẵng', label: 'Đà Nẵng' },
            { value: 'Hồ Chí Minh', label: 'Hồ Chí Minh' },
            { value: 'Osaka', label: 'Osaka' }]
            } />
          
            <Select
            value={role}
            onChange={(e) => {setRole(e.target.value);setPage(1);}}
            placeholder="Tất cả chức vụ"
            options={Array.from(new Set(MEMBERS.map((m) => m.role))).map((r) => ({ value: r, label: r }))} />
          
            <Select
            value={status}
            onChange={(e) => {setStatus(e.target.value);setPage(1);}}
            placeholder="Tất cả trạng thái"
            options={Object.entries(MEMBER_STATUS_META).map(([k, v]) => ({ value: k, label: v.label }))} />
          
            <div className="flex-1" />
            <span className="text-[12px] text-muted-foreground">
              {filtered.length} / {MEMBERS.length} kết quả
            </span>
          </FilterBar>

          <div className="card-surface overflow-hidden rise" style={{ animationDelay: '180ms' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="text-left py-3 px-5">Nhân viên</th>
                    <th className="text-left py-3 px-3">Chi nhánh</th>
                    <th className="text-left py-3 px-3">Chức vụ</th>
                    <th className="text-left py-3 px-3">Liên hệ</th>
                    <th className="text-center py-3 px-3">N. ngữ</th>
                    <th className="text-center py-3 px-3">Rank</th>
                    <th className="text-center py-3 px-3">Trạng thái</th>
                    <th className="text-right py-3 px-5">Vào CT</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.map((m) =>
                <tr
                  key={m.id}
                  onClick={() => setOpenMember(m)}
                  className="border-b border-border/60 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors">
                  
                      <td className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <Avatar name={m.name} size={36} />
                          <div className="min-w-0">
                            <p className="font-semibold text-foreground">{m.name}</p>
                            <p className="text-[11.5px] text-muted-foreground">#{m.id.toString().padStart(4, '0')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1.5 text-foreground/80">
                          <Icon.Building size={12} className="text-muted-foreground" />
                          {m.branch}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-foreground/80">{m.role}</td>
                      <td className="py-3 px-3">
                        <p className="text-foreground/85 truncate max-w-[200px]">{m.email}</p>
                        <p className="text-[11.5px] text-muted-foreground font-mono">{m.phone}</p>
                      </td>
                      <td className="py-3 px-3 text-center">
                        {m.jp === '—' ?
                    <span className="text-muted-foreground">—</span> :
                    <Badge variant={m.jp === 'N1' || m.jp === 'N2' ? 'primary' : 'gray'}>{m.jp}</Badge>}
                      </td>
                      <td className="py-3 px-3 text-center">
                        {m.rank === '—' ?
                    <span className="text-muted-foreground">—</span> :
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md text-[11px] font-bold text-white"
                    style={{ background:
                      m.rank === 'S' ? '#0ea5e9' :
                      m.rank === 'A' ? '#22c55e' :
                      m.rank === 'B' ? '#a3a3a3' : '#eab308' }}>{m.rank}</span>}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <Badge variant={MEMBER_STATUS_META[m.status].variant} dot>{MEMBER_STATUS_META[m.status].label}</Badge>
                      </td>
                      <td className="py-3 px-5 text-right font-mono text-muted-foreground">{m.join}</td>
                    </tr>
                )}
                  {paged.length === 0 &&
                <tr><td colSpan="8" className="py-16 text-center text-muted-foreground">
                      <Icon.Users size={36} className="mx-auto mb-2 opacity-30" />
                      <p className="text-[13px]">Không tìm thấy nhân viên phù hợp</p>
                    </td></tr>
                }
                </tbody>
              </table>
            </div>
            {filtered.length > perPage && <Pagination page={page} total={filtered.length} perPage={perPage} onChange={setPage} />}
          </div>
        </> :

      <div className="card-surface overflow-hidden rise" style={{ animationDelay: '180ms' }}>
          <div className="px-5 py-3.5 border-b border-border/70 flex items-center justify-between">
            <h3 className="section-title">Lời mời đang chờ phản hồi</h3>
            <Btn variant="primary" size="sm" icon="UserPlus" onClick={() => setInviteOpen(true)}>Mời mới</Btn>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
                <th className="text-left py-3 px-5">Email</th>
                <th className="text-left py-3 px-3">Chức vụ dự kiến</th>
                <th className="text-left py-3 px-3">Chi nhánh</th>
                <th className="text-left py-3 px-3">Người mời</th>
                <th className="text-left py-3 px-3">Ngày gửi</th>
                <th className="text-center py-3 px-3">Trạng thái</th>
                <th className="text-right py-3 px-5">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map((inv, i) =>
            <tr key={i} className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-5 font-mono text-[12.5px]">{inv.email}</td>
                  <td className="py-3 px-3 text-foreground/85">{inv.role}</td>
                  <td className="py-3 px-3 text-foreground/85">{inv.branch}</td>
                  <td className="py-3 px-3 text-foreground/85">{inv.by}</td>
                  <td className="py-3 px-3 font-mono text-muted-foreground">{inv.sent}</td>
                  <td className="py-3 px-3 text-center">
                    {inv.status === 'pending' ?
                <Badge variant="amber" dot>Chờ phản hồi</Badge> :
                <Badge variant="gray">Đã hết hạn</Badge>}
                  </td>
                  <td className="py-3 px-5 text-right">
                    <div className="inline-flex gap-1.5">
                      <Btn variant="outline" size="xs">Gửi lại</Btn>
                      <Btn variant="ghost" size="xs">Huỷ</Btn>
                    </div>
                  </td>
                </tr>
            )}
            </tbody>
          </table>
        </div>
      }

      {/* Member detail drawer */}
      {openMember && <MemberDetail member={openMember} onClose={() => setOpenMember(null)} />}

      {/* Invite modal */}
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} onSend={handleInviteSent} />

      {/* Toast */}
      {invToast &&
      <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium text-white shadow-popover rise"
      style={{ background: 'hsl(160 60% 40%)', animationDuration: '0.2s' }}>
          <Icon.Check size={13} />
          {invToast}
        </div>
      }
    </div>);

};

const MemberDetail = ({ member, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background border-l border-border w-full max-w-md h-full flex flex-col rise" style={{ animationDuration: '.4s' }}>
        <div className="p-5 border-b border-border/70 flex items-start justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar name={member.name} size={48} />
            <div className="min-w-0">
              <h3 className="font-bold text-[16px] font-heading text-foreground truncate">{member.name}</h3>
              <p className="text-[12px] text-muted-foreground truncate">{member.role} · {member.branch}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted text-muted-foreground">
            <Icon.X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-5">
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Thông tin liên hệ</p>
            <ul className="space-y-2 text-[13px]">
              <li className="flex items-center gap-2"><Icon.Mail size={13} className="text-primary" /> {member.email}</li>
              <li className="flex items-center gap-2"><Icon.Phone size={13} className="text-primary" /> <span className="font-mono">{member.phone}</span></li>
              <li className="flex items-center gap-2"><Icon.Building size={13} className="text-primary" /> {member.branch}</li>
              <li className="flex items-center gap-2"><Icon.Calendar size={13} className="text-primary" /> Vào công ty <span className="font-mono">{member.join}</span></li>
            </ul>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Đánh giá</p>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-white text-[20px] font-bold font-heading"
              style={{ background: member.rank === 'S' ? '#0ea5e9' : member.rank === 'A' ? '#22c55e' : '#a3a3a3' }}>
                {member.rank}
              </span>
              <div className="flex-1">
                <p className="text-[13px] font-semibold">Kỳ hiện tại Q2/2026</p>
                <p className="text-[11.5px] text-muted-foreground">Tăng 1 hạng so với Q1</p>
              </div>
            </div>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Dự án đang tham gia</p>
            <ul className="space-y-2">
              {['Cổng thanh toán XYZ', 'Hệ thống CRM nội bộ', 'Module báo cáo BI'].map((p, i) =>
              <li key={i} className="flex items-center justify-between text-[13px] p-2 -mx-2 rounded-md hover:bg-muted/40">
                  <span>{p}</span>
                  <Icon.ChevronRight size={12} className="text-muted-foreground" />
                </li>
              )}
            </ul>
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground mb-2">Kỹ năng</p>
            <div className="flex flex-wrap gap-1.5">
              {['Vue.js', 'TypeScript', 'Node.js', 'Tailwind', 'Figma', 'AWS'].map((s) =>
              <span key={s} className="px-2 py-0.5 rounded-full text-[11.5px] bg-muted text-foreground/80">{s}</span>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-border/70 flex items-center gap-2">
          <Btn variant="outline" size="sm" icon="External" className="flex-1"
            onClick={() => {
              window.__profileMember = member;
              if (typeof window.__erp_navigate === 'function') window.__erp_navigate('/hrm/member/profile');
            }}>Xem hồ sơ đầy đủ</Btn>
          <Btn variant="primary" size="sm" icon="FileText">Chỉnh sửa</Btn>
        </div>
      </div>
    </div>);

};

window.PageMember = PageMember;