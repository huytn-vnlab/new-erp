/* HRM > Hợp đồng lao động — 3 tabs: list · create · contract types */

// ── Data ──────────────────────────────────────────────────────────

const CONTRACTS = [
  { id:1,  user:'Nguyễn Tấn Nam',     branch:'Đà Nẵng', start:'2023-06-01', end:null,         joined:'2019-05-01', type:'HĐ lao động chính thức (Không XĐ thời hạn) 202210' },
  { id:2,  user:'[Temp]Đặng Xuân Ấn', branch:'Hà Nội',  start:'2023-05-06', end:'2024-05-05', joined:'2023-03-06', type:'HĐ lao động chính thức (XĐ thời hạn)_202209' },
  { id:3,  user:'Nguyễn Đăng Thông',  branch:'Đà Nẵng', start:'2023-04-21', end:'2026-04-20', joined:'2022-01-17', type:'Phụ lục hợp đồng 2022' },
  { id:4,  user:'Nguyễn Mạnh Hoan',   branch:'Đà Nẵng', start:'2023-04-21', end:'2026-04-20', joined:'2021-11-01', type:'Phụ lục hợp đồng 2022' },
  { id:5,  user:'Trịnh Ngọc Tuấn',    branch:'Đà Nẵng', start:'2023-04-21', end:'2026-04-20', joined:'2021-08-30', type:'Phụ lục hợp đồng 2022' },
  { id:6,  user:'Nguyễn Tấn Nam',     branch:'Đà Nẵng', start:'2023-04-21', end:'2026-04-20', joined:'2019-05-01', type:'Phụ lục hợp đồng 2022' },
  { id:7,  user:'Đặng Đình Nhân',     branch:'Đà Nẵng', start:'2023-04-21', end:'2026-04-20', joined:'2020-03-02', type:'Phụ lục hợp đồng 2022' },
  { id:8,  user:'Vũ Thị Bích Diệp',   branch:'Hà Nội',  start:'2023-04-21', end:'2024-04-20', joined:'2022-09-05', type:'Phụ lục hợp đồng 2022' },
  { id:9,  user:'Nguyễn Thị Kim Ngân',branch:'Hà Nội',  start:'2023-04-21', end:'2024-04-20', joined:'2022-07-01', type:'Phụ lục hợp đồng 2022' },
  { id:10, user:'Hoàng Thị Thu',      branch:'Hà Nội',  start:'2023-04-21', end:'2026-04-20', joined:'2021-10-18', type:'Phụ lục hợp đồng 2022' },
  { id:11, user:'Lê Minh Long',       branch:'Hà Nội',  start:'2023-04-21', end:'2026-04-20', joined:'2018-06-01', type:'Phụ lục hợp đồng 2022' },
  { id:12, user:'Nguyễn Đăng Thông',  branch:'Đà Nẵng', start:'2023-03-17', end:'2026-03-16', joined:'2022-01-17', type:'HĐ lao động chính thức (XĐ thời hạn)_202209' },
  { id:13, user:'[Temp]Đặng Xuân Ấn', branch:'Hà Nội',  start:'2023-03-06', end:null,         joined:'2023-03-06', type:'HĐ Bảo mật thông tin 2022' },
  { id:14, user:'[Temp]Đặng Xuân Ấn', branch:'Hà Nội',  start:'2023-03-06', end:'2023-05-05', joined:'2023-03-06', type:'Bản cam kết 2022' },
];

