/* ═══════════════════════════════════════════════════════════
   Page: Cài đặt hệ thống — Micro ERP
   ═══════════════════════════════════════════════════════════ */

// ── Shared primitives ─────────────────────────────────────────────

const SModal = ({ open, title, onClose, children, footer }) => {
  if (!open) return null;
  return ReactDOM.createPortal(
    <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.42)', backdropFilter:'blur(3px)' }} />
      <div className="relative card-surface mx-4 rise" style={{ maxWidth:460, width:'100%', zIndex:1, borderRadius:18, overflow:'hidden', animationDuration:'0.18s' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-heading font-bold text-[15px] text-foreground">{title}</h3>
          <button onClick={onClose} className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
            <Icon.X size={14} />
          </button>
        </div>
        <div className="p-5 space-y-4">{children}</div>
        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-4 border-t border-border/70 bg-muted/20">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
};

const SF = ({ label, req, children, hint }) => (
  <div className="space-y-1.5">
    <label className="block text-[11px] font-semibold tracking-[0.09em] uppercase text-muted-foreground">
      {label}{req && <span className="text-red-400 ml-0.5">*</span>}
    </label>
    {children}
    {hint && <p className="text-[11.5px] text-muted-foreground/70">{hint}</p>}
  </div>
);

const SI = ({ value, onChange, placeholder, type = 'text', min, step }) => (
  <input
    type={type} value={value ?? ''} onChange={onChange}
    placeholder={placeholder} min={min} step={step}
    className="w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 transition-colors placeholder:text-muted-foreground/50"
  />
);

const SDrop = ({ value, onChange, options }) => (
  <Select value={value ?? ''} onChange={onChange} options={options} width="100%" placeholder={null} />
);

const SToast = ({ msg, type = 'ok', clear }) => {
  React.useEffect(() => {
    if (msg) { const t = setTimeout(clear, 2800); return () => clearTimeout(t); }
  }, [msg]);
  if (!msg) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium text-white shadow-popover rise"
      style={{ background: type === 'ok' ? 'hsl(160 60% 40%)' : 'hsl(0 70% 52%)', animationDuration: '0.2s' }}>
      {type === 'ok' ? <Icon.Check size={13} /> : <Icon.X size={13} />}
      {msg}
    </div>
  );
};

const SHead = ({ title, desc, action }) => (
  <div className="flex items-start justify-between gap-4 mb-6">
    <div>
      <h2 className="font-heading font-bold text-[20px] text-foreground leading-tight">{title}</h2>
      {desc && <p className="text-[13px] text-muted-foreground mt-1 max-w-xl">{desc}</p>}
    </div>
    {action}
  </div>
);

const STbl = ({ cols, rows, renderRow }) => (
  <div className="card-surface overflow-hidden">
    <table className="w-full text-[13px]">
      <thead>
        <tr className="thead-primary border-b border-border/70">
          {cols.map(c => (
            <th key={c.key} className={`px-4 py-2.5 text-left text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground ${c.w || ''}`}>
              {c.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.length === 0
          ? <tr><td colSpan={cols.length} className="px-4 py-10 text-center text-muted-foreground text-[13px]">Chưa có dữ liệu</td></tr>
          : rows.map((r, i) => (
            <tr key={r.id ?? i} className="border-b border-border/40 last:border-0 hover:bg-muted/20 transition-colors">
              {renderRow(r)}
            </tr>
          ))
        }
      </tbody>
    </table>
  </div>
);

const DelBtn = ({ onClick }) => (
  <button onClick={onClick} className="h-7 px-2.5 rounded-md text-[12px] font-medium text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors">
    Xoá
  </button>
);

// ── Section: Email tổ chức ────────────────────────────────────────

const SEmailSettings = () => {
  const [email, setEmail] = React.useState('noreply@vnlab.com.vn');
  const [toast, setToast] = React.useState({ msg: '', type: 'ok' });
  const [testing, setTesting] = React.useState(false);
  const notify = (msg, type = 'ok') => setToast({ msg, type });
  const isValid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim());

  const save = () => {
    if (!isValid) return notify('Email không hợp lệ.', 'err');
    notify('Đã lưu email tổ chức thành công.');
  };
  const test = () => {
    if (!isValid) return notify('Email không hợp lệ.', 'err');
    setTesting(true);
    setTimeout(() => { setTesting(false); notify('Email test đã được gửi tới ' + email + '!'); }, 1400);
  };

  return (
    <div>
      <SHead title="Email tổ chức" desc="Địa chỉ email hệ thống dùng để gửi thông báo tự động cho nhân viên." />
      <div className="card-surface p-6 max-w-[520px]">
        <SF label="Email gửi" req hint="Hệ thống sẽ dùng địa chỉ này làm người gửi cho mọi email thông báo.">
          <SI value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="noreply@company.com" />
        </SF>

        <div className="mt-6 pt-5 border-t border-border/60 flex items-center gap-2">
          <Btn variant="outline" size="sm" onClick={test}>
            {testing ? 'Đang gửi…' : 'Gửi email test'}
          </Btn>
          <Btn variant="primary" size="sm" onClick={save}>Lưu cài đặt</Btn>
        </div>
      </div>
      <SToast msg={toast.msg} type={toast.type} clear={() => setToast(p => ({ ...p, msg: '' }))} />
    </div>
  );
};

// ── Section: Chi nhánh ────────────────────────────────────────────

const BRANCH_INIT = [
  { id: 1, name: 'Hà Nội (Trụ sở)', address: '123 Cầu Giấy, Hà Nội', phone: '024 3789 0000' },
  { id: 2, name: 'Đà Nẵng', address: '45 Nguyễn Văn Linh, Đà Nẵng', phone: '0236 378 9111' },
  { id: 3, name: 'Hồ Chí Minh', address: '88 Điện Biên Phủ, Q.1', phone: '028 3789 2222' },
  { id: 4, name: 'Osaka (Japan)', address: '2-3-4 Namba, Osaka-shi', phone: '+81 6 1234 5678' },
];

const SBranch = () => {
  const [rows, setRows] = React.useState(BRANCH_INIT);
  const [modal, setModal] = React.useState({ open: false, editing: false, row: null });
  const [delRow, setDelRow] = React.useState(null);
  const [toast, setToast] = React.useState({ msg: '', type: 'ok' });
  const [form, setForm] = React.useState({ name: '', address: '', phone: '' });
  const upd = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const notify = (msg, type = 'ok') => setToast({ msg, type });
  const closeModal = () => setModal(p => ({ ...p, open: false }));

  const openCreate = () => { setForm({ name: '', address: '', phone: '' }); setModal({ open: true, editing: false }); };
  const openEdit = r => { setForm({ name: r.name, address: r.address, phone: r.phone }); setModal({ open: true, editing: true, row: r }); };

  const save = () => {
    if (!form.name.trim()) return;
    if (modal.editing) {
      setRows(rs => rs.map(r => r.id === modal.row.id ? { ...r, ...form } : r));
      notify('Đã cập nhật chi nhánh.');
    } else {
      setRows(rs => [...rs, { id: Date.now(), ...form }]);
      notify('Đã thêm chi nhánh mới.');
    }
    closeModal();
  };

  const doDelete = () => {
    setRows(rs => rs.filter(r => r.id !== delRow.id));
    notify('Đã xoá chi nhánh.');
    setDelRow(null);
  };

  return (
    <div>
      <SHead title="Chi nhánh" desc="Quản lý các chi nhánh và văn phòng của tổ chức."
        action={<Btn variant="primary" size="sm" icon="Plus" onClick={openCreate}>Thêm chi nhánh</Btn>} />

      <STbl
        cols={[
          { key: 'name', label: 'Tên chi nhánh' },
          { key: 'address', label: 'Địa chỉ' },
          { key: 'phone', label: 'Điện thoại', w: 'w-36' },
          { key: 'act', label: '', w: 'w-28' },
        ]}
        rows={rows}
        renderRow={r => <>
          <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
          <td className="px-4 py-3 text-muted-foreground">{r.address}</td>
          <td className="px-4 py-3 font-mono text-[12px] text-muted-foreground">{r.phone}</td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-1 justify-end">
              <Btn variant="ghost" size="xs" onClick={() => openEdit(r)}>Sửa</Btn>
              <DelBtn onClick={() => setDelRow(r)} />
            </div>
          </td>
        </>}
      />

      <SModal open={modal.open} title={modal.editing ? 'Chỉnh sửa chi nhánh' : 'Thêm chi nhánh'} onClose={closeModal}
        footer={<><Btn variant="outline" size="sm" onClick={closeModal}>Huỷ</Btn><Btn variant="primary" size="sm" onClick={save}>Lưu</Btn></>}>
        <SF label="Tên chi nhánh" req><SI value={form.name} onChange={upd('name')} placeholder="VD: Hà Nội, TP.HCM…" /></SF>
        <SF label="Địa chỉ"><SI value={form.address} onChange={upd('address')} placeholder="Số nhà, đường, quận/huyện…" /></SF>
        <SF label="Điện thoại"><SI value={form.phone} onChange={upd('phone')} placeholder="024 xxxx xxxx" /></SF>
      </SModal>

      <SModal open={!!delRow} title="Xác nhận xoá" onClose={() => setDelRow(null)}
        footer={<><Btn variant="outline" size="sm" onClick={() => setDelRow(null)}>Huỷ</Btn><Btn variant="danger" size="sm" onClick={doDelete}>Xoá</Btn></>}>
        <p className="text-[13.5px] text-foreground/80">Xoá chi nhánh <strong className="text-foreground">{delRow?.name}</strong>?
          <br /><span className="text-[12.5px] text-muted-foreground">Hành động này không thể hoàn tác.</span></p>
      </SModal>

      <SToast msg={toast.msg} type={toast.type} clear={() => setToast(p => ({ ...p, msg: '' }))} />
    </div>
  );
};

// ── Section: Ngày nghỉ lễ ─────────────────────────────────────────

const HOLIDAYS_2026 = [
  { id: 1, date: '2026-01-01', name: 'Tết Dương Lịch' },
  { id: 2, date: '2026-02-17', name: 'Tết Nguyên Đán (nghỉ bù)' },
  { id: 3, date: '2026-02-18', name: 'Mùng 1 Tết' },
  { id: 4, date: '2026-02-19', name: 'Mùng 2 Tết' },
  { id: 5, date: '2026-02-20', name: 'Mùng 3 Tết' },
  { id: 6, date: '2026-02-21', name: 'Mùng 4 Tết' },
  { id: 7, date: '2026-02-22', name: 'Mùng 5 Tết' },
  { id: 8, date: '2026-04-07', name: 'Giỗ Tổ Hùng Vương' },
  { id: 9, date: '2026-04-30', name: 'Giải phóng miền Nam' },
  { id: 10, date: '2026-05-01', name: 'Quốc tế Lao động' },
  { id: 11, date: '2026-09-02', name: 'Quốc khánh' },
  { id: 12, date: '2026-09-03', name: 'Quốc khánh (nghỉ bù)' },
];
const MONTH_VI = ['', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];

const SHolidays = () => {
  const [year, setYear] = React.useState('2026');
  const [rows, setRows] = React.useState(HOLIDAYS_2026);
  const [modal, setModal] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', date: '' });
  const [toast, setToast] = React.useState({ msg: '', type: 'ok' });
  const notify = (msg, type = 'ok') => setToast({ msg, type });

  const yearRows = rows.filter(h => h.date.startsWith(year));
  const grouped = React.useMemo(() => {
    const g = {};
    for (const h of yearRows) {
      const m = parseInt(h.date.split('-')[1]);
      (g[m] = g[m] || []).push({ ...h, day: parseInt(h.date.split('-')[2]) });
    }
    return g;
  }, [rows, year]);

  const addHoliday = () => {
    if (!form.name || !form.date) return;
    setRows(rs => [...rs, { id: Date.now(), ...form }]);
    notify('Đã thêm: ' + form.name);
    setForm({ name: '', date: '' });
    setModal(false);
  };
  const del = h => { setRows(rs => rs.filter(r => r.id !== h.id)); notify('Đã xoá ' + h.name + '.'); };

  const yearOpts = [2025, 2026, 2027, 2028].map(y => ({ value: String(y), label: String(y) }));

  return (
    <div>
      <SHead title="Ngày nghỉ lễ" desc="Thiết lập lịch nghỉ lễ hàng năm cho toàn tổ chức."
        action={
          <div className="flex items-center gap-2">
            <SDrop value={year} onChange={e => setYear(e.target.value)} options={yearOpts} />
            <Btn variant="primary" size="sm" icon="Plus" onClick={() => setModal(true)}>Thêm ngày lễ</Btn>
          </div>
        } />

      <div className="mb-3">
        <Badge variant="primary">{yearRows.length} ngày nghỉ lễ · {year}</Badge>
      </div>

      {Object.keys(grouped).length === 0
        ? <div className="card-surface p-12 text-center text-muted-foreground text-[13px]">Chưa có ngày lễ nào cho năm {year}</div>
        : <div className="space-y-3">
          {Object.entries(grouped).sort((a, b) => Number(a[0]) - Number(b[0])).map(([m, hs]) => (
            <div key={m} className="card-surface overflow-hidden">
              <div className="px-5 py-2.5 bg-muted/30 border-b border-border/60 flex items-center gap-2.5">
                <Icon.Calendar size={12} className="text-muted-foreground" />
                <span className="text-[11.5px] font-semibold uppercase tracking-wide text-muted-foreground">{MONTH_VI[parseInt(m)]} {year}</span>
                <span className="ml-auto text-[11px] text-muted-foreground/70 tabular-nums">{hs.length} ngày</span>
              </div>
              {hs.map((h, i) => (
                <div key={h.id}
                  className={`flex items-center justify-between px-5 py-3 hover:bg-muted/20 transition-colors ${i < hs.length - 1 ? 'border-b border-border/40' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold font-heading text-[14px] shrink-0"
                      style={{ background: 'hsl(var(--primary-h) var(--primary-s) 57% / 0.1)', color: 'hsl(var(--primary))' }}>
                      {h.day}
                    </div>
                    <div>
                      <p className="text-[13.5px] font-medium text-foreground">{h.name}</p>
                      <p className="text-[11.5px] text-muted-foreground font-mono">{h.date}</p>
                    </div>
                  </div>
                  <DelBtn onClick={() => del(h)} />
                </div>
              ))}
            </div>
          ))}
        </div>
      }

      <SModal open={modal} title="Thêm ngày lễ" onClose={() => setModal(false)}
        footer={<><Btn variant="outline" size="sm" onClick={() => setModal(false)}>Huỷ</Btn><Btn variant="primary" size="sm" onClick={addHoliday}>Thêm</Btn></>}>
        <SF label="Tên ngày lễ" req>
          <SI value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="VD: Tết Nguyên Đán" />
        </SF>
        <SF label="Ngày" req>
          <SI value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} type="date" />
        </SF>
      </SModal>
      <SToast msg={toast.msg} type={toast.type} clear={() => setToast(p => ({ ...p, msg: '' }))} />
    </div>
  );
};

// ── Section: Chức danh ────────────────────────────────────────────

const JOB_INIT = [
  { id: 1, name: 'Software Engineer' },
  { id: 2, name: 'Senior Software Engineer' },
  { id: 3, name: 'Tech Lead' },
  { id: 4, name: 'Product Manager' },
  { id: 5, name: 'UI/UX Designer' },
  { id: 6, name: 'QA Engineer' },
  { id: 7, name: 'DevOps Engineer' },
  { id: 8, name: 'Business Analyst' },
  { id: 9, name: 'Scrum Master' },
  { id: 10, name: 'BrSE' },
];

const SJobTitle = () => {
  const [rows, setRows] = React.useState(JOB_INIT);
  const [modal, setModal] = React.useState({ open: false, editing: false, row: null });
  const [delRow, setDelRow] = React.useState(null);
  const [name, setName] = React.useState('');
  const [toast, setToast] = React.useState({ msg: '', type: 'ok' });
  const notify = (msg, type = 'ok') => setToast({ msg, type });
  const closeModal = () => setModal(p => ({ ...p, open: false }));

  const openCreate = () => { setName(''); setModal({ open: true, editing: false }); };
  const openEdit = r => { setName(r.name); setModal({ open: true, editing: true, row: r }); };

  const save = () => {
    if (!name.trim()) return;
    if (modal.editing) {
      setRows(rs => rs.map(r => r.id === modal.row.id ? { ...r, name } : r));
      notify('Đã cập nhật chức danh.');
    } else {
      setRows(rs => [...rs, { id: Date.now(), name }]);
      notify('Đã thêm chức danh mới.');
    }
    closeModal();
  };

  return (
    <div>
      <SHead title="Chức danh" desc="Danh sách chức danh được sử dụng trong hồ sơ nhân viên và hợp đồng lao động."
        action={<Btn variant="primary" size="sm" icon="Plus" onClick={openCreate}>Thêm chức danh</Btn>} />

      <STbl
        cols={[{ key: 'name', label: 'Tên chức danh' }, { key: 'act', label: '', w: 'w-28' }]}
        rows={rows}
        renderRow={r => <>
          <td className="px-4 py-3">
            <span className="font-medium text-foreground">{r.name}</span>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-1 justify-end">
              <Btn variant="ghost" size="xs" onClick={() => openEdit(r)}>Sửa</Btn>
              <DelBtn onClick={() => setDelRow(r)} />
            </div>
          </td>
        </>}
      />

      <SModal open={modal.open} title={modal.editing ? 'Chỉnh sửa chức danh' : 'Thêm chức danh'} onClose={closeModal}
        footer={<><Btn variant="outline" size="sm" onClick={closeModal}>Huỷ</Btn><Btn variant="primary" size="sm" onClick={save}>Lưu</Btn></>}>
        <SF label="Tên chức danh" req>
          <SI value={name} onChange={e => setName(e.target.value)} placeholder="VD: Senior Developer" />
        </SF>
      </SModal>

      <SModal open={!!delRow} title="Xác nhận xoá" onClose={() => setDelRow(null)}
        footer={<><Btn variant="outline" size="sm" onClick={() => setDelRow(null)}>Huỷ</Btn>
          <Btn variant="danger" size="sm" onClick={() => { setRows(rs => rs.filter(r => r.id !== delRow.id)); notify('Đã xoá chức danh.'); setDelRow(null); }}>Xoá</Btn></>}>
        <p className="text-[13.5px] text-foreground/80">Xoá chức danh <strong className="text-foreground">{delRow?.name}</strong>?</p>
      </SModal>

      <SToast msg={toast.msg} type={toast.type} clear={() => setToast(p => ({ ...p, msg: '' }))} />
    </div>
  );
};

// ── Section: Cài đặt tăng ca ─────────────────────────────────────

const SOvertime = () => {
  const [f, setF] = React.useState({ max_day: 4, max_month: 40, mult_wd: 1.5, mult_we: 2.0, mult_hol: 3.0, req_approval: true });
  const [toast, setToast] = React.useState({ msg: '', type: 'ok' });
  const upd = k => e => setF(p => ({ ...p, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  return (
    <div>
      <SHead title="Cài đặt tăng ca" desc="Thiết lập giới hạn giờ OT và hệ số lương cho từng loại ngày." />
      <div className="card-surface p-6 max-w-[520px] space-y-6">

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-3">Giới hạn giờ OT</p>
          <div className="grid grid-cols-2 gap-4">
            <SF label="Tối đa / ngày" req>
              <div className="flex items-center gap-2">
                <SI value={f.max_day} onChange={upd('max_day')} type="number" min="1" />
                <span className="text-[12px] text-muted-foreground shrink-0">giờ</span>
              </div>
            </SF>
            <SF label="Tối đa / tháng" req>
              <div className="flex items-center gap-2">
                <SI value={f.max_month} onChange={upd('max_month')} type="number" min="1" />
                <span className="text-[12px] text-muted-foreground shrink-0">giờ</span>
              </div>
            </SF>
          </div>
        </div>

        <div className="border-t border-border/60 pt-5">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground mb-3">Hệ số lương tăng ca</p>
          <div className="grid grid-cols-3 gap-4">
            <SF label="Ngày thường">
              <SI value={f.mult_wd} onChange={upd('mult_wd')} type="number" min="1" step="0.1" />
            </SF>
            <SF label="Cuối tuần">
              <SI value={f.mult_we} onChange={upd('mult_we')} type="number" min="1" step="0.1" />
            </SF>
            <SF label="Ngày lễ">
              <SI value={f.mult_hol} onChange={upd('mult_hol')} type="number" min="1" step="0.1" />
            </SF>
          </div>
          <p className="text-[11.5px] text-muted-foreground/70 mt-2">Lương tăng ca = lương cơ bản × hệ số × số giờ OT</p>
        </div>

        <div className="border-t border-border/60 pt-5">
          <label className="flex items-start gap-3 cursor-pointer select-none group">
            <input id="req-ot" type="checkbox" checked={f.req_approval} onChange={upd('req_approval')}
              className="h-4 w-4 rounded mt-0.5 accent-primary cursor-pointer shrink-0" />
            <div>
              <p className="text-[13px] font-medium text-foreground group-hover:text-primary transition-colors">Yêu cầu phê duyệt trước khi ghi nhận OT</p>
              <p className="text-[12px] text-muted-foreground mt-0.5">Nhân viên cần gửi đề xuất và chờ quản lý duyệt trước khi tăng ca có hiệu lực.</p>
            </div>
          </label>
        </div>

        <div className="border-t border-border/60 pt-4">
          <Btn variant="primary" size="sm" onClick={() => setToast({ msg: 'Đã lưu cài đặt tăng ca.', type: 'ok' })}>Lưu cài đặt</Btn>
        </div>
      </div>
      <SToast msg={toast.msg} type={toast.type} clear={() => setToast(p => ({ ...p, msg: '' }))} />
    </div>
  );
};

// ── Section: Công nghệ & Kỹ năng ─────────────────────────────────

const TECH_INIT = [
  { id: 1, name: 'ReactJS', category: 'frontend' },
  { id: 2, name: 'VueJS', category: 'frontend' },
  { id: 3, name: 'TypeScript', category: 'frontend' },
  { id: 4, name: 'Node.js', category: 'backend' },
  { id: 5, name: 'Python', category: 'backend' },
  { id: 6, name: 'Go', category: 'backend' },
  { id: 7, name: 'PostgreSQL', category: 'database' },
  { id: 8, name: 'MongoDB', category: 'database' },
  { id: 9, name: 'Docker', category: 'devops' },
  { id: 10, name: 'Kubernetes', category: 'devops' },
  { id: 11, name: 'AWS', category: 'devops' },
  { id: 12, name: 'React Native', category: 'mobile' },
  { id: 13, name: 'Agile / Scrum', category: 'soft_skill' },
  { id: 14, name: 'Redis', category: 'database' },
];

const CATS = [
  { value: '', label: 'Tất cả' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'devops', label: 'DevOps' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'database', label: 'Database' },
  { value: 'soft_skill', label: 'Kỹ năng mềm' },
  { value: 'other', label: 'Khác' },
];
const CAT_BADGE = { frontend: 'primary', backend: 'violet', devops: 'amber', mobile: 'green', database: 'sky', soft_skill: 'gray', other: 'gray' };

const STechnology = () => {
  const [rows, setRows] = React.useState(TECH_INIT);
  const [filter, setFilter] = React.useState('');
  const [modal, setModal] = React.useState({ open: false, editing: false, row: null });
  const [delRow, setDelRow] = React.useState(null);
  const [form, setForm] = React.useState({ name: '', category: 'frontend' });
  const [toast, setToast] = React.useState({ msg: '', type: 'ok' });
  const upd = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const notify = (msg, type = 'ok') => setToast({ msg, type });
  const closeModal = () => setModal(p => ({ ...p, open: false }));

  const filtered = filter ? rows.filter(r => r.category === filter) : rows;
  const openCreate = () => { setForm({ name: '', category: 'frontend' }); setModal({ open: true, editing: false }); };
  const openEdit = r => { setForm({ name: r.name, category: r.category }); setModal({ open: true, editing: true, row: r }); };

  const save = () => {
    if (!form.name.trim()) return;
    if (modal.editing) {
      setRows(rs => rs.map(r => r.id === modal.row.id ? { ...r, ...form } : r));
      notify('Đã cập nhật công nghệ.');
    } else {
      setRows(rs => [...rs, { id: Date.now(), ...form }]);
      notify('Đã thêm: ' + form.name);
    }
    closeModal();
  };

  const catLabel = c => CATS.find(o => o.value === c)?.label || c;

  return (
    <div>
      <SHead title="Công nghệ & Kỹ năng" desc="Danh mục công nghệ và kỹ năng dùng trong hồ sơ nhân viên và quản lý tuyển dụng."
        action={<Btn variant="primary" size="sm" icon="Plus" onClick={openCreate}>Thêm</Btn>} />

      <div className="flex items-center gap-2 flex-wrap mb-4">
        {CATS.map(o => (
          <button key={o.value} onClick={() => setFilter(o.value)}
            className={'h-7 px-3 rounded-full text-[12px] font-medium transition-all ' +
              (filter === o.value ? 'text-white' : 'border border-border text-muted-foreground hover:border-primary/50 hover:text-foreground')}
            style={filter === o.value ? { background: 'linear-gradient(135deg,hsl(var(--primary-h) var(--primary-s) 60%),hsl(var(--primary-h) var(--primary-s) 42%))' } : {}}>
            {o.label}
          </button>
        ))}
      </div>

      <STbl
        cols={[
          { key: 'name', label: 'Tên công nghệ / kỹ năng' },
          { key: 'cat', label: 'Danh mục', w: 'w-40' },
          { key: 'act', label: '', w: 'w-28' },
        ]}
        rows={filtered}
        renderRow={r => <>
          <td className="px-4 py-3 font-medium text-foreground">{r.name}</td>
          <td className="px-4 py-3">
            <Badge variant={CAT_BADGE[r.category] || 'gray'}>{catLabel(r.category)}</Badge>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center gap-1 justify-end">
              <Btn variant="ghost" size="xs" onClick={() => openEdit(r)}>Sửa</Btn>
              <DelBtn onClick={() => setDelRow(r)} />
            </div>
          </td>
        </>}
      />

      <SModal open={modal.open} title={modal.editing ? 'Sửa công nghệ' : 'Thêm công nghệ / kỹ năng'} onClose={closeModal}
        footer={<><Btn variant="outline" size="sm" onClick={closeModal}>Huỷ</Btn><Btn variant="primary" size="sm" onClick={save}>Lưu</Btn></>}>
        <SF label="Tên" req>
          <SI value={form.name} onChange={upd('name')} placeholder="VD: ReactJS, Python, AWS…" />
        </SF>
        <SF label="Danh mục">
          <SDrop value={form.category} onChange={upd('category')} options={CATS.filter(o => o.value)} />
        </SF>
      </SModal>

      <SModal open={!!delRow} title="Xác nhận xoá" onClose={() => setDelRow(null)}
        footer={<><Btn variant="outline" size="sm" onClick={() => setDelRow(null)}>Huỷ</Btn>
          <Btn variant="danger" size="sm" onClick={() => { setRows(rs => rs.filter(r => r.id !== delRow.id)); notify('Đã xoá.'); setDelRow(null); }}>Xoá</Btn></>}>
        <p className="text-[13.5px] text-foreground/80">Xoá <strong className="text-foreground">{delRow?.name}</strong>?</p>
      </SModal>

      <SToast msg={toast.msg} type={toast.type} clear={() => setToast(p => ({ ...p, msg: '' }))} />
    </div>
  );
};

// ── Section: Phân quyền người dùng ───────────────────────────────

const PERM_MEMBERS = [
  { id: 1, name: 'Nguyễn Văn An',   email: 'an.nv@vnlab.com.vn',    role: 'Tech Lead',       perms: ['member_list','member_profile','leave_create','leave_info','timekeeping','asset_list','asset_borrow'] },
  { id: 2, name: 'Trần Thị Bích',   email: 'bich.tt@vnlab.com.vn',  role: 'HR Manager',      perms: ['member_list','member_edit_profile','member_profile','member_manage_request','member_edit_account','leave_create','leave_add_history','leave_manage','leave_info','leave_manage_request','leave_create_other','timekeeping','timekeeping_manage'] },
  { id: 3, name: 'Lê Minh Tuấn',    email: 'tuan.lm@vnlab.com.vn',  role: 'Senior Engineer', perms: ['member_list','member_profile','leave_create','leave_info','timekeeping','contract_labor','contract_view','asset_list'] },
  { id: 4, name: 'Phạm Thu Hương',  email: 'huong.pt@vnlab.com.vn', role: 'Engineer',        perms: ['member_profile','leave_create','leave_info','timekeeping'] },
  { id: 5, name: 'Hoàng Đức Long',  email: 'long.hd@vnlab.com.vn',  role: 'PM',              perms: ['member_list','member_profile','member_manage_request','leave_create','leave_info','leave_manage_request','leave_create_other','timekeeping','timekeeping_manage','asset_list','asset_borrow','asset_add'] },
  { id: 6, name: 'Vũ Thị Lan',      email: 'lan.vt@vnlab.com.vn',   role: 'Engineer',        perms: ['member_profile','leave_create','leave_info','timekeeping'] },
  { id: 7, name: 'Đỗ Minh Quân',    email: 'quan.dm@vnlab.com.vn',  role: 'Recruiter',       perms: ['member_list','member_profile','leave_create','leave_info','timekeeping'] },
  { id: 8, name: 'Bùi Thanh Sơn',   email: 'son.bt@vnlab.com.vn',   role: 'Asset Manager',   perms: ['member_profile','leave_create','leave_info','timekeeping','asset_history','asset_list','asset_borrow','asset_add','contract_labor','contract_type'] },
  { id: 9, name: 'Ngô Quỳnh Anh',   email: 'anh.nq@vnlab.com.vn',   role: 'Engineer',        perms: ['member_profile','leave_create','leave_info','timekeeping'] },
  { id: 10, name: 'Sample User',    email: 'sample.user@vnlab.com.vn', role: 'Intern',       perms: ['member_profile','leave_create'] },
  { id: 11, name: 'Test Sample',    email: 'test.sample@vnlab.com.vn', role: 'QA',           perms: ['member_profile','leave_create','leave_info','timekeeping'] },
];

// Permissions grouped the way the legacy SPA structures them: module → granular items
const PERM_GROUPS = [
  { module: 'Nhân sự', icon: 'UserPlus', items: [
    { key: 'member_list',            label: 'Danh sách thành viên' },
    { key: 'member_edit_profile',    label: 'Sửa hồ sơ' },
    { key: 'member_profile',         label: 'Hồ sơ thành viên' },
    { key: 'member_manage_request',  label: 'Quản lí yêu cầu' },
    { key: 'member_edit_account',    label: 'Sửa tài khoản' },
  ]},
  { module: 'Nghỉ phép', icon: 'Calendar', items: [
    { key: 'leave_create',           label: 'Tạo yêu cầu xin nghỉ' },
    { key: 'leave_add_history',      label: 'Lịch sử thêm ngày phép' },
    { key: 'leave_manage',           label: 'Quản lý nghỉ phép' },
    { key: 'leave_info',             label: 'Thông tin nghỉ phép' },
    { key: 'leave_manage_request',   label: 'Quản lí yêu cầu xin nghỉ' },
    { key: 'leave_create_other',     label: 'Tạo yêu cầu xin nghỉ cho người khác' },
  ]},
  { module: 'Tài sản', icon: 'Briefcase', items: [
    { key: 'asset_history',          label: 'Lịch sử sử dụng tài sản' },
    { key: 'asset_list',             label: 'Danh sách tài sản' },
    { key: 'asset_borrow',           label: 'Yêu cầu mượn tài sản' },
    { key: 'asset_add',              label: 'Thêm tài sản mới' },
  ]},
  { module: 'Hợp đồng', icon: 'FileText', items: [
    { key: 'contract_labor',         label: 'Hợp đồng lao động' },
    { key: 'contract_view',          label: 'Xem hợp đồng lao động của nhân viên' },
    { key: 'contract_type',          label: 'Loại hợp đồng lao động' },
  ]},
  { module: 'Chấm công', icon: 'Timer', items: [
    { key: 'timekeeping_manage',     label: 'Quản lí chấm công' },
    { key: 'timekeeping',            label: 'Chấm công' },
  ]},
];

const TOTAL_PERMS = PERM_GROUPS.reduce((a, g) => a + g.items.length, 0);

const SPermission = () => {
  const [members, setMembers] = React.useState(PERM_MEMBERS);
  const [selId, setSelId] = React.useState(PERM_MEMBERS[0].id);
  const [savedId, setSavedId] = React.useState(null);
  const [toast, setToast] = React.useState({ msg: '', type: 'ok' });
  const [query, setQuery] = React.useState('');

  const q = query.trim().toLowerCase();
  const filtered = q
    ? members.filter(m => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q))
    : members;

  const selected = members.find(m => m.id === selId);

  const togglePerm = (key, checked) => {
    setMembers(ms => ms.map(m => m.id !== selId ? m : {
      ...m, perms: checked ? [...m.perms, key] : m.perms.filter(k => k !== key),
    }));
  };

  const toggleGroup = (groupKeys, checkAll) => {
    setMembers(ms => ms.map(m => {
      if (m.id !== selId) return m;
      const without = m.perms.filter(k => !groupKeys.includes(k));
      return { ...m, perms: checkAll ? [...without, ...groupKeys] : without };
    }));
  };

  const save = () => {
    if (!selected) return;
    setSavedId(selected.id);
    setTimeout(() => setSavedId(null), 1800);
    setToast({ msg: `Đã lưu quyền cho ${selected.name}.`, type: 'ok' });
  };

  return (
    <div>
      <SHead title="Phân quyền người dùng" desc="Chọn nhân viên và cấp quyền truy cập chi tiết theo từng module chức năng." />

      <div className="flex gap-5 items-start">
        {/* ── Left: searchable user list ── */}
        <div className="w-[260px] shrink-0 card-surface overflow-hidden flex flex-col" style={{ maxHeight: 620 }}>
          <div className="p-3 border-b border-border/70">
            <div className="relative">
              <Icon.Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input value={query} onChange={e => setQuery(e.target.value)}
                placeholder="Tìm tên / email…"
                className="w-full h-9 pl-9 pr-8 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 transition-colors placeholder:text-muted-foreground/50" />
              {query && (
                <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 h-5 w-5 rounded flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                  <Icon.X size={11} />
                </button>
              )}
            </div>
            <p className="text-[11px] text-muted-foreground mt-2 tabular-nums px-0.5">{filtered.length}/{members.length} nhân viên</p>
          </div>

          <div className="overflow-y-auto scrollbar-thin flex-1 p-1.5">
            {filtered.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground">
                <Icon.Search size={26} className="mx-auto mb-2 opacity-30" />
                <p className="text-[12px] px-3">Không khớp "<span className="text-foreground font-medium">{query}</span>"</p>
              </div>
            ) : filtered.map(m => {
              const isSel = m.id === selId;
              return (
                <button key={m.id} onClick={() => setSelId(m.id)}
                  className={'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-left transition-colors mb-0.5 ' +
                    (isSel ? 'bg-primary/10' : 'hover:bg-muted/50')}
                  style={isSel ? { boxShadow: 'inset 2px 0 0 hsl(var(--primary))' } : {}}>
                  <Avatar name={m.name} size={32} />
                  <div className="min-w-0 flex-1">
                    <p className={'text-[13px] font-medium truncate ' + (isSel ? 'text-primary' : 'text-foreground')}>{m.name}</p>
                    <p className="text-[11px] text-muted-foreground font-mono truncate">{m.email}</p>
                  </div>
                  <span className="text-[10.5px] font-mono text-muted-foreground tabular-nums shrink-0">{m.perms.length}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Right: permission matrix ── */}
        <div className="flex-1 min-w-0">
          {!selected ? (
            <div className="card-surface py-20 text-center text-muted-foreground">
              <Icon.Sliders size={34} className="mx-auto mb-2 opacity-30" />
              <p className="text-[13px]">Chọn một nhân viên để cấu hình quyền</p>
            </div>
          ) : (
            <>
              {/* Selected user header */}
              <div className="card-surface p-4 mb-4 flex items-center justify-between flex-wrap gap-3 sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <Avatar name={selected.name} size={40} />
                  <div>
                    <p className="font-semibold text-[15px] text-foreground">{selected.name}</p>
                    <p className="text-[12px] text-muted-foreground">{selected.role} · <span className="font-mono">{selected.email}</span></p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="primary">{selected.perms.length}/{TOTAL_PERMS} quyền</Badge>
                  <Btn variant={savedId === selected.id ? 'success' : 'primary'} size="sm" onClick={save}>
                    {savedId === selected.id ? <><Icon.Check size={12} /> Đã lưu</> : 'Lưu quyền'}
                  </Btn>
                </div>
              </div>

              {/* Permission groups */}
              <div className="space-y-3">
                {PERM_GROUPS.map(group => {
                  const groupKeys = group.items.map(i => i.key);
                  const checkedCount = groupKeys.filter(k => selected.perms.includes(k)).length;
                  const allChecked = checkedCount === groupKeys.length;
                  const someChecked = checkedCount > 0 && !allChecked;
                  const GIcon = Icon[group.icon];
                  return (
                    <div key={group.module} className="card-surface overflow-hidden">
                      {/* Group header */}
                      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border/60">
                        <div className="flex items-center gap-2.5">
                          {GIcon && <GIcon size={14} className="text-muted-foreground" />}
                          <span className="text-[12px] font-semibold uppercase tracking-wide text-foreground">{group.module}</span>
                          <span className="text-[11px] font-mono text-muted-foreground tabular-nums">{checkedCount}/{groupKeys.length}</span>
                        </div>
                        <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11.5px] text-muted-foreground hover:text-foreground transition-colors">
                          <input type="checkbox" checked={allChecked}
                            ref={el => { if (el) el.indeterminate = someChecked; }}
                            onChange={e => toggleGroup(groupKeys, e.target.checked)}
                            className="h-3.5 w-3.5 rounded accent-primary cursor-pointer" />
                          Chọn tất cả
                        </label>
                      </div>
                      {/* Items */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-0.5 p-3">
                        {group.items.map(item => {
                          const checked = selected.perms.includes(item.key);
                          return (
                            <label key={item.key}
                              className="flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer select-none group hover:bg-muted/40 transition-colors">
                              <input type="checkbox" checked={checked}
                                onChange={e => togglePerm(item.key, e.target.checked)}
                                className="h-3.5 w-3.5 rounded accent-primary cursor-pointer shrink-0" />
                              <span className={'text-[12.5px] transition-colors ' + (checked ? 'text-foreground' : 'text-foreground/65 group-hover:text-foreground')}>{item.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      <SToast msg={toast.msg} type={toast.type} clear={() => setToast(p => ({ ...p, msg: '' }))} />
    </div>
  );
};

// ── Root: PageSettings ────────────────────────────────────────────

const MONTHS_OPT = Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: `Tháng ${i + 1}` }));

const SLeave = () => {
  const [month, setMonth] = React.useState('1');
  const [toast, setToast] = React.useState({ msg: '', type: 'ok' });
  const save = () => setToast({ msg: `Đã lưu: ngày phép sẽ reset vào Tháng ${month} hàng năm.`, type: 'ok' });

  return (
    <div>
      <SHead title="Nghỉ phép" desc="Thiết lập thời điểm hết hạn và reset số ngày phép năm cho toàn tổ chức." />
      <div className="card-surface p-6 max-w-[520px]">
        <SF label="Tháng reset ngày phép" req
          hint="Vào đầu tháng được chọn, số ngày phép chưa dùng sẽ hết hạn và quota năm mới được cấp lại.">
          <SDrop value={month} onChange={e => setMonth(e.target.value)} options={MONTHS_OPT} />
        </SF>

        <div className="mt-5 flex items-start gap-2.5 p-3 rounded-xl bg-primary/5 border border-primary/15">
          <Icon.Info size={13} className="text-primary shrink-0 mt-0.5" />
          <p className="text-[12px] text-foreground/75 leading-relaxed">
            Chu kỳ phép hiện tại: <strong className="text-foreground">01/{String(month).padStart(2, '0')}</strong> năm nay
            → <strong className="text-foreground">cuối tháng {month === '1' ? '12' : Number(month) - 1}</strong> năm sau.
          </p>
        </div>

        <div className="mt-6 pt-5 border-t border-border/60">
          <Btn variant="primary" size="sm" onClick={save}>Lưu cài đặt</Btn>
        </div>
      </div>
      <SToast msg={toast.msg} type={toast.type} clear={() => setToast(p => ({ ...p, msg: '' }))} />
    </div>
  );
};

const SETTINGS_NAV = [
  {
    group: 'Tổ chức', items: [
      { key: 'email', label: 'Email tổ chức', icon: 'Mail' },
      { key: 'branch', label: 'Chi nhánh', icon: 'Building' },
      { key: 'leave', label: 'Nghỉ phép', icon: 'Calendar' },
    ],
  },
  {
    group: 'Nhân sự', items: [
      { key: 'job-title', label: 'Chức danh', icon: 'Briefcase' },
      { key: 'technology', label: 'Công nghệ & Kỹ năng', icon: 'Globe' },
    ],
  },
  {
    group: 'Vận hành', items: [
      { key: 'holidays', label: 'Ngày nghỉ lễ', icon: 'Calendar' },
      { key: 'overtime', label: 'Tăng ca', icon: 'Timer' },
    ],
  },
  {
    group: 'Hệ thống', items: [
      { key: 'permission', label: 'Phân quyền', icon: 'Sliders' },
    ],
  },
];

const SECTION_MAP = {
  'email':      SEmailSettings,
  'leave':      SLeave,
  'branch':     SBranch,
  'job-title':  SJobTitle,
  'technology': STechnology,
  'holidays':   SHolidays,
  'overtime':   SOvertime,
  'permission': SPermission,
};

const PageSettings = () => {
  const [active, setActive] = React.useState('email');
  const ActiveComp = SECTION_MAP[active] || SEmailSettings;

  return (
    <div>
      <PageHeader
        eyebrow="CÀI ĐẶT HỆ THỐNG"
      />

      <div className="flex gap-6 rise" style={{ animationDelay: '60ms' }}>
        {/* Left settings nav */}
        <aside className="w-[196px] shrink-0">
          <nav className="card-surface overflow-hidden sticky top-6">
            {SETTINGS_NAV.map(({ group, items }) => (
              <div key={group}>
                <div className="px-4 pt-4 pb-1 text-[10px] font-semibold tracking-[0.13em] uppercase text-muted-foreground/65 font-heading">
                  {group}
                </div>
                {items.map(item => {
                  const Ic = Icon[item.icon];
                  const isActive = active === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => setActive(item.key)}
                      className={'w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-medium transition-colors ' +
                        (isActive
                          ? 'text-primary bg-primary/5'
                          : 'text-foreground/70 hover:text-foreground hover:bg-muted/40')}
                      style={isActive ? { boxShadow: 'inset 3px 0 0 hsl(var(--primary))' } : {}}>
                      {Ic && <Ic size={14} className={isActive ? 'text-primary' : 'text-muted-foreground/70'} />}
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            ))}
            <div className="h-4" />
          </nav>
        </aside>

        {/* Content area — re-mount on nav change for entry animation */}
        <div key={active} className="flex-1 min-w-0 rise" style={{ animationDelay: '30ms', animationDuration: '0.28s' }}>
          <ActiveComp />
        </div>
      </div>
    </div>
  );
};

window.PageSettings = PageSettings;
