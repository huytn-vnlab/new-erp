/* HRM > Tài sản công ty — asset inventory & borrow requests */

const ASSETS = [
  { id: 'AS-001', name: 'MacBook Pro 14"', category: 'laptop', spec: 'M3 Pro · 18GB · 512GB',  serial: 'C02XHGY7JG5J', status: 'in_use',     user: 'Nguyễn Văn An',     branch: 'Hà Nội',  date: '15/01/2025', value: 64_000_000 },
  { id: 'AS-002', name: 'Dell XPS 15',     category: 'laptop', spec: 'i7-13700H · 32GB · 1TB', serial: 'DL-XPS-2401',  status: 'in_use',     user: 'Trần Thị Mai',      branch: 'Đà Nẵng', date: '08/06/2024', value: 42_500_000 },
  { id: 'AS-003', name: 'MacBook Air M2',  category: 'laptop', spec: 'M2 · 16GB · 512GB',      serial: 'C02-M2A-2024', status: 'available',  user: null,                 branch: 'Hà Nội',  date: '—',          value: 38_000_000 },
  { id: 'AS-004', name: 'Dell U2723QE 27"',category: 'monitor',spec: '4K IPS · USB-C 90W',     serial: 'CN-0J7XY3-2401',status: 'in_use',     user: 'Lê Quang Huy',      branch: 'HCM',     date: '12/03/2025', value: 18_900_000 },
  { id: 'AS-005', name: 'LG 27UP850',      category: 'monitor',spec: '4K · HDR400',            serial: 'LG-27UP-2024',  status: 'available',  user: null,                 branch: 'Hà Nội',  date: '—',          value: 13_500_000 },
  { id: 'AS-006', name: 'Keychron K3 Pro', category: 'keyboard',spec:'Low profile · Brown sw', serial: 'KC-K3P-991',    status: 'in_use',     user: 'Vũ Thị Lan',         branch: 'Hà Nội',  date: '04/02/2025', value: 3_200_000 },
  { id: 'AS-007', name: 'Logitech MX Master 3S', category: 'mouse', spec: 'Wireless · Graphite',serial: 'LO-MX3S-882', status: 'in_use',     user: 'Phạm Thu Hà',       branch: 'Đà Nẵng', date: '17/04/2025', value: 2_690_000 },
  { id: 'AS-008', name: 'Sony WH-1000XM5', category: 'headphone', spec: 'Wireless ANC',         serial: 'SN-XM5-441',   status: 'maintenance',user: null,                 branch: 'Hà Nội',  date: '—',          value: 8_500_000 },
  { id: 'AS-009', name: 'iPhone 15 Pro',   category: 'phone',  spec: '256GB · Test device',     serial: 'IP15P-002',    status: 'in_use',     user: 'Bùi Đức Thành',     branch: 'Osaka',   date: '03/12/2024', value: 28_000_000 },
  { id: 'AS-010', name: 'iPad Air',        category: 'tablet', spec: 'M2 · 256GB · Cellular',   serial: 'IPA-M2-2024',  status: 'available',  user: null,                 branch: 'Hà Nội',  date: '—',          value: 22_500_000 },
  { id: 'AS-011', name: 'Wacom Intuos Pro',category: 'other',  spec: 'Medium · Pen tablet',     serial: 'WC-IP-771',    status: 'in_use',     user: 'Vũ Thị Lan',         branch: 'Hà Nội',  date: '12/01/2025', value: 8_900_000 },
  { id: 'AS-012', name: 'Dell Docking WD22TB4', category: 'other', spec: 'Thunderbolt 4',       serial: 'DL-WD22-660',  status: 'in_use',     user: 'Hoàng Đức Thành',   branch: 'Hà Nội',  date: '20/11/2024', value: 9_800_000 },
];