const CONTRACT_TYPES = [
  { id:1,  name:'Phụ lục hợp đồng 2022',                         file:'Phụ_lục_hợp_đồng_2022__1683536646065.docx',            created:'2023/05/08', updated:'2023/05/08' },
  { id:2,  name:'Bản cam kết 2022',                              file:'Bản_cam_kết_2022_1668409037.docx',                     created:'2022/07/08', updated:'2022/11/14' },
  { id:3,  name:'HĐ lao động chính thức (Không XĐ thời hạn) 202210', file:'HĐ_lao_động_chính_thức_(Không_XĐ_thời_hạn)__1666612740300.docx', created:'2022/10/24', updated:'2022/10/24' },
  { id:4,  name:'HĐ lao động chính thức (XĐ thời hạn)_202209',   file:'HĐ_lao_động_chính_thức_(XĐ_thời_hạn)__202209_1664249121221.docx', created:'2022/09/27', updated:'2022/09/27' },
  { id:5,  name:'HĐ Bảo mật thông tin 2022',                     file:'HĐ_Bảo_mật_thông_tin_2022_1664249121221.docx',          created:'2022/09/27', updated:'2022/09/27' },
  { id:6,  name:'HĐ thử việc 2022/09',                           file:'HĐ_thử_việc_2022_09__1664249024942.docx',               created:'2022/09/27', updated:'2022/09/27' },
  { id:7,  name:'Thỏa thuận thôi việc',                          file:'THỏa_Thuận_thôi_việc__1634108747644.docx',              created:'2021/10/13', updated:'2022/07/05' },
  { id:8,  name:'HĐ học việc 2022',                              file:'HĐ_học_việc_2022_1655952897097.docx',                   created:'2022/06/23', updated:'2022/06/23' },
  { id:9,  name:'Thông báo thu nhập 2022',                       file:'Thông_báo_thu_nhập_2022_1655952809176.docx',            created:'2022/06/23', updated:'2022/06/23' },
  { id:10, name:'Đăng ký thực tập 2022',                         file:'Đăng_ký_thực_tập_2022_1655952800384.docx',              created:'2022/06/23', updated:'2022/06/23' },
  { id:11, name:'Hợp đồng lao động chính thức',                  file:'Hợp_đồng_lao_động_chính_thức_1643017757.docx',          created:'2022/01/24', updated:'2022/01/24' },
  { id:12, name:'Thông báo thu nhập chính thức',                 file:'Thông_báo_thu_nhập_chính_thức_1643017608.docx',         created:'2022/01/24', updated:'2022/01/24' },
  { id:13, name:'HĐ thử việc',                                   file:'HĐ_thử_việc__1634865691991.docx',                       created:'2021/10/22', updated:'2021/10/22' },
];

const ALL_EMPLOYEES = [
  'Nguyễn Tấn Nam', 'Đặng Xuân Ấn', 'Nguyễn Đăng Thông', 'Nguyễn Mạnh Hoan', 'Trịnh Ngọc Tuấn',
  'Đặng Đình Nhân', 'Vũ Thị Bích Diệp', 'Nguyễn Thị Kim Ngân', 'Hoàng Thị Thu', 'Lê Minh Long',
  'Trần Cao Quý', 'Tiến Lê Đức', 'Đỗ Thị Hương Lan',
];
const CONTRACT_BRANCHES = ['Hà Nội', 'Đà Nẵng', 'Hồ Chí Minh', 'Osaka'];
const CONTRACT_DURATIONS = ['Không xác định thời hạn', '1 năm', '2 năm', '3 năm', 'Thử việc 2 tháng'];

// ── Shared field primitives ───────────────────────────────────────

const CLabel = ({ children, req }) => (
  <label className="block text-[12px] font-medium text-foreground/80 mb-1.5">
    {children}{req && <span className="text-red-400 ml-0.5">*</span>}
  </label>
);
const cInput = 'w-full h-9 px-3 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 placeholder:text-muted-foreground/45';
const cInputErr = 'w-full h-9 px-3 rounded-lg border bg-card text-[13px] text-foreground outline-none placeholder:text-muted-foreground/45';

const CSelect = ({ value, onChange, options, placeholder, error }) => (
  <div className="relative" style={error ? { boxShadow: '0 0 0 1.5px rgb(248 113 113)', borderRadius: 8 } : {}}>
    <Select value={value ?? ''} onChange={onChange}
      options={placeholder ? [{ value: '', label: placeholder }, ...options] : options}
      width="100%" placeholder={null} />
  </div>
);

// ── Tab 1: Contract list ──────────────────────────────────────────

