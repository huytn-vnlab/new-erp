/* Tuyển dụng — job posting management + applicant detail */

const JOBS = [
  { id:1,  title:'Senior Frontend Engineer',    branch:'Hà Nội',  dept:'Engineering',   count:3,  applied:12, interviewed:4, offered:1, status:'open',     start:'01/05/2026', end:'31/05/2026', jp:'N3', salary:'40-55M', owner:'Hoàng Đức Thành', desc:'Tuyển kỹ sư Frontend giàu kinh nghiệm Vue.js/React. Có kinh nghiệm làm việc với team Nhật là lợi thế.' },
  { id:2,  title:'BrSE (Bridge SE)',             branch:'Hà Nội',  dept:'Engineering',   count:2,  applied:8,  interviewed:3, offered:0, status:'open',     start:'15/04/2026', end:'15/06/2026', jp:'N2', salary:'55-75M', owner:'Lê Quang Huy',    desc:'Cầu nối kỹ thuật giữa team Việt Nam và khách hàng Nhật Bản. Yêu cầu JLPT N2 hoặc tương đương.' },
  { id:3,  title:'DevOps Engineer',              branch:'Đà Nẵng', dept:'Infrastructure',count:1,  applied:5,  interviewed:2, offered:1, status:'open',     start:'10/05/2026', end:'10/06/2026', jp:'—',  salary:'45-60M', owner:'Bùi Đức Thành',   desc:'Quản trị hạ tầng Kubernetes, CI/CD, observability (Grafana, Prometheus). AWS hoặc GCP experience bắt buộc.' },
  { id:4,  title:'QA Automation Engineer',       branch:'Hà Nội',  dept:'Quality',       count:2,  applied:9,  interviewed:5, offered:2, status:'open',     start:'20/04/2026', end:'20/05/2026', jp:'N3', salary:'30-42M', owner:'Trần Thị Mai',    desc:'Xây dựng automation test framework (Playwright, Cypress). Kinh nghiệm API testing và CI integration.' },
  { id:5,  title:'Product Manager',              branch:'Đà Nẵng', dept:'Product',       count:1,  applied:6,  interviewed:2, offered:0, status:'open',     start:'05/05/2026', end:'05/07/2026', jp:'N3', salary:'50-70M', owner:'Phạm Thu Hà',     desc:'PM cho sản phẩm ERP cloud B2B. 3+ năm kinh nghiệm, có khả năng giao tiếp tiếng Nhật tốt.' },
  { id:6,  title:'Junior Backend Developer',     branch:'HCM',     dept:'Engineering',   count:3,  applied:22, interviewed:8, offered:3, status:'open',     start:'01/04/2026', end:'30/04/2026', jp:'—',  salary:'18-28M', owner:'Lê Quang Huy',    desc:'Java Spring Boot / Go developer. Fresh hoặc 1 năm kinh nghiệm. Môi trường mentoring tốt.' },
  { id:7,  title:'UI/UX Designer',               branch:'Hà Nội',  dept:'Design',        count:1,  applied:14, interviewed:4, offered:1, status:'closed',   start:'01/03/2026', end:'31/03/2026', jp:'—',  salary:'25-38M', owner:'Vũ Thị Lan',      desc:'Thiết kế giao diện web/app B2B. Proficient Figma, có portfolio solid.' },
  { id:8,  title:'Data Analyst',                 branch:'HCM',     dept:'Data & BI',     count:2,  applied:7,  interviewed:1, offered:0, status:'draft',    start:'01/06/2026', end:'31/07/2026', jp:'N3', salary:'35-50M', owner:'Hoàng Đức Thành',  desc:'Phân tích dữ liệu sản phẩm và business. Python, SQL, Tableau/Redash.' },
];