const CATEGORY_META = {
  laptop:   { label: 'Laptop',      glyph: '⌘',  color: 'hsl(var(--primary-h) var(--primary-s) 55%)' },
  monitor:  { label: 'Màn hình',    glyph: '▭',  color: 'hsl(265 60% 55%)' },
  keyboard: { label: 'Bàn phím',    glyph: '⌨', color: 'hsl(160 55% 45%)' },
  mouse:    { label: 'Chuột',       glyph: '◉',  color: 'hsl(35 90% 50%)' },
  headphone:{ label: 'Tai nghe',    glyph: '○',  color: 'hsl(310 60% 55%)' },
  phone:    { label: 'Điện thoại',  glyph: '▢',  color: 'hsl(15 80% 55%)' },
  tablet:   { label: 'Tablet',      glyph: '▣',  color: 'hsl(195 80% 45%)' },
  other:    { label: 'Khác',        glyph: '◆',  color: 'hsl(220 15% 50%)' },
};

const ASSET_STATUS_META = {
  available:   { label: 'Sẵn sàng',    variant: 'green' },
  in_use:      { label: 'Đang dùng',   variant: 'primary' },
  maintenance: { label: 'Bảo trì',     variant: 'amber' },
  broken:      { label: 'Hỏng',        variant: 'red' },
};

const REQUESTS = [
  { id: 1, asset: 'MacBook Air M2',      user: 'Ngô Thanh Tùng', note: 'Cần laptop dự phòng cho onboarding',   return: '15/06/2026', submitted: '2 giờ trước', status: 'pending' },
  { id: 2, asset: 'iPad Air',            user: 'Đặng Thị Hồng',  note: 'Demo cho khách hàng tuần sau',          return: '30/05/2026', submitted: 'Hôm qua',     status: 'pending' },
  { id: 3, asset: 'LG 27UP850',          user: 'Phan Văn Cường', note: 'Setup workspace mới ở Đà Nẵng',         return: '—',          submitted: '3 ngày trước', status: 'approved' },
  { id: 4, asset: 'Sony WH-1000XM5',     user: 'Lý Quỳnh Anh',   note: 'Tai nghe cũ hỏng',                       return: '—',          submitted: '1 tuần trước', status: 'completed' },
];

const formatVND = (v) => v.toLocaleString('vi-VN') + ' đ';

const AssetCard = ({ a, onView }) => {
  const c = CATEGORY_META[a.category];
  const st = ASSET_STATUS_META[a.status];
  return (
    <button
      onClick={() => onView(a)}
      className="card-surface interactive text-left p-4 flex flex-col gap-3 group"
    >
      <div className="flex items-start gap-3">
        {/* Placeholder "device" tile */}
        <div
          className="h-14 w-14 rounded-lg flex items-center justify-center shrink-0 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${c.color}30, ${c.color}15)`,
            border: `1px solid ${c.color}40`,
          }}
        >
          <span className="text-[28px] font-bold" style={{ color: c.color }}>{c.glyph}</span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">{c.label}</p>
          <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{a.name}</p>
          <p className="text-[11.5px] text-muted-foreground truncate">{a.spec}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11.5px] pt-3 border-t border-border/60">
        <div>
          <p className="text-muted-foreground">Mã tài sản</p>
          <p className="font-mono font-semibold text-foreground">{a.id}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Giá trị</p>
          <p className="font-semibold tabular-nums text-foreground">{formatVND(a.value)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/60">
        <Badge variant={st.variant} dot>{st.label}</Badge>
        {a.user ? (
          <div className="flex items-center gap-1.5 min-w-0">
            <Avatar name={a.user} size={20} />
            <span className="text-[11.5px] truncate text-foreground/85">{a.user}</span>
          </div>
        ) : (
          <span className="text-[11.5px] text-muted-foreground italic">Chưa gán</span>
        )}
      </div>
    </button>
  );
};