const ContractListTab = ({ onView }) => {
  const [search, setSearch] = React.useState('');
  const [branch, setBranch] = React.useState('');
  const [type, setType] = React.useState('');

  const filtered = CONTRACTS.filter(c => {
    if (search && !c.user.toLowerCase().includes(search.toLowerCase())) return false;
    if (branch && c.branch !== branch) return false;
    if (type && c.type !== type) return false;
    return true;
  });

  const uniqueTypes = Array.from(new Set(CONTRACTS.map(c => c.type)));

  return (
    <div className="space-y-4 rise" style={{ animationDuration: '0.28s' }}>
      <FilterBar>
        <FieldInput icon="Search" placeholder="Tìm kiếm tên…" value={search} onChange={e => setSearch(e.target.value)} width={240} />
        <Select value={branch} onChange={e => setBranch(e.target.value)} placeholder="Lọc chi nhánh" width={170}
          options={CONTRACT_BRANCHES.map(b => ({ value: b, label: b }))} />
        <Select value={type} onChange={e => setType(e.target.value)} placeholder="Lọc theo loại hợp đồng" width={240}
          options={uniqueTypes.map(t => ({ value: t, label: t }))} />
        <div className="flex-1" />
        <span className="text-[12px] text-muted-foreground">{filtered.length} hợp đồng</span>
      </FilterBar>

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
                <th className="text-left py-3 px-5">Tên</th>
                <th className="text-left py-3 px-3">Chi nhánh</th>
                <th className="text-left py-3 px-3">Hiệu lực từ ngày</th>
                <th className="text-left py-3 px-3">Ngày hết thời hạn</th>
                <th className="text-left py-3 px-3">Ngày vào công ty</th>
                <th className="text-left py-3 px-3">Loại hợp đồng hiện tại</th>
                <th className="text-center py-3 px-5">Truy cập</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} onClick={() => onView(c)} className="border-b border-border/40 last:border-0 hover:bg-muted/20 cursor-pointer transition-colors">
                  <td className="py-2.5 px-5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={c.user.replace(/^\[Temp\]/, '')} size={28} />
                      <span className="font-medium text-foreground">{c.user}</span>
                    </div>
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground">{c.branch}</td>
                  <td className="py-2.5 px-3 font-mono text-[12px] text-foreground/80">{c.start}</td>
                  <td className="py-2.5 px-3 font-mono text-[12px] text-foreground/80">{c.end || <span className="text-muted-foreground/50">—</span>}</td>
                  <td className="py-2.5 px-3 font-mono text-[12px] text-foreground/80">{c.joined}</td>
                  <td className="py-2.5 px-3">
                    <span className="text-primary font-medium">{c.type}</span>
                  </td>
                  <td className="py-2.5 px-5">
                    <div className="flex justify-center">
                      <button onClick={e => { e.stopPropagation(); onView(c); }}
                        className="h-7 w-7 rounded-md flex items-center justify-center text-primary hover:bg-primary/10 transition-colors" title="Xem chi tiết">
                        <Icon.LogIn size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="7" className="py-14 text-center text-muted-foreground">
                  <Icon.FileText size={34} className="mx-auto mb-2 opacity-30" />
                  Không tìm thấy hợp đồng phù hợp
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── Tab 2: Create contract form ───────────────────────────────────

const ContractCreateTab = ({ onCreated }) => {
  const [f, setF] = React.useState({
    type: '', name: '', phone: '', birthday: '', nationality: '', position: '',
    address: '', permanent: '', origin: '', taxCode: '',
    identity: '', idDate: '', idPlace: '', dept: '', workplace: '',
    contractNo: '', createdDate: '', insSalary: '', insUnit: 'VND',
    allowance: '', allowUnit: 'VND', totalSalary: '', totalUnit: 'VND',
    duration: '', startDate: '', endDate: '',
  });
  const [nameQ, setNameQ] = React.useState('');
  const [errs, setErrs] = React.useState({});
  const upd = k => e => { setF(p => ({ ...p, [k]: e.target.value })); setErrs(p => ({ ...p, [k]: 0 })); };

  const nameResults = ALL_EMPLOYEES.filter(n => n.toLowerCase().includes(nameQ.toLowerCase()));

  const validate = () => {
    const e = {};
    ['type', 'name', 'contractNo', 'createdDate', 'startDate'].forEach(k => { if (!String(f[k]).trim()) e[k] = 1; });
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const create = () => { if (validate()) onCreated(f.name || 'nhân viên'); };

  const moneyUnit = (val, onUnit) => (
    <div className="relative w-[88px] shrink-0">
      <select value={val} onChange={onUnit}
        className="appearance-none w-full h-9 pl-3 pr-7 rounded-lg border border-border bg-card text-[13px] text-foreground outline-none focus:border-primary/60 cursor-pointer">
        <option>VND</option><option>USD</option><option>JPY</option>
      </select>
      <Icon.ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
    </div>
  );

  return (
    <div className="card-surface p-6 rise" style={{ animationDuration: '0.28s' }}>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">

        {/* ───── Left column: employee info ───── */}
        <div className="space-y-5">
          <div>
            <CLabel req>Loại hợp đồng lao động</CLabel>
            <CSelect value={f.type} onChange={upd('type')} error={errs.type} placeholder="— Chọn loại hợp đồng —"
              options={CONTRACT_TYPES.map(t => ({ value: t.name, label: t.name }))} />
          </div>

          {/* Employee search */}
          <div>
            <CLabel req>Tên người lao động</CLabel>
            <div className="relative">
              <Icon.Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <input
                value={f.name || nameQ}
                onChange={e => { setNameQ(e.target.value); setF(p => ({ ...p, name: '' })); setErrs(p => ({ ...p, name: 0 })); }}
                placeholder="Tìm kiếm…"
                style={errs.name ? { borderColor: 'rgb(248 113 113)' } : undefined}
                className={'w-full h-9 pl-8 pr-3 rounded-lg border bg-card text-[13px] text-foreground outline-none placeholder:text-muted-foreground/45 ' + (errs.name ? '' : 'border-border focus:border-primary/60')} />
              {nameQ && !f.name && (
                <div className="absolute z-20 left-0 right-0 mt-1 card-surface border border-border shadow-popover rounded-xl overflow-hidden max-h-52 overflow-y-auto scrollbar-thin">
                  {nameResults.length === 0
                    ? <p className="px-3 py-2.5 text-[12.5px] text-muted-foreground">Không tìm thấy</p>
                    : nameResults.map(n => (
                      <button key={n} onClick={() => { setF(p => ({ ...p, name: n })); setNameQ(''); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-muted/40 transition-colors text-left">
                        <Avatar name={n} size={24} /><span className="text-[13px] text-foreground">{n}</span>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div><CLabel>Số điện thoại</CLabel><input value={f.phone} onChange={upd('phone')} className={cInput} /></div>
          <div><CLabel>Sinh nhật</CLabel><input type="date" value={f.birthday} onChange={upd('birthday')} className={cInput} /></div>
          <div><CLabel>Quốc tịch</CLabel><input value={f.nationality} onChange={upd('nationality')} placeholder="Việt Nam" className={cInput} /></div>
          <div><CLabel>Chức danh/Vị trí công việc</CLabel><input value={f.position} onChange={upd('position')} className={cInput} /></div>
          <div><CLabel>Địa chỉ hiện tại</CLabel><input value={f.address} onChange={upd('address')} className={cInput} /></div>
          <div><CLabel>Hộ khẩu thường trú</CLabel><input value={f.permanent} onChange={upd('permanent')} className={cInput} /></div>
          <div><CLabel>Nguyên quán</CLabel><input value={f.origin} onChange={upd('origin')} className={cInput} /></div>
          <div><CLabel>Mã số thuế</CLabel><input value={f.taxCode} onChange={upd('taxCode')} className={cInput} /></div>
        </div>

        {/* ───── Right column: contract details ───── */}
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><CLabel>Số CMND/CCCD</CLabel><input value={f.identity} onChange={upd('identity')} className={cInput} /></div>
            <div><CLabel>Ngày cấp</CLabel><input type="date" value={f.idDate} onChange={upd('idDate')} className={cInput} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><CLabel>Nơi cấp giấy tờ</CLabel><input value={f.idPlace} onChange={upd('idPlace')} className={cInput} /></div>
            <div><CLabel>Phòng ban</CLabel><input value={f.dept} onChange={upd('dept')} className={cInput} /></div>
          </div>
          <div><CLabel>Địa điểm làm việc</CLabel><input value={f.workplace} onChange={upd('workplace')} className={cInput} /></div>

          <div>
            <CLabel req>Số hợp đồng lao động</CLabel>
            <input value={f.contractNo} onChange={upd('contractNo')}
              style={errs.contractNo ? { borderColor: 'rgb(248 113 113)' } : undefined}
              className={errs.contractNo ? cInputErr : cInput} />
          </div>

          <div>
            <CLabel req>Ngày / tháng / năm tạo hợp đồng</CLabel>
            <input type="date" value={f.createdDate} onChange={upd('createdDate')}
              style={errs.createdDate ? { borderColor: 'rgb(248 113 113)' } : undefined}
              className={errs.createdDate ? cInputErr : cInput} />
          </div>

          {/* Salary rows with unit */}
          <div>
            <div className="flex items-end justify-between gap-3 mb-1.5">
              <span className="text-[12px] font-medium text-foreground/80">Lương bảo hiểm</span>
              <span className="text-[11px] text-muted-foreground w-[88px] shrink-0">Đơn vị</span>
            </div>
            <div className="flex gap-2">
              <input type="text" inputMode="numeric" value={f.insSalary} onChange={upd('insSalary')} className={cInput + ' font-mono'} />
              {moneyUnit(f.insUnit, upd('insUnit'))}
            </div>
          </div>
          <div>
            <div className="flex items-end justify-between gap-3 mb-1.5">
              <span className="text-[12px] font-medium text-foreground/80">Phụ cấp (nếu có)</span>
              <span className="text-[11px] text-muted-foreground w-[88px] shrink-0">Đơn vị</span>
            </div>
            <div className="flex gap-2">
              <input type="text" inputMode="numeric" value={f.allowance} onChange={upd('allowance')} className={cInput + ' font-mono'} />
              {moneyUnit(f.allowUnit, upd('allowUnit'))}
            </div>
          </div>
          <div>
            <div className="flex items-end justify-between gap-3 mb-1.5">
              <span className="text-[12px] font-medium text-foreground/80">Lương tổng</span>
              <span className="text-[11px] text-muted-foreground w-[88px] shrink-0">Đơn vị</span>
            </div>
            <div className="flex gap-2">
              <input type="text" inputMode="numeric" value={f.totalSalary} onChange={upd('totalSalary')} className={cInput + ' font-mono'} />
              {moneyUnit(f.totalUnit, upd('totalUnit'))}
            </div>
          </div>

          <div>
            <CLabel>Thời hạn hợp đồng</CLabel>
            <CSelect value={f.duration} onChange={upd('duration')} placeholder="— Chọn thời hạn —"
              options={CONTRACT_DURATIONS.map(d => ({ value: d, label: d }))} />
          </div>
          <div>
            <CLabel req>Ngày bắt đầu hợp đồng</CLabel>
            <input type="date" value={f.startDate} onChange={upd('startDate')}
              style={errs.startDate ? { borderColor: 'rgb(248 113 113)' } : undefined}
              className={errs.startDate ? cInputErr : cInput} />
          </div>
          <div><CLabel>Ngày kết thúc hợp đồng</CLabel><input type="date" value={f.endDate} onChange={upd('endDate')} className={cInput} /></div>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-7 pt-5 border-t border-border/60">
        <Btn variant="outline" size="sm" icon="FileText">Xem trước</Btn>
        <Btn variant="primary" size="sm" icon="Plus" onClick={create}>Tạo</Btn>
      </div>
    </div>
  );
};

// ── Tab 3: Contract types (templates) ─────────────────────────────

const ContractTypesTab = ({ notify }) => {
  const [rows, setRows] = React.useState(CONTRACT_TYPES);
  const [search, setSearch] = React.useState('');
  const [selected, setSelected] = React.useState([]);

  const filtered = rows.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()));
  const allChecked = filtered.length > 0 && filtered.every(r => selected.includes(r.id));
  const toggleAll = () => setSelected(allChecked ? [] : filtered.map(r => r.id));
  const toggle = id => setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const deleteSelected = () => {
    if (selected.length === 0) return;
    setRows(rs => rs.filter(r => !selected.includes(r.id)));
    notify(`Đã xóa ${selected.length} loại hợp đồng.`);
    setSelected([]);
  };
  const upload = () => {
    const id = Date.now();
    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '/');
    setRows(rs => [{ id, name: 'Mẫu hợp đồng mới', file: `mau_hop_dong_moi_${id}.docx`, created: today, updated: today }, ...rs]);
    notify('Đã tải lên loại hợp đồng mới.');
  };

  return (
    <div className="space-y-4 rise" style={{ animationDuration: '0.28s' }}>
      <FilterBar>
        <FieldInput icon="Search" placeholder="Tìm kiếm…" value={search} onChange={e => setSearch(e.target.value)} width={260} />
      </FilterBar>

      <div className="flex items-center gap-2">
        <Btn variant="success" size="sm" icon="Upload" onClick={upload}>Tải lên loại hợp đồng</Btn>
        <Btn variant={selected.length ? 'danger' : 'outline'} size="sm" icon="Trash" onClick={deleteSelected}>
          Xóa loại hợp đồng đã chọn{selected.length ? ` (${selected.length})` : ''}
        </Btn>
      </div>

      <div className="card-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
                <th className="text-left py-3 px-5">Tên</th>
                <th className="text-left py-3 px-3">Tên file</th>
                <th className="text-left py-3 px-3">Ngày tạo</th>
                <th className="text-left py-3 px-3">Ngày cập nhật</th>
                <th className="text-center py-3 px-3">Chi tiết</th>
                <th className="text-center py-3 px-5 w-12">
                  <input type="checkbox" checked={allChecked} onChange={toggleAll} className="h-3.5 w-3.5 rounded accent-primary cursor-pointer" />
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id} className={'border-b border-border/40 last:border-0 transition-colors ' + (selected.includes(r.id) ? 'bg-primary/5' : 'hover:bg-muted/20')}>
                  <td className="py-2.5 px-5"><span className="font-medium text-primary">{r.name}</span></td>
                  <td className="py-2.5 px-3 font-mono text-[11.5px] text-muted-foreground max-w-[260px] truncate" title={r.file}>{r.file}</td>
                  <td className="py-2.5 px-3 font-mono text-[12px] text-foreground/80">{r.created}</td>
                  <td className="py-2.5 px-3 font-mono text-[12px] text-foreground/80">{r.updated}</td>
                  <td className="py-2.5 px-3">
                    <div className="flex justify-center">
                      <button className="h-7 w-7 rounded-full flex items-center justify-center text-white transition-transform hover:scale-105"
                        style={{ background: 'linear-gradient(135deg,hsl(var(--primary-h) var(--primary-s) 60%),hsl(var(--primary-h) var(--primary-s) 45%))' }} title="Xem chi tiết">
                        <Icon.Search size={13} />
                      </button>
                    </div>
                  </td>
                  <td className="py-2.5 px-5">
                    <div className="flex justify-center">
                      <input type="checkbox" checked={selected.includes(r.id)} onChange={() => toggle(r.id)} className="h-3.5 w-3.5 rounded accent-primary cursor-pointer" />
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="6" className="py-14 text-center text-muted-foreground">
                  <Icon.FileText size={34} className="mx-auto mb-2 opacity-30" />
                  Không có loại hợp đồng phù hợp
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// ── Contract detail profiles (full page view) ─────────────────────

const CONTRACT_PROFILES = {
  'Nguyễn Tấn Nam': {
    role: 'Engineer', empId: '2996', rank: '0', status: 'None',
    email: 'namnt@yopmail.com', phone: '0865041628', birthday: '1996/05/15',
    permanent: 'thị trấn Vĩnh Điện, huyện Điện Bàn, tỉnh Quảng Nam - Quảng Nam',
    current: '105/12 Nguyễn Tri Phương, Phường Thạc Gián, Quận Thanh Khê, Đà Nẵng, Việt Nam',
    identity: '048096000460', idType: '048096000460', idDate: '06/11/2013',
    taxCode: '8511624796', branch: 'Đà Nẵng', joined: '05/01/2019',
    contracts: [
      { title: 'HĐ lao động chính thức (Không XĐ thời hạn) 202210', no: 'HĐLĐ-202210-2996', start: '2023-06-01', end: null, salary: '45.000.000', insSalary: '20.000.000', allowance: '3.000.000', duration: 'Không xác định thời hạn', workplace: 'VNLab Đà Nẵng', position: 'Engineer' },
      { title: 'Phụ lục hợp đồng 2022', no: 'PLHĐ-2022-2996', start: '2023-04-21', end: '2026-04-20', salary: '40.000.000', insSalary: '18.000.000', allowance: '2.500.000', duration: '3 năm', workplace: 'VNLab Đà Nẵng', position: 'Engineer' },
    ],
  },
};

const buildProfile = (c) => {
  const base = CONTRACT_PROFILES[c.user];
  if (base) return { ...base, name: c.user };
  return {
    name: c.user, role: 'Nhân viên', empId: String(c.id).padStart(4, '0'), rank: '0', status: 'None',
    email: c.user.replace(/^\[Temp\]/, '').toLowerCase().replace(/\s+/g, '') + '@yopmail.com',
    phone: '—', birthday: '—', permanent: '—', current: '—', identity: '—', idType: '—', idDate: '—',
    taxCode: '—', branch: c.branch, joined: c.joined,
    contracts: [{ title: c.type, no: 'HĐ-' + c.id, start: c.start, end: c.end, salary: '—', insSalary: '—', allowance: '—', duration: c.end ? 'Xác định thời hạn' : 'Không xác định thời hạn', workplace: c.branch, position: 'Nhân viên' }],
  };
};

const DetailField = ({ label, value, className = '' }) => (
  <div className={className}>
    <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
    <p className="text-[13.5px] font-medium text-foreground" style={{ color: 'hsl(var(--primary-h) 55% 38%)' }}>{value || '—'}</p>
  </div>
);

const ContractAccordion = ({ item, defaultOpen }) => {
  const [open, setOpen] = React.useState(defaultOpen);
  return (
    <div className="card-surface overflow-hidden">
      <button onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors text-left">
        <span className="font-medium text-foreground text-[14px]">{item.title}</span>
        <Icon.ChevronDown size={16} className={'text-muted-foreground transition-transform duration-200 shrink-0 ' + (open ? 'rotate-180' : '')} />
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-border/50 rise" style={{ animationDuration: '0.2s' }}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4 mt-4">
            <DetailField label="Số hợp đồng" value={item.no} />
            <DetailField label="Thời hạn hợp đồng" value={item.duration} />
            <DetailField label="Hiệu lực từ ngày" value={item.start} />
            <DetailField label="Ngày hết thời hạn" value={item.end || 'Không xác định'} />
            <DetailField label="Chức danh / Vị trí" value={item.position} />
            <DetailField label="Địa điểm làm việc" value={item.workplace} />
            <DetailField label="Lương bảo hiểm" value={item.insSalary !== '—' ? item.insSalary + ' đ' : '—'} />
            <DetailField label="Phụ cấp" value={item.allowance !== '—' ? item.allowance + ' đ' : '—'} />
            <DetailField label="Lương tổng" value={item.salary !== '—' ? item.salary + ' đ' : '—'} />
          </div>
          <div className="flex items-center gap-2 mt-5 pt-4 border-t border-border/50">
            <Btn variant="outline" size="xs" icon="FileText">Tải file hợp đồng</Btn>
            <Btn variant="primary" size="xs" icon="FileText">Gia hạn / Chỉnh sửa</Btn>
          </div>
        </div>
      )}
    </div>
  );
};

const ContractDetailPage = ({ c, onBack }) => {
  const p = buildProfile(c);
  return (
    <div className="space-y-5 rise" style={{ animationDuration: '0.28s' }}>
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2.5 group">
        <span className="h-8 w-8 rounded-full border border-border flex items-center justify-center text-foreground group-hover:bg-muted group-hover:-translate-x-0.5 transition-all">
          <Icon.ChevronRight size={15} className="rotate-180" />
        </span>
        <span className="font-heading font-bold text-[16px] text-foreground">Quay lại quản lý hợp đồng</span>
      </button>

      {/* Info card */}
      <div className="card-surface overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Avatar block */}
          <div className="md:w-[220px] shrink-0 p-6 flex flex-col items-center text-center md:border-r border-b md:border-b-0 border-border/60">
            <Avatar name={p.name.replace(/^\[Temp\]/, '')} size={84} />
            <p className="font-semibold text-[16px] text-foreground mt-3">{p.name}</p>
            <p className="text-[12.5px] text-muted-foreground mt-0.5">{p.role}</p>
            <p className="text-[12px] text-muted-foreground/70 mt-0.5">ID: {p.empId}</p>
            <span className="mt-2.5 inline-flex items-center px-3 py-1 rounded-md text-[11.5px] font-medium text-white"
              style={{ background: 'linear-gradient(135deg,hsl(var(--primary-h) var(--primary-s) 60%),hsl(var(--primary-h) var(--primary-s) 46%))' }}>
              {p.status}
            </span>
          </div>

          {/* Info grid */}
          <div className="flex-1 min-w-0">
            {/* Contact row */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-5 border-b border-border/60">
              <DetailField label="Địa chỉ email" value={p.email} />
              <DetailField label="Hộ khẩu thường trú" value={p.permanent} className="lg:col-span-2" />
              <DetailField label="Ngày sinh" value={p.birthday} />
              <DetailField label="Số điện thoại" value={p.phone} />
              <DetailField label="Địa chỉ hiện tại" value={p.current} className="md:col-span-2 lg:col-span-3" />
            </div>
            {/* ID papers row */}
            <div className="p-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-x-5 gap-y-5">
              <DetailField label="Số CMND/CCCD" value={p.identity} />
              <DetailField label="Loại giấy tờ" value={p.idType} />
              <DetailField label="Ngày cấp" value={p.idDate} />
              <DetailField label="Mã số thuế" value={p.taxCode} />
              <DetailField label="Chi nhánh" value={p.branch} />
              <DetailField label="Ngày vào công ty" value={p.joined} />
              <DetailField label="Hạng" value={p.rank} />
            </div>
          </div>
        </div>
      </div>

      {/* Contract accordions */}
      <div className="space-y-3">
        {p.contracts.map((ct, i) => (
          <ContractAccordion key={i} item={ct} defaultOpen={i === 0} />
        ))}
      </div>
    </div>
  );
};

// ── Page root ─────────────────────────────────────────────────────

const PageContract = () => {
  const [tab, setTab] = React.useState('list');
  const [detailContract, setDetailContract] = React.useState(null);
  const [toast, setToast] = React.useState('');
  const notify = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const TABS = [
    { k: 'list',   l: 'Hợp đồng lao động' },
    { k: 'create', l: 'Thêm hợp đồng lao động' },
    { k: 'types',  l: 'Loại hợp đồng lao động' },
  ];

  // Detail page replaces the whole view
  if (detailContract) {
    return (
      <div className="space-y-6">
        <PageHeader eyebrow="HRM · Hợp đồng" title="Chi tiết hợp đồng" />
        <ContractDetailPage c={detailContract} onBack={() => setDetailContract(null)} />
        {toast && (
          <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium text-white shadow-popover rise"
            style={{ background: 'hsl(160 60% 40%)', animationDuration: '0.2s' }}>
            <Icon.Check size={13} /> {toast}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="HRM · Hợp đồng"
        title="Hợp đồng lao động"
        description="Quản lý hợp đồng lao động, tạo hợp đồng mới và danh mục mẫu hợp đồng của tổ chức."
      />

      {/* Segmented tab control (matches old SPA buttons) */}
      <div className="flex items-center gap-2 flex-wrap">
        {TABS.map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={'h-9 px-4 rounded-lg text-[13px] font-semibold transition-all ' +
              (tab === t.k ? 'text-white shadow-card' : 'border border-border text-foreground/70 hover:text-foreground hover:border-primary/40')}
            style={tab === t.k ? { background: 'linear-gradient(135deg,hsl(var(--primary-h) var(--primary-s) 60%),hsl(var(--primary-h) var(--primary-s) 44%))' } : {}}>
            {t.l}
          </button>
        ))}
      </div>

      <div key={tab}>
        {tab === 'list'   && <ContractListTab onView={setDetailContract} />}
        {tab === 'create' && <ContractCreateTab onCreated={(name) => { notify('Đã tạo hợp đồng cho ' + name + '.'); setTab('list'); }} />}
        {tab === 'types'  && <ContractTypesTab notify={notify} />}
      </div>

      {toast && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] font-medium text-white shadow-popover rise"
          style={{ background: 'hsl(160 60% 40%)', animationDuration: '0.2s' }}>
          <Icon.Check size={13} /> {toast}
        </div>
      )}
    </div>
  );
};

window.PageContract = PageContract;