const APPLICANTS = {
  1: [
    { name:'Nguyễn Minh Khoa',  src:'LinkedIn', applied:'18/05/2026', stage:'interview', note:'3Y exp Vue.js, portfolio tốt. Cần check JP level.' },
    { name:'Trần Văn Phong',    src:'JobStreet', applied:'15/05/2026', stage:'review',    note:'4Y React, không có JP. Kinh nghiệm fintech.' },
    { name:'Phạm Thu Linh',     src:'Referral',  applied:'10/05/2026', stage:'offer',     note:'Ex-Tiki, 5Y, N3. Đề xuất offer 52M.' },
    { name:'Lê Đức Anh',        src:'LinkedIn',  applied:'08/05/2026', stage:'screened',  note:'Fresh grad + internship 1Y. Potential cao.' },
    { name:'Hoàng Thị Tâm',     src:'Website',   applied:'05/05/2026', stage:'rejected',  note:'Không pass technical test round 1.' },
  ],
};

const STAGE_META = {
  review:    { label:'Xem hồ sơ',   variant:'gray',   step:1 },
  screened:  { label:'Đã screen',   variant:'sky',    step:2 },
  interview: { label:'Phỏng vấn',   variant:'amber',  step:3 },
  offer:     { label:'Gửi offer',   variant:'violet', step:4 },
  accepted:  { label:'Đã nhận',     variant:'green',  step:5 },
  rejected:  { label:'Từ chối',     variant:'red',    step:0 },
};

const JOB_STATUS_META = {
  open:    { label:'Đang tuyển', variant:'green' },
  closed:  { label:'Đã đóng',   variant:'gray' },
  draft:   { label:'Nháp',      variant:'amber' },
};

const SRC_COLOR = { LinkedIn: '#0a66c2', JobStreet: '#e15a2b', Referral: '#7c3aed', Website: '#22c55e' };