const PageAsset = () => {
  const [tab, setTab] = React.useState('all'); // all | mine | requests
  const [view, setView] = React.useState('grid'); // grid | list
  const [search, setSearch] = React.useState('');
  const [cat, setCat] = React.useState('');
  const [statusF, setStatusF] = React.useState('');
  const [openAsset, setOpenAsset] = React.useState(null);
  const [showRequestModal, setShowRequestModal] = React.useState(false);

  const filtered = ASSETS.filter(a => {
    if (search && !a.name.toLowerCase().includes(search.toLowerCase()) && !a.id.toLowerCase().includes(search.toLowerCase())) return false;
    if (cat && a.category !== cat) return false;
    if (statusF && a.status !== statusF) return false;
    if (tab === 'mine' && a.user !== 'Nguyễn Văn An') return false;
    return true;
  });

  const totalValue = ASSETS.reduce((a, x) => a + x.value, 0);
  const inUseCount = ASSETS.filter(a => a.status === 'in_use').length;
  const availableCount = ASSETS.filter(a => a.status === 'available').length;
  const myCount = ASSETS.filter(a => a.user === 'Nguyễn Văn An').length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="HRM · Tài sản"
        title="Tài sản công ty"
        description="Inventory thiết bị: laptop, màn hình, phụ kiện, thiết bị di động. Quản lý tình trạng và phân bổ."
        actions={
          <>
            <Btn variant="outline" icon="FileText">Xuất Excel</Btn>
            <Btn variant="primary" icon="Plus">Thêm tài sản</Btn>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat label="Tổng tài sản" value={ASSETS.length} sublabel="6 chủng loại" accent="primary" delay={40} />
        <MiniStat label="Đang sử dụng" value={inUseCount} sublabel={`${Math.round(inUseCount / ASSETS.length * 100)}% phân bổ`} accent="green" delay={80} />
        <MiniStat label="Sẵn sàng cấp phát" value={availableCount} sublabel="Trong kho" accent="amber" delay={120} />
        <MiniStat label="Tổng giá trị" value={`${(totalValue / 1_000_000).toFixed(1)}M`} sublabel="VND · ước tính sổ sách" accent="violet" delay={160} />
      </div>

      <div className="border-b border-border/70">
        <div className="flex gap-7">
          {[
            { k: 'all', l: 'Tất cả tài sản', n: ASSETS.length },
            { k: 'mine', l: 'Tài sản của tôi', n: myCount },
            { k: 'requests', l: 'Yêu cầu mượn', n: REQUESTS.length },
          ].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} data-active={tab === t.k} className="tab-trigger inline-flex items-center gap-2">
              {t.l}
              <span className={'inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10.5px] font-semibold tabular-nums ' +
                (tab === t.k ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground')}>{t.n}</span>
            </button>
          ))}
        </div>
      </div>

      {tab !== 'requests' && (
        <>
          <FilterBar>
            <FieldInput icon="Search" placeholder="Tìm theo tên hoặc mã…" value={search} onChange={e => setSearch(e.target.value)} width={240} />
            <Select
              value={cat}
              onChange={e => setCat(e.target.value)}
              placeholder="Tất cả chủng loại"
              options={Object.entries(CATEGORY_META).map(([k, v]) => ({ value: k, label: v.label }))}
            />
            <Select
              value={statusF}
              onChange={e => setStatusF(e.target.value)}
              placeholder="Tất cả trạng thái"
              options={Object.entries(ASSET_STATUS_META).map(([k, v]) => ({ value: k, label: v.label }))}
            />
            <div className="flex-1" />
            <Btn variant="outline" size="sm" icon="FileText" onClick={() => setShowRequestModal(true)}>Yêu cầu mượn</Btn>
            <div className="inline-flex rounded-md border border-border bg-muted/30 p-0.5">
              <button
                onClick={() => setView('grid')}
                className={'h-7 px-2.5 rounded-[5px] text-[11.5px] font-semibold ' + (view === 'grid' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
              >Lưới</button>
              <button
                onClick={() => setView('list')}
                className={'h-7 px-2.5 rounded-[5px] text-[11.5px] font-semibold ' + (view === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
              >Bảng</button>
            </div>
          </FilterBar>

          {view === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filtered.map((a, i) => (
                <div key={a.id} className="rise" style={{ animationDelay: `${100 + i * 30}ms` }}>
                  <AssetCard a={a} onView={setOpenAsset} />
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full py-16 text-center text-muted-foreground card-surface">
                  <Icon.Briefcase size={36} className="mx-auto mb-2 opacity-30" />
                  Không có tài sản phù hợp
                </div>
              )}
            </div>
          ) : (
            <div className="card-surface overflow-hidden rise" style={{ animationDelay: '180ms' }}>
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="text-left py-3 px-5">Tài sản</th>
                    <th className="text-left py-3 px-3">Mã</th>
                    <th className="text-left py-3 px-3">Chủng loại</th>
                    <th className="text-left py-3 px-3">Người dùng</th>
                    <th className="text-left py-3 px-3">Chi nhánh</th>
                    <th className="text-right py-3 px-3">Giá trị</th>
                    <th className="text-center py-3 px-3">Trạng thái</th>
                    <th className="text-right py-3 px-5">Ngày cấp</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => {
                    const c = CATEGORY_META[a.category];
                    return (
                      <tr key={a.id} onClick={() => setOpenAsset(a)} className="border-b border-border/60 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors">
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <span className="h-8 w-8 rounded-md flex items-center justify-center text-[16px] font-bold shrink-0" style={{ background: `${c.color}25`, color: c.color }}>{c.glyph}</span>
                            <div>
                              <p className="font-semibold">{a.name}</p>
                              <p className="text-[11.5px] text-muted-foreground">{a.spec}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono text-foreground/85">{a.id}</td>
                        <td className="py-3 px-3 text-foreground/85">{c.label}</td>
                        <td className="py-3 px-3 text-foreground/85">{a.user || <span className="italic text-muted-foreground">Chưa gán</span>}</td>
                        <td className="py-3 px-3 text-foreground/85">{a.branch}</td>
                        <td className="py-3 px-3 text-right font-semibold tabular-nums">{formatVND(a.value)}</td>
                        <td className="py-3 px-3 text-center"><Badge variant={ASSET_STATUS_META[a.status].variant} dot>{ASSET_STATUS_META[a.status].label}</Badge></td>
                        <td className="py-3 px-5 text-right font-mono text-muted-foreground">{a.date}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {tab === 'requests' && (
        <div className="card-surface overflow-hidden rise" style={{ animationDelay: '120ms' }}>
          <div className="px-5 py-3.5 border-b border-border/70 flex items-center justify-between">
            <h3 className="section-title">Yêu cầu mượn tài sản</h3>
            <Btn variant="primary" size="sm" icon="Plus" onClick={() => setShowRequestModal(true)}>Tạo yêu cầu</Btn>
          </div>
          <table className="w-full text-[13px]">
            <thead>
              <tr className="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
                <th className="text-left py-3 px-5">Người yêu cầu</th>
                <th className="text-left py-3 px-3">Tài sản</th>
                <th className="text-left py-3 px-3">Ghi chú</th>
                <th className="text-left py-3 px-3">Ngày trả dự kiến</th>
                <th className="text-left py-3 px-3">Gửi</th>
                <th className="text-center py-3 px-3">Trạng thái</th>
                <th className="text-right py-3 px-5">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {REQUESTS.map(r => (
                <tr key={r.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={r.user} size={28} />
                      <span className="font-semibold">{r.user}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-foreground/85">{r.asset}</td>
                  <td className="py-3 px-3 text-foreground/85 max-w-xs truncate">{r.note}</td>
                  <td className="py-3 px-3 font-mono text-foreground/85">{r.return}</td>
                  <td className="py-3 px-3 text-muted-foreground">{r.submitted}</td>
                  <td className="py-3 px-3 text-center">
                    <Badge
                      variant={r.status === 'pending' ? 'amber' : r.status === 'approved' ? 'sky' : 'gray'}
                      dot
                    >
                      {r.status === 'pending' ? 'Chờ duyệt' : r.status === 'approved' ? 'Đã duyệt' : 'Hoàn tất'}
                    </Badge>
                  </td>
                  <td className="py-3 px-5 text-right">
                    {r.status === 'pending' ? (
                      <div className="inline-flex gap-1.5">
                        <Btn variant="success" size="xs" icon="Check">Duyệt</Btn>
                        <Btn variant="ghost" size="xs">Từ chối</Btn>
                      </div>
                    ) : <Btn variant="ghost" size="xs" icon="External">Chi tiết</Btn>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Asset detail modal */}
      {openAsset && <AssetDetail asset={openAsset} onClose={() => setOpenAsset(null)} />}
      {showRequestModal && <RequestModal onClose={() => setShowRequestModal(false)} />}
    </div>
  );
};

const AssetDetail = ({ asset, onClose }) => {
  const c = CATEGORY_META[asset.category];
  const st = ASSET_STATUS_META[asset.status];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative card-surface w-full max-w-lg rise overflow-hidden">
        <div className="p-5 border-b border-border/70 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="h-12 w-12 rounded-lg flex items-center justify-center text-[24px] font-bold" style={{ background: `${c.color}25`, color: c.color }}>{c.glyph}</span>
            <div>
              <p className="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">{c.label} · <span className="font-mono">{asset.id}</span></p>
              <h3 className="text-[18px] font-bold font-heading">{asset.name}</h3>
              <p className="text-[12.5px] text-muted-foreground">{asset.spec}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted text-muted-foreground"><Icon.X size={16} /></button>
        </div>
        <div className="p-5 grid grid-cols-2 gap-x-5 gap-y-4 text-[13px]">
          <div>
            <p className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">Serial number</p>
            <p className="font-mono mt-0.5">{asset.serial}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">Giá trị</p>
            <p className="font-bold tabular-nums mt-0.5">{formatVND(asset.value)}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">Người dùng</p>
            <p className="mt-0.5">{asset.user || <span className="italic text-muted-foreground">Chưa gán</span>}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">Chi nhánh</p>
            <p className="mt-0.5">{asset.branch}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">Ngày cấp</p>
            <p className="font-mono mt-0.5">{asset.date}</p>
          </div>
          <div>
            <p className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider">Trạng thái</p>
            <div className="mt-0.5"><Badge variant={st.variant} dot>{st.label}</Badge></div>
          </div>
        </div>
        <div className="px-5 py-3 border-t border-border/70 flex items-center justify-end gap-2">
          <Btn variant="ghost" size="sm" onClick={onClose}>Đóng</Btn>
          <Btn variant="outline" size="sm" icon="FileText">Xem lịch sử</Btn>
          <Btn variant="primary" size="sm" icon="FileText">Chỉnh sửa</Btn>
        </div>
      </div>
    </div>
  );
};

const RequestModal = ({ onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
    <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
    <div className="relative card-surface w-full max-w-md rise overflow-hidden">
      <div className="p-5 border-b border-border/70 flex items-center justify-between">
        <h3 className="text-[16px] font-bold font-heading">Yêu cầu mượn tài sản</h3>
        <button onClick={onClose} className="p-2 rounded-md hover:bg-muted text-muted-foreground"><Icon.X size={16} /></button>
      </div>
      <div className="p-5 space-y-4 text-[13px]">
        <div>
          <label className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider mb-1.5 block">Chọn tài sản</label>
          <Select value="" placeholder="-- Chọn --" options={ASSETS.filter(a => a.status === 'available').map(a => ({ value: a.id, label: `${a.name} (${a.id})` }))} onChange={() => {}} width="100%" />
        </div>
        <div>
          <label className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider mb-1.5 block">Ngày trả dự kiến</label>
          <input type="date" defaultValue="2026-06-15" className="w-full h-9 px-3 rounded-md border border-border bg-muted/30 text-[13px] outline-none focus:border-primary/60" />
        </div>
        <div>
          <label className="text-[11px] uppercase font-semibold text-muted-foreground tracking-wider mb-1.5 block">Lý do mượn</label>
          <textarea placeholder="Ví dụ: Cần laptop dự phòng cho dự án ABC…" className="w-full h-20 px-3 py-2 rounded-md border border-border bg-muted/30 text-[13px] outline-none focus:border-primary/60 resize-none" />
        </div>
      </div>
      <div className="px-5 py-3 border-t border-border/70 flex items-center justify-end gap-2">
        <Btn variant="ghost" size="sm" onClick={onClose}>Huỷ</Btn>
        <Btn variant="primary" size="sm" icon="Check">Gửi yêu cầu</Btn>
      </div>
    </div>
  </div>
);

window.PageAsset = PageAsset;