const PageRecruitment = () => {
  const [search, setSearch] = React.useState('');
  const [statusF, setStatusF] = React.useState('');
  const [deptF, setDeptF] = React.useState('');
  const [openJob, setOpenJob] = React.useState(null);

  const filtered = JOBS.filter(j => {
    if (search && !j.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusF && j.status !== statusF) return false;
    if (deptF && j.dept !== deptF) return false;
    return true;
  });

  const open = JOBS.filter(j => j.status === 'open').length;
  const totalApplied = JOBS.reduce((a,j) => a + j.applied, 0);
  const totalOffers = JOBS.reduce((a,j) => a + j.offered, 0);
  const convRate = Math.round(totalOffers / totalApplied * 100);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Tuyển dụng"
        title="Quản lý tin tuyển dụng"
        description="Theo dõi pipeline tuyển dụng — từ đăng tin đến offer. Xem ứng viên theo từng vị trí."
        actions={
          <>
            <Btn variant="outline" icon="FileText">Xuất báo cáo</Btn>
            <Btn variant="primary" icon="Plus">Tạo tin mới</Btn>
          </>
        }
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat label="Vị trí đang tuyển" value={open} sublabel={`${JOBS.filter(j=>j.status==='draft').length} tin nháp chờ đăng`} accent="primary" delay={40} />
        <MiniStat label="Ứng viên nhận được" value={totalApplied} sublabel="Tất cả vị trí" accent="green" delay={80} trend={{ dir:'up', value:'+18%' }} />
        <MiniStat label="Đang phỏng vấn" value={JOBS.reduce((a,j)=>a+j.interviewed,0)} sublabel="Bước 3/5 trong pipeline" accent="amber" delay={120} />
        <MiniStat label="Tỷ lệ offer" value={`${convRate}%`} sublabel={`${totalOffers} offers đã gửi`} accent="violet" delay={160} />
      </div>

      <FilterBar>
        <FieldInput icon="Search" placeholder="Tìm vị trí…" value={search} onChange={e => setSearch(e.target.value)} width={220} />
        <Select value={statusF} onChange={e => setStatusF(e.target.value)} placeholder="Tất cả trạng thái" width={150}
          options={Object.entries(JOB_STATUS_META).map(([k,v])=>({value:k,label:v.label}))} />
        <Select value={deptF} onChange={e => setDeptF(e.target.value)} placeholder="Tất cả bộ phận" width={170}
          options={[...new Set(JOBS.map(j=>j.dept))].map(d=>({value:d,label:d}))} />
        <div className="flex-1" />
        <span className="text-[12px] text-muted-foreground">{filtered.length} tin</span>
      </FilterBar>

      {/* Job list — table */}
      <div className="card-surface overflow-hidden rise" style={{ animationDelay:'180ms' }}>
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
                <th className="text-left py-3 px-5">Vị trí</th>
                <th className="text-left py-3 px-3">Bộ phận</th>
                <th className="text-left py-3 px-3">Chi nhánh</th>
                <th className="text-center py-3 px-3">Tuyển</th>
                <th className="text-left py-3 px-3 min-w-[180px]">Pipeline</th>
                <th className="text-center py-3 px-3">JLPT</th>
                <th className="text-center py-3 px-3">Trạng thái</th>
                <th className="text-right py-3 px-5">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(j => {
                const app = APPLICANTS[j.id] || [];
                const stages = Object.entries(STAGE_META).filter(([k])=>k!=='rejected').map(([k,v])=>({
                  k, label:v.label, n: app.length ? app.filter(a=>a.stage===k).length : Math.floor(Math.random()*3),
                }));
                const totalPipe = j.applied;
                return (
                  <tr key={j.id} onClick={() => setOpenJob(j)} className="border-b border-border/60 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors">
                    <td className="py-3.5 px-5">
                      <div>
                        <p className="font-semibold text-foreground">{j.title}</p>
                        <p className="text-[11.5px] text-muted-foreground mt-0.5">
                          {j.count} headcount · {j.salary}
                          {j.jp !== '—' && <span className="ml-1.5 px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10.5px]">{j.jp}</span>}
                        </p>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-foreground/85">{j.dept}</td>
                    <td className="py-3.5 px-3 text-foreground/85">{j.branch}</td>
                    <td className="py-3.5 px-3 text-center">
                      <span className="font-bold tabular-nums text-primary">{j.applied}</span>
                      <p className="text-[10.5px] text-muted-foreground">ứng viên</p>
                    </td>
                    <td className="py-3.5 px-3">
                      {/* Funnel mini bars */}
                      <div className="flex items-end gap-0.5 h-8">
                        {[j.applied, j.interviewed, j.offered, j.offered > 0 ? Math.ceil(j.offered*0.7) : 0].map((n, i) => (
                          <div key={i} className="flex-1 rounded-sm min-h-1"
                            style={{
                              height: `${Math.max(4, (n / Math.max(j.applied, 1)) * 100)}%`,
                              background:
                                i===0 ? 'hsl(var(--primary-h) var(--primary-s) 70% / 0.6)' :
                                i===1 ? 'hsl(38 92% 55% / 0.7)' :
                                i===2 ? 'hsl(265 60% 60% / 0.7)' :
                                'hsl(160 60% 50% / 0.7)',
                            }}
                            title={['Nhận hồ sơ','Phỏng vấn','Gửi offer','Accepted'][i]+`: ${n}`}
                          />
                        ))}
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 tabular-nums">
                        {j.applied} → {j.interviewed} → {j.offered}
                      </p>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {j.jp === '—' ? <span className="text-muted-foreground">—</span>
                        : <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[11px] font-semibold">{j.jp}</span>}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <Badge variant={JOB_STATUS_META[j.status].variant} dot>{JOB_STATUS_META[j.status].label}</Badge>
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono text-muted-foreground text-[12px]">{j.end}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {openJob && <JobDetail job={openJob} onClose={() => setOpenJob(null)} />}
    </div>
  );
};

const JobDetail = ({ job, onClose }) => {
  const applicants = APPLICANTS[job.id] || [
    { name:'Nguyễn Minh Khoa',  src:'LinkedIn',  applied:'18/05/2026', stage:'interview', note:'3Y exp, portfolio tốt.' },
    { name:'Trần Văn Phong',    src:'JobStreet', applied:'15/05/2026', stage:'review',    note:'4Y kinh nghiệm, không có JP.' },
    { name:'Phạm Thu Linh',     src:'Referral',  applied:'10/05/2026', stage:'offer',     note:'5Y, N3. Đề xuất 52M.' },
    { name:'Lê Đức Anh',        src:'LinkedIn',  applied:'08/05/2026', stage:'screened',  note:'Fresh + intern 1Y.' },
    { name:'Hoàng Thị Tâm',     src:'Website',   applied:'05/05/2026', stage:'rejected',  note:'Không pass test R1.' },
  ].slice(0, job.applied);

  const stageOrder = ['review','screened','interview','offer','accepted','rejected'];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background border-l border-border w-full max-w-2xl h-full flex flex-col rise" style={{ animationDuration:'.3s' }}>
        {/* Header */}
        <div className="p-5 border-b border-border/70">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 mb-1">
                <Badge variant={JOB_STATUS_META[job.status].variant} dot>{JOB_STATUS_META[job.status].label}</Badge>
                <Badge variant="gray">{job.dept}</Badge>
                {job.jp !== '—' && <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-mono text-[10.5px] font-semibold">{job.jp}</span>}
              </div>
              <h2 className="text-[20px] font-bold font-heading text-foreground">{job.title}</h2>
              <p className="text-[12.5px] text-muted-foreground mt-0.5">{job.branch} · {job.count} headcount · {job.salary} VND/tháng</p>
            </div>
            <button onClick={onClose} className="p-2 rounded-md hover:bg-muted text-muted-foreground"><Icon.X size={16} /></button>
          </div>

          {/* Pipeline funnel */}
          <div className="mt-4 grid grid-cols-4 gap-2">
            {[
              { l:'Đã nhận',    v:job.applied,      color:'hsl(var(--primary-h) var(--primary-s) 55%)' },
              { l:'Phỏng vấn',  v:job.interviewed,  color:'hsl(38 92% 50%)' },
              { l:'Offer',      v:job.offered,       color:'hsl(265 60% 55%)' },
              { l:'Headcount',  v:job.count,         color:'hsl(160 60% 45%)' },
            ].map((s,i) => (
              <div key={i} className="text-center rounded-xl p-3" style={{ background: s.color + '12' }}>
                <p className="text-[22px] font-bold font-heading tabular-nums" style={{ color: s.color }}>{s.v}</p>
                <p className="text-[10.5px] text-muted-foreground">{s.l}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-5">
          {/* Description */}
          <div>
            <p className="section-title mb-2">Mô tả vị trí</p>
            <p className="text-[13px] text-foreground/85 leading-relaxed">{job.desc}</p>
          </div>

          {/* Details row */}
          <div className="grid grid-cols-2 gap-3 text-[12.5px]">
            {[
              ['Người phụ trách', job.owner],
              ['Ngày đăng', job.start],
              ['Hạn nộp', job.end],
              ['Chi nhánh', job.branch],
            ].map(([l,v]) => (
              <div key={l}>
                <p className="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">{l}</p>
                <p className="mt-0.5 font-medium text-foreground">{v}</p>
              </div>
            ))}
          </div>

          {/* Applicants */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="section-title">Ứng viên ({applicants.length})</p>
              <Btn variant="primary" size="xs" icon="UserPlus">Thêm ứng viên</Btn>
            </div>
            <ul className="space-y-2">
              {applicants.map((a, i) => {
                const st = STAGE_META[a.stage] || STAGE_META.review;
                return (
                  <li key={i} className="card-surface interactive p-3.5 flex items-center gap-3 cursor-pointer">
                    <Avatar name={a.name} size={36} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-semibold text-foreground">{a.name}</p>
                        <span
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded text-white"
                          style={{ background: SRC_COLOR[a.src] || '#666' }}
                        >{a.src}</span>
                      </div>
                      {a.note && <p className="text-[11.5px] text-muted-foreground mt-0.5">{a.note}</p>}
                      <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{a.applied}</p>
                    </div>
                    <div className="shrink-0">
                      <Badge variant={st.variant} dot>{st.label}</Badge>
                    </div>
                    <div className="shrink-0">
                      {a.stage !== 'rejected' && a.stage !== 'accepted' && (
                        <div className="inline-flex gap-1">
                          <Btn variant="outline" size="xs">Cập nhật</Btn>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="p-4 border-t border-border/70 flex items-center gap-2">
          <Btn variant="ghost" size="sm" onClick={onClose}>Đóng</Btn>
          <div className="flex-1" />
          <Btn variant="outline" size="sm" icon="FileText">Chỉnh sửa</Btn>
          {job.status === 'open'
            ? <Btn variant="danger" size="sm">Đóng tin</Btn>
            : <Btn variant="primary" size="sm">Mở lại</Btn>}
        </div>
      </div>
    </div>
  );
};

window.PageRecruitment = PageRecruitment;
