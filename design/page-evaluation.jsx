/* Đánh giá nhân sự — evaluation list + detail drawer + create drawer */

/* 4 goal types matching the evaluation form (weights sum to 100%) */
const EVAL_SECTIONS = [
  { key: 'common',   label: 'Mục tiêu chung',   desc: 'Áp dụng cho toàn bộ nhân viên',   weight: 15, accent: 'hsl(var(--primary))' },
  { key: 'personal', label: 'Mục tiêu cá nhân', desc: 'Phát triển cá nhân trong kỳ',     weight: 25, accent: 'hsl(265 60% 55%)' },
  { key: 'project',  label: 'Mục tiêu dự án',   desc: 'Đóng góp vào các dự án cụ thể',   weight: 55, accent: 'hsl(160 60% 45%)' },
  { key: 'other',    label: 'Mục tiêu khác',    desc: 'Đóng góp ngoài kế hoạch',         weight: 5,  accent: 'hsl(38 92% 50%)' },
];
const SECTION_BY_KEY = Object.fromEntries(EVAL_SECTIONS.map(s => [s.key, s]));

/* Rank derivation from total score (10-point scale) */
const rankFromScore = (s) => s >= 9 ? 'S' : s >= 8 ? 'A' : s >= 6.5 ? 'B' : s >= 5 ? 'C' : s >= 3.5 ? 'D' : 'E';
const RANK_COLOR = { S: '#0ea5e9', A: '#22c55e', B: '#a3a3a3', C: '#eab308', D: '#f97316', E: '#ef4444' };

/* pct = % đạt được của mỗi loại mục tiêu (0-100) */
const EVALUATIONS = [
  { id: 1,  user: 'Nguyễn Văn An',     branch: 'Hà Nội',     role: 'Senior Frontend',  reviewer: 'Hoàng Đức Thành', period: 'Q2/2026', year: 2026, q: 2, pct: { common: 95, personal: 90, project: 92, other: 100 }, status: 'submitted', updated: '2 giờ trước', comment: 'An có sự tăng trưởng rõ rệt về kỹ năng lãnh đạo, đặc biệt là khả năng mentor cho team junior. Cần cải thiện thêm về khả năng giao tiếp với stakeholders Nhật.' },
  { id: 2,  user: 'Trần Thị Mai',      branch: 'Đà Nẵng',    role: 'QA Engineer',      reviewer: 'Phạm Thu Hà',     period: 'Q2/2026', year: 2026, q: 2, pct: { common: 80, personal: 70, project: 82, other: 80 },  status: 'submitted', updated: '5 giờ trước', comment: 'Mai làm việc kỹ lưỡng, ít miss bugs. Nên tham gia thêm hoạt động chia sẻ trong team.' },
  { id: 3,  user: 'Lê Quang Huy',      branch: 'HCM',        role: 'BrSE',             reviewer: 'Phạm Thu Hà',     period: 'Q2/2026', year: 2026, q: 2, pct: { common: 95, personal: 90, project: 96, other: 90 },  status: 'submitted', updated: 'Hôm qua',     comment: 'Huy duy trì performance ổn định ở mức rất cao. Là cầu nối tốt giữa team Việt Nam và Nhật.' },
  { id: 4,  user: 'Phạm Thu Hà',       branch: 'Đà Nẵng',    role: 'Tech Lead',        reviewer: 'Hoàng Đức Thành', period: 'Q2/2026', year: 2026, q: 2, pct: { common: 90, personal: 88, project: 90, other: 95 },  status: 'submitted', updated: '2 ngày trước', comment: 'Excellent leadership. Team Đà Nẵng đạt deadline tốt dưới sự dẫn dắt của Hà.' },
  { id: 5,  user: 'Đỗ Minh Tuấn',      branch: 'Hà Nội',     role: 'Backend Engineer', reviewer: 'Hoàng Đức Thành', period: 'Q2/2026', year: 2026, q: 2, pct: { common: 70, personal: 65, project: 72, other: 60 },  status: 'draft',     updated: '3 ngày trước', comment: 'Cần bổ sung trước khi gửi.' },
  { id: 6,  user: 'Hoàng Đức Thành',   branch: 'Hà Nội',     role: 'PM Senior',        reviewer: 'CEO',             period: 'Q2/2026', year: 2026, q: 2, pct: { common: 92, personal: 88, project: 93, other: 90 },  status: 'submitted', updated: '4 ngày trước', comment: 'Tiếp tục là trụ cột của PM team.' },
  { id: 7,  user: 'Vũ Thị Lan',        branch: 'Hà Nội',     role: 'Designer',         reviewer: 'Hoàng Đức Thành', period: 'Q2/2026', year: 2026, q: 2, pct: { common: 85, personal: 82, project: 86, other: 80 },  status: 'submitted', updated: '5 ngày trước', comment: 'Output design ổn định, có gout tốt.' },
  { id: 8,  user: 'Bùi Đức Thành',     branch: 'Osaka',      role: 'DevOps',           reviewer: 'Phạm Thu Hà',     period: 'Q2/2026', year: 2026, q: 2, pct: { common: 80, personal: 75, project: 82, other: 70 },  status: 'pending',   updated: '1 tuần trước', comment: '' },
  { id: 9,  user: 'Ngô Thanh Tùng',    branch: 'Hà Nội',     role: 'Junior Developer', reviewer: 'Đỗ Minh Tuấn',    period: 'Q2/2026', year: 2026, q: 2, pct: { common: 60, personal: 62, project: 65, other: 55 },  status: 'draft',     updated: '2 ngày trước', comment: '' },
  { id: 10, user: 'Đặng Thị Hồng',     branch: 'Đà Nẵng',    role: 'Tester',           reviewer: 'Phạm Thu Hà',     period: 'Q2/2026', year: 2026, q: 2, pct: { common: 78, personal: 72, project: 80, other: 70 },  status: 'submitted', updated: '6 ngày trước', comment: 'Hoàn thành tốt nhiệm vụ.' },
  // Some Q1 historical
  { id: 11, user: 'Nguyễn Văn An',     branch: 'Hà Nội',     role: 'Senior Frontend',  reviewer: 'Hoàng Đức Thành', period: 'Q1/2026', year: 2026, q: 1, pct: { common: 82, personal: 80, project: 84, other: 80 },  status: 'submitted', updated: '3 tháng trước', comment: 'Kỳ Q1 ổn định.' },
  { id: 12, user: 'Trần Thị Mai',      branch: 'Đà Nẵng',    role: 'QA Engineer',      reviewer: 'Phạm Thu Hà',     period: 'Q1/2026', year: 2026, q: 1, pct: { common: 72, personal: 68, project: 74, other: 65 },  status: 'submitted', updated: '3 tháng trước', comment: '' },
];

/* Weighted achievement on a 0–100 scale (Σ weight × pct/100) */
const weightedTotal = (e) => +EVAL_SECTIONS.reduce((a, s) => a + s.weight * (e.pct[s.key] || 0) / 100, 0).toFixed(1);
/* 0–10 scale used for ranking */
const totalScore = (e) => +(weightedTotal(e) / 10).toFixed(1);

const EVAL_STATUS_META = {
  pending:   { label: 'Chưa bắt đầu', variant: 'gray',   dot: true },
  draft:     { label: 'Nháp',          variant: 'amber',  dot: true },
  submitted: { label: 'Đã gửi',        variant: 'green',  dot: true },
};

const PageEvaluation = () => {
  const [year, setYear] = React.useState('2026');
  const [quarter, setQuarter] = React.useState('2');
  const [tab, setTab] = React.useState('manage'); // manage | mine | reports
  const [search, setSearch] = React.useState('');
  const [statusF, setStatusF] = React.useState('');
  const [rankF, setRankF] = React.useState('');
  const [openEval, setOpenEval] = React.useState(null);
  const [showCreate, setShowCreate] = React.useState(false);

  // Filter
  const allRows = EVALUATIONS.filter(e => String(e.year) === year && String(e.q) === quarter);
  const filtered = allRows.filter(e => {
    if (search && !e.user.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusF && e.status !== statusF) return false;
    const r = rankFromScore(totalScore(e));
    if (rankF && r !== rankF) return false;
    if (tab === 'mine' && e.user !== 'Nguyễn Văn An') return false;
    return true;
  });

  // Stats
  const submittedCount = allRows.filter(e => e.status === 'submitted').length;
  const completionPct = Math.round((submittedCount / Math.max(allRows.length, 1)) * 100);
  const avgScore = (allRows.filter(e => e.status === 'submitted').reduce((a, e) => a + totalScore(e), 0) / Math.max(submittedCount, 1)).toFixed(1);
  const topRank = (() => {
    const submitted = allRows.filter(e => e.status === 'submitted').map(totalScore);
    const sCount = submitted.filter(s => s >= 9).length;
    const aCount = submitted.filter(s => s >= 8 && s < 9).length;
    return { S: sCount, A: aCount };
  })();

  // Rank distribution
  const rankDist = {};
  ['S','A','B','C','D','E'].forEach(r => { rankDist[r] = 0; });
  allRows.filter(e => e.status === 'submitted').forEach(e => { rankDist[rankFromScore(totalScore(e))]++; });
  const maxDist = Math.max(...Object.values(rankDist), 1);

  // Create mode replaces the page content
  if (showCreate) {
    return <EvalForm onClose={() => setShowCreate(false)} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Đánh giá nhân sự"
        title={
          <>
            Kỳ đánh giá <span className="font-display italic font-normal text-primary" style={{ letterSpacing: '-0.025em' }}>Q{quarter}/{year}</span>
          </>
        }
        description="Quản lý phiếu đánh giá định kỳ. Mỗi nhân viên được chấm trên 5 tiêu chí và xếp hạng từ E đến S."
        actions={
          <>
            <Btn variant="outline" icon="FileText">Xuất báo cáo PDF</Btn>
            <Btn variant="primary" icon="Plus" onClick={() => setShowCreate(true)}>Tạo phiếu mới</Btn>
          </>
        }
      />

      {/* Period switcher banner */}
      <div className="card-surface p-4 rise flex flex-wrap items-center gap-4" style={{ animationDelay: '40ms' }}>
        <div className="flex items-center gap-2">
          <span className="text-[11.5px] uppercase tracking-wider font-semibold text-muted-foreground">Kỳ:</span>
          <div className="inline-flex rounded-md border border-border bg-muted/30 p-0.5">
            {['1','2','3','4'].map(q => (
              <button
                key={q}
                onClick={() => setQuarter(q)}
                className={'h-7 px-3 rounded-[5px] text-[12px] font-semibold tabular-nums ' +
                  (quarter === q ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
              >Q{q}</button>
            ))}
          </div>
          <Select value={year} onChange={e => setYear(e.target.value)} width={100} options={['2026','2025','2024','2023'].map(y => ({ value: y, label: y }))} />
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Progress strip */}
        <div className="flex items-center gap-3 flex-1 min-w-[260px]">
          <span className="text-[12px] text-muted-foreground">Tiến độ kỳ:</span>
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden max-w-[280px]">
            <div className="h-full rounded-full" style={{ width: `${completionPct}%`, background: 'linear-gradient(90deg, hsl(var(--primary-h) var(--primary-s) 65%), hsl(var(--primary-h) var(--primary-s) 45%))' }} />
          </div>
          <span className="text-[12px] font-semibold tabular-nums">{completionPct}%</span>
          <span className="text-[11.5px] text-muted-foreground">({submittedCount}/{allRows.length} phiếu)</span>
        </div>

        <div className="h-6 w-px bg-border hidden md:block" />

        <div className="text-[12px] text-muted-foreground">
          Hạn cuối: <span className="font-mono font-semibold text-foreground">15/06/2026</span> · còn <span className="text-amber-600 font-semibold">24 ngày</span>
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat label="Phiếu đã gửi" value={submittedCount} sublabel={`/ ${allRows.length} tổng cộng`} accent="green" delay={80} />
        <MiniStat label="Điểm trung bình" value={avgScore} sublabel="trên thang 10" accent="primary" delay={120} trend={{ dir: 'up', value: '+0.3' }} />
        <MiniStat label="Đạt rank S" value={topRank.S} sublabel={`${Math.round(topRank.S / Math.max(submittedCount,1) * 100)}% nhân viên`} accent="violet" delay={160} />
        <MiniStat label="Cần đôn đốc" value={allRows.length - submittedCount} sublabel="Phiếu chưa hoàn tất" accent={(allRows.length - submittedCount) > 0 ? 'amber' : 'green'} delay={200} />
      </div>

      {/* Tabs */}
      <div className="border-b border-border/70">
        <div className="flex gap-7">
          {[
            { k: 'manage', l: 'Quản lý phiếu', n: allRows.length },
            { k: 'mine', l: 'Phiếu của tôi', n: allRows.filter(e => e.user === 'Nguyễn Văn An').length },
            { k: 'reports', l: 'Báo cáo & xu hướng', n: null },
          ].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} data-active={tab === t.k} className="tab-trigger inline-flex items-center gap-2">
              {t.l}
              {t.n !== null && (
                <span className={'inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10.5px] font-semibold tabular-nums ' +
                  (tab === t.k ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground')}>{t.n}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {tab !== 'reports' && (
        <>
          <FilterBar>
            <FieldInput icon="Search" placeholder="Tìm tên nhân viên…" value={search} onChange={e => setSearch(e.target.value)} width={220} />
            <Select
              value={statusF}
              onChange={e => setStatusF(e.target.value)}
              placeholder="Tất cả trạng thái"
              options={Object.entries(EVAL_STATUS_META).map(([k, v]) => ({ value: k, label: v.label }))}
            />
            <Select
              value={rankF}
              onChange={e => setRankF(e.target.value)}
              placeholder="Tất cả rank"
              width={130}
              options={['S','A','B','C','D','E'].map(r => ({ value: r, label: `Rank ${r}` }))}
            />
            <div className="flex-1" />
            <span className="text-[12px] text-muted-foreground">{filtered.length} / {allRows.length} phiếu</span>
          </FilterBar>

          <div className="card-surface overflow-hidden rise" style={{ animationDelay: '240ms' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="thead-primary border-b border-border/70 text-[11px] uppercase tracking-wider font-semibold">
                    <th className="text-left py-3 px-5">Nhân viên</th>
                    <th className="text-left py-3 px-3">Người đánh giá</th>
                    <th className="text-left py-3 px-3" style={{ minWidth: 200 }}>% đạt theo loại mục tiêu</th>
                    <th className="text-center py-3 px-3">Tổng đạt</th>
                    <th className="text-center py-3 px-3">Rank</th>
                    <th className="text-center py-3 px-3">Trạng thái</th>
                    <th className="text-right py-3 px-5">Cập nhật</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(e => {
                    const total = totalScore(e);
                    const rank = rankFromScore(total);
                    return (
                      <tr key={e.id} onClick={() => setOpenEval(e)} className="border-b border-border/60 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors">
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <Avatar name={e.user} size={32} />
                            <div>
                              <p className="font-semibold text-foreground">{e.user}</p>
                              <p className="text-[11.5px] text-muted-foreground">{e.role} · {e.branch}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-foreground/85">{e.reviewer}</td>
                        <td className="py-3 px-3">
                          {/* Mini bars per goal type, height = % đạt */}
                          <div className="flex items-end gap-1.5 h-7" title="% đạt theo loại mục tiêu">
                            {EVAL_SECTIONS.map(s => {
                              const v = e.pct[s.key] || 0;
                              return (
                                <div key={s.key} className="flex flex-col items-center gap-0.5">
                                  <div className="w-4 rounded-sm transition-all flex items-end" style={{ height: '22px' }}>
                                    <div className="w-full rounded-sm" style={{ height: `${Math.max(v, 6)}%`, background: s.accent, opacity: v >= 80 ? 1 : 0.55 }} title={`${s.label}: ${v}%`} />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="font-bold tabular-nums text-foreground">{weightedTotal(e).toFixed(1)}</span>
                          <span className="text-muted-foreground text-[11px]">/100</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          {e.status === 'submitted' ? (
                            <span className="inline-flex items-center justify-center w-7 h-7 rounded-md text-[12px] font-bold text-white tabular-nums" style={{ background: RANK_COLOR[rank] }}>{rank}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          <Badge variant={EVAL_STATUS_META[e.status].variant} dot>{EVAL_STATUS_META[e.status].label}</Badge>
                        </td>
                        <td className="py-3 px-5 text-right text-muted-foreground text-[12px]">{e.updated}</td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan="7" className="py-14 text-center text-muted-foreground">
                      <Icon.Star size={36} className="mx-auto mb-2 opacity-30" />
                      Không có phiếu phù hợp
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'reports' && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Rank distribution */}
          <SectionCard delay={120} className="lg:col-span-3" title="Phân bố rank — kỳ này">
            <div className="flex items-end gap-6 h-48 px-4 pt-4">
              {Object.entries(rankDist).map(([r, n]) => (
                <div key={r} className="flex-1 flex flex-col items-center gap-2">
                  <span className="text-[13px] font-bold tabular-nums text-foreground">{n}</span>
                  <div
                    className="w-full rounded-md transition-all relative overflow-hidden"
                    style={{
                      height: `${(n / maxDist) * 100}%`,
                      minHeight: '4px',
                      background: `linear-gradient(180deg, ${RANK_COLOR[r]} 0%, ${RANK_COLOR[r]}aa 100%)`,
                    }}
                  >
                    <div className="absolute inset-x-0 top-0 h-px bg-white/30" />
                  </div>
                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-md text-[12px] font-bold text-white" style={{ background: RANK_COLOR[r] }}>{r}</span>
                </div>
              ))}
            </div>
            <p className="text-[11.5px] text-muted-foreground mt-4 pt-3 border-t border-border/60">
              Có <span className="font-semibold text-foreground">{topRank.S + topRank.A}/{submittedCount}</span> phiếu đạt rank A trở lên ({Math.round((topRank.S + topRank.A) / Math.max(submittedCount,1) * 100)}%). Trung bình kỳ này tăng <span className="text-emerald-600 font-semibold">+0.3 điểm</span> so với Q1.
            </p>
          </SectionCard>

          {/* Section averages */}
          <SectionCard delay={180} className="lg:col-span-2" title="Trung bình theo loại mục tiêu">
            <div className="space-y-3.5">
              {EVAL_SECTIONS.map(s => {
                const subs = allRows.filter(e => e.status === 'submitted');
                const avg = subs.length === 0 ? 0 : Math.round(subs.reduce((a, e) => a + (e.pct[s.key] || 0), 0) / subs.length);
                return (
                  <div key={s.key}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[12.5px] text-foreground/85">{s.label} <span className="text-[10.5px] text-muted-foreground">· {s.weight}%</span></span>
                      <span className="font-bold tabular-nums text-foreground">{avg}<span className="text-muted-foreground font-normal text-[10.5px]">%</span></span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${avg}%`, background: s.accent }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </SectionCard>

          {/* Top performers */}
          <SectionCard delay={240} className="lg:col-span-3" title="Top 5 — kỳ này">
            <ol className="space-y-2.5">
              {[...allRows.filter(e => e.status === 'submitted')]
                .sort((a, b) => totalScore(b) - totalScore(a))
                .slice(0, 5)
                .map((e, i) => {
                  const total = totalScore(e);
                  const rank = rankFromScore(total);
                  return (
                    <li key={e.id} className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors" onClick={() => setOpenEval(e)}>
                      <span className="w-6 text-center text-[12px] font-bold tabular-nums text-muted-foreground">#{i + 1}</span>
                      <Avatar name={e.user} size={32} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{e.user}</p>
                        <p className="text-[11.5px] text-muted-foreground">{e.role} · {e.branch}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold tabular-nums text-foreground text-[15px]">{total}<span className="text-muted-foreground text-[10.5px] font-normal">/10</span></p>
                      </div>
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-md text-[11px] font-bold text-white" style={{ background: RANK_COLOR[rank] }}>{rank}</span>
                    </li>
                  );
                })}
            </ol>
          </SectionCard>

          {/* Trend over quarters */}
          <SectionCard delay={300} className="lg:col-span-2" title="Xu hướng điểm trung bình">
            <div className="h-44">
              <LineChart
                data={[
                  { label: 'Q3/25', value: 6.8 },
                  { label: 'Q4/25', value: 7.1 },
                  { label: 'Q1/26', value: 7.4 },
                  { label: 'Q2/26', value: Number(avgScore) || 7.7 },
                ]}
                width={420}
                height={200}
                invertY={false}
              />
            </div>
            <p className="text-[11.5px] text-muted-foreground mt-2 italic">Trung bình điểm đánh giá toàn công ty qua 4 quý gần nhất.</p>
          </SectionCard>
        </div>
      )}

      {openEval && <EvalDetail e={openEval} onClose={() => setOpenEval(null)} />}
    </div>
  );
};

const EvalDetail = ({ e, onClose }) => {
  const total = totalScore(e);
  const rank = rankFromScore(total);
  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background border-l border-border w-full max-w-xl h-full flex flex-col rise" style={{ animationDuration: '.4s' }}>
        {/* Header */}
        <div className="p-5 border-b border-border/70 flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Avatar name={e.user} size={52} />
            <div className="min-w-0">
              <h3 className="font-bold text-[18px] text-foreground font-heading truncate">{e.user}</h3>
              <p className="text-[12.5px] text-muted-foreground truncate">{e.role} · {e.branch}</p>
              <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                <Badge variant="primary">{e.period}</Badge>
                <Badge variant={EVAL_STATUS_META[e.status].variant} dot>{EVAL_STATUS_META[e.status].label}</Badge>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-md hover:bg-muted text-muted-foreground shrink-0"><Icon.X size={16} /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {/* Total score hero */}
          <div className="p-5 border-b border-border/70 flex items-center gap-6">
            <div className="relative">
              <svg width="112" height="112" className="rotate-[-90deg]">
                <circle cx="56" cy="56" r="48" fill="none" stroke="hsl(var(--muted))" strokeWidth="9" />
                <circle
                  cx="56" cy="56" r="48" fill="none"
                  stroke={RANK_COLOR[rank]}
                  strokeWidth="9" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - total / 10)}
                  style={{ transition: 'stroke-dashoffset 0.9s cubic-bezier(.2,.7,.2,1)' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[28px] font-bold font-heading tabular-nums leading-none">{total}</span>
                <span className="text-[10.5px] text-muted-foreground">/ 10</span>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">Xếp hạng kỳ</p>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-[20px] font-bold text-white font-heading" style={{ background: RANK_COLOR[rank] }}>{rank}</span>
                <span className="font-display italic text-foreground" style={{ fontSize: '20px', fontWeight: 400 }}>
                  {rank === 'S' ? 'Xuất sắc' : rank === 'A' ? 'Tốt' : rank === 'B' ? 'Đạt yêu cầu' : rank === 'C' ? 'Trung bình' : rank === 'D' ? 'Cần cải thiện' : 'Yếu'}
                </span>
              </div>
              <p className="text-[11.5px] text-muted-foreground mt-2">Đánh giá bởi <span className="font-semibold text-foreground">{e.reviewer}</span> · {e.updated}</p>
            </div>
          </div>

          {/* Section scores */}
          <div className="p-5 border-b border-border/70">
            <div className="flex items-center justify-between mb-4">
              <h4 className="section-title">Điểm theo loại mục tiêu</h4>
              <span className="text-[11px] text-muted-foreground">Trọng số × % đạt</span>
            </div>
            <ul className="space-y-4">
              {EVAL_SECTIONS.map(s => {
                const v = e.pct[s.key] || 0;
                const pts = +(s.weight * v / 100).toFixed(1);
                return (
                  <li key={s.key}>
                    <div className="flex items-baseline justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="h-3 w-1 rounded-full" style={{ background: s.accent }} />
                        <div>
                          <p className="text-[13px] font-semibold text-foreground">{s.label} <span className="text-[10.5px] text-muted-foreground font-normal">· trọng số {s.weight}%</span></p>
                          <p className="text-[11px] text-muted-foreground">{s.desc}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold tabular-nums text-foreground text-[15px]">{v}<span className="text-muted-foreground text-[10.5px] font-normal">%</span></span>
                        <span className="block text-[10.5px] font-mono" style={{ color: s.accent }}>{pts} điểm</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${v}%`, background: s.accent, opacity: v >= 80 ? 1 : 0.7 }} />
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/60">
              <span className="text-[12px] font-semibold text-muted-foreground uppercase tracking-wide">Tổng điểm đạt</span>
              <span className="font-bold tabular-nums text-foreground text-[16px]">{weightedTotal(e).toFixed(1)}<span className="text-muted-foreground text-[11px] font-normal">/100</span></span>
            </div>
          </div>

          {/* Comment */}
          {e.comment && (
            <div className="p-5 border-b border-border/70">
              <h4 className="section-title mb-2">Nhận xét</h4>
              <blockquote className="border-l-2 border-primary/40 pl-3 text-[13px] text-foreground/85 italic font-display" style={{ fontWeight: 400, lineHeight: 1.55 }}>
                "{e.comment}"
              </blockquote>
              <p className="text-[11px] text-muted-foreground mt-2">— {e.reviewer}</p>
            </div>
          )}

          {/* Historical */}
          <div className="p-5">
            <h4 className="section-title mb-3">Lịch sử của {e.user.split(' ').slice(-1)[0]}</h4>
            <div className="space-y-2 text-[13px]">
              {[
                { p: 'Q1/2026', s: 8.1, st: 'submitted' },
                { p: 'Q4/2025', s: 7.6, st: 'submitted' },
                { p: 'Q3/2025', s: 7.2, st: 'submitted' },
              ].map((h, i) => {
                const r = rankFromScore(h.s);
                return (
                  <div key={i} className="flex items-center gap-3 p-2 -mx-2 rounded-md hover:bg-muted/30">
                    <span className="font-mono text-[11.5px] text-muted-foreground w-16">{h.p}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full" style={{ width: `${h.s * 10}%`, background: RANK_COLOR[r] }} />
                    </div>
                    <span className="font-semibold tabular-nums w-10 text-right">{h.s}</span>
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md text-[10px] font-bold text-white" style={{ background: RANK_COLOR[r] }}>{r}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border/70 flex items-center gap-2">
          <Btn variant="ghost" size="sm" onClick={onClose}>Đóng</Btn>
          <div className="flex-1" />
          <Btn variant="outline" size="sm" icon="FileText">Xuất PDF</Btn>
          <Btn variant="primary" size="sm" icon="FileText">Chỉnh sửa</Btn>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────
   OKR-style evaluation form. 4 sections of weighted goals + self/sup
   comment pair. Self vs supervisor mode toggles editable columns.
   ───────────────────────────────────────────────────────────────────── */

const SECTION_DEFS = {
  common: {
    label: 'Mục tiêu chung',
    desc: 'Mục tiêu áp dụng cho toàn bộ nhân viên trong công ty',
    accent: 'hsl(var(--primary))',
    cols: 'goal', // weight | name | target | actualPct | resultPct | score
  },
  personal: {
    label: 'Mục tiêu cá nhân',
    desc: 'Mục tiêu phát triển cá nhân của bạn trong kỳ',
    accent: 'hsl(265 60% 55%)',
    cols: 'goal',
  },
  project: {
    label: 'Mục tiêu dự án',
    desc: 'Đóng góp vào các dự án cụ thể trong kỳ này',
    accent: 'hsl(160 60% 45%)',
    cols: 'project', // weight | project | name | actualPct | resultPct | score
  },
  other: {
    label: 'Mục tiêu khác',
    desc: 'Đóng góp ngoài kế hoạch hoặc đặc biệt',
    accent: 'hsl(38 92% 50%)',
    cols: 'other', // weight | name | detail | actualPct | resultPct | score
  },
};

const STARTER_GOALS = {
  common: [
    { id: 'c1', weight: 10, name: 'Hoàn thành mục tiêu OKR công ty Q2', target: 'Tham gia ít nhất 80% các OKR initiative được giao', actual: '', result: '' },
    { id: 'c2', weight: 5,  name: 'Đóng góp vào culture công ty', target: 'Tham dự đầy đủ All Hands + ít nhất 2 hoạt động team building', actual: '', result: '' },
  ],
  personal: [
    { id: 'p1', weight: 15, name: 'Viết blog kỹ thuật', target: '4 bài blog (≥1500 từ) trên Medium công ty trong quý', actual: '', result: '' },
    { id: 'p2', weight: 10, name: 'Học tiếng Nhật', target: 'Hoàn thành chương trình N2 và thi thử đạt ≥70%', actual: '', result: '' },
  ],
  project: [
    { id: 'pr1', weight: 25, project: 'Cổng thanh toán XYZ',  name: 'Hoàn thành module checkout v2', actual: '', result: '' },
    { id: 'pr2', weight: 20, project: 'Hệ thống CRM nội bộ',   name: 'Mentor 2 junior dev và review ≥50 PR',  actual: '', result: '' },
    { id: 'pr3', weight: 10, project: 'Module báo cáo BI',     name: 'Thiết kế kiến trúc data pipeline', actual: '', result: '' },
  ],
  other: [
    { id: 'o1', weight: 5, name: 'Phỏng vấn ứng viên', detail: 'Tham gia ≥5 buổi phỏng vấn kỹ thuật cho team Frontend', actual: '', result: '' },
  ],
};

const PROJECT_OPTIONS = [
  'Cổng thanh toán XYZ',
  'Hệ thống CRM nội bộ',
  'App giao đồ ăn FoodGo',
  'Quản lý kho ABC v2',
  'Module báo cáo BI',
  'Mobile companion app',
  'Cổng tích hợp API v3',
];

/* Compute score for a single row: weight × result(%) / 100 (uses actual if no result) */
const rowScore = (g) => {
  const pct = g.result !== '' && g.result != null ? Number(g.result) : (g.actual !== '' ? Number(g.actual) : 0);
  return +((Number(g.weight) || 0) * (pct || 0) / 100).toFixed(1);
};

const EvalForm = ({ onClose }) => {
  const [mode, setMode] = React.useState('self'); // 'self' | 'supervisor'
  const [year, setYear] = React.useState('2026');
  const [quarter, setQuarter] = React.useState('2');
  const [employee, setEmployee] = React.useState({ name: 'Trần Ngọc Huy', role: 'Backend Engineer', branch: 'Tokyo' });
  const [goals, setGoals] = React.useState(STARTER_GOALS);
  const [commentSelf, setCommentSelf] = React.useState('Tự đánh giá: kỳ này em tập trung mạnh vào dự án Cổng thanh toán XYZ, hoàn thành module checkout đúng deadline. Blog cá nhân vẫn cần đẩy mạnh hơn — mới ra được 2 bài.');
  const [commentSup, setCommentSup] = React.useState('');

  // Totals
  const allGoals = [...goals.common, ...goals.personal, ...goals.project, ...goals.other];
  const totalWeight = allGoals.reduce((a, g) => a + (Number(g.weight) || 0), 0);
  const totalScore = allGoals.reduce((a, g) => a + rowScore(g), 0);
  const totalScoreNorm = +(totalScore).toFixed(1);
  const rank10 = +(totalScoreNorm / 10).toFixed(1); // 0-10 for ranking
  const rank = rankFromScore(rank10);
  const weightDeficit = 100 - totalWeight;

  // Mutate helpers
  const updateRow = (section, id, patch) => {
    setGoals(g => ({ ...g, [section]: g[section].map(r => r.id === id ? { ...r, ...patch } : r) }));
  };
  const addRow = (section) => {
    const id = section + '_' + Date.now();
    const base = { id, weight: 0, name: '', actual: '', result: '' };
    const row = section === 'project' ? { ...base, project: '' } : section === 'other' ? { ...base, detail: '' } : { ...base, target: '' };
    setGoals(g => ({ ...g, [section]: [...g[section], row] }));
  };
  const removeRow = (section, id) => {
    setGoals(g => ({ ...g, [section]: g[section].filter(r => r.id !== id) }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={
          <span className="inline-flex items-center gap-2">
            <button onClick={onClose} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
              <Icon.ChevronRight size={11} className="rotate-180" /> Đánh giá nhân sự
            </button>
            <span className="text-border">/</span>
            <span className="text-foreground font-semibold">Tạo phiếu đánh giá</span>
          </span>
        }
        title={
          <>
            Phiếu đánh giá <span className="font-display italic font-normal text-primary" style={{ letterSpacing: '-0.025em' }}>Q{quarter}/{year}</span>
          </>
        }
        description="Mỗi mục tiêu được gán trọng số (%) và phần trăm hoàn thành. Điểm = trọng số × hoàn thành. Tổng trọng số phải bằng 100%."
        actions={
          <>
            <Btn variant="ghost" onClick={onClose}>Huỷ</Btn>
            <Btn variant="outline" icon="FileText">Lưu nháp</Btn>
            <Btn variant="primary" icon="Check">Gửi phiếu</Btn>
          </>
        }
      />

      {/* Hero summary card */}
      <div className="card-surface overflow-hidden rise" style={{ animationDelay: '40ms' }}>
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr,1fr] gap-0">
          {/* Left: employee + mode + period */}
          <div className="p-5 relative overflow-hidden">
            <div
              className="absolute -right-12 -top-12 w-44 h-44 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, hsl(var(--primary-h) var(--primary-s) 60% / 0.16), transparent 65%)' }}
            />
            <div className="relative flex items-start gap-4">
              <Avatar name={employee.name} size={56} />
              <div className="min-w-0 flex-1">
                <p className="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">Nhân viên được đánh giá</p>
                <h2 className="text-[20px] font-bold font-heading text-foreground mt-0.5 leading-tight">{employee.name}</h2>
                <p className="text-[12.5px] text-muted-foreground mt-0.5">{employee.role} · Chi nhánh {employee.branch}</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Badge variant="primary">#0028</Badge>
                  <Badge variant="gray">Kỳ trước: Rank A · 7.8/10</Badge>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-5 border-t border-border/70 grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10.5px] uppercase font-semibold text-muted-foreground tracking-wider mb-1.5 block">Kỳ đánh giá</label>
                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-md border border-border bg-muted/30 p-0.5">
                    {['1','2','3','4'].map(q => (
                      <button
                        key={q}
                        onClick={() => setQuarter(q)}
                        className={'h-7 px-2.5 rounded-[5px] text-[11.5px] font-semibold tabular-nums ' +
                          (quarter === q ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
                      >Q{q}</button>
                    ))}
                  </div>
                  <Select value={year} onChange={e => setYear(e.target.value)} width={90} options={['2026','2025','2024'].map(y => ({ value: y, label: y }))} />
                </div>
              </div>
              <div>
                <label className="text-[10.5px] uppercase font-semibold text-muted-foreground tracking-wider mb-1.5 block">Vai trò nhập</label>
                <div className="inline-flex rounded-md border border-border bg-muted/30 p-0.5">
                  <button
                    onClick={() => setMode('self')}
                    className={'h-7 px-3 rounded-[5px] text-[11.5px] font-semibold inline-flex items-center gap-1.5 ' +
                      (mode === 'self' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
                  >
                    <Icon.Users size={11} /> Nhân viên
                  </button>
                  <button
                    onClick={() => setMode('supervisor')}
                    className={'h-7 px-3 rounded-[5px] text-[11.5px] font-semibold inline-flex items-center gap-1.5 ' +
                      (mode === 'supervisor' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground')}
                  >
                    <Icon.Award size={11} /> Cấp trên
                  </button>
                </div>
                <p className="text-[10.5px] text-muted-foreground mt-1 italic">
                  {mode === 'self' ? 'Bạn đang nhập phần Thực tế (%)' : 'Bạn đang nhập phần Kết quả (%) — cột cấp trên'}
                </p>
              </div>
            </div>
          </div>

          {/* Right: total weight + score + rank */}
          <div className="border-l border-border/70 bg-muted/20 p-5 grid grid-cols-3 gap-4 items-center">
            <div className="text-center">
              <p className="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">Tổng trọng số</p>
              <p className={'text-[28px] font-bold font-heading tabular-nums mt-1 ' + (totalWeight === 100 ? 'text-emerald-600' : totalWeight > 100 ? 'text-red-500' : 'text-foreground')}>
                {totalWeight}<span className="text-muted-foreground text-[14px] font-normal">/100</span>
              </p>
              {totalWeight !== 100 && (
                <p className={'text-[10.5px] mt-0.5 ' + (weightDeficit > 0 ? 'text-amber-600' : 'text-red-500')}>
                  {weightDeficit > 0 ? `Còn thiếu ${weightDeficit}%` : `Vượt ${-weightDeficit}%`}
                </p>
              )}
              {totalWeight === 100 && <p className="text-[10.5px] mt-0.5 text-emerald-600">Đủ 100% ✓</p>}
            </div>
            <div className="text-center">
              <p className="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">Tổng điểm</p>
              <p className="text-[28px] font-bold font-heading tabular-nums mt-1 text-primary">
                {totalScoreNorm.toFixed(1)}<span className="text-muted-foreground text-[14px] font-normal">/100</span>
              </p>
              <p className="text-[10.5px] text-muted-foreground mt-0.5">Quy đổi: {rank10.toFixed(1)}/10</p>
            </div>
            <div className="text-center">
              <p className="text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground">Xếp hạng</p>
              <div className="mt-1.5 inline-flex flex-col items-center gap-0.5">
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-xl text-[22px] font-bold text-white font-heading" style={{ background: RANK_COLOR[rank] }}>{rank}</span>
                <span className="text-[10.5px] text-muted-foreground italic">
                  {rank === 'S' ? 'Xuất sắc' : rank === 'A' ? 'Tốt' : rank === 'B' ? 'Đạt' : rank === 'C' ? 'Trung bình' : rank === 'D' ? 'Cần cải thiện' : 'Yếu'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Goal sections */}
      {Object.entries(SECTION_DEFS).map(([key, def], i) => (
        <GoalSection
          key={key}
          sectionKey={key}
          def={def}
          rows={goals[key]}
          onUpdate={(id, patch) => updateRow(key, id, patch)}
          onAdd={() => addRow(key)}
          onRemove={(id) => removeRow(key, id)}
          mode={mode}
          delay={80 + i * 60}
        />
      ))}

      {/* Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 rise" style={{ animationDelay: '380ms' }}>
        <CommentCard
          title="Nhận xét — Bản thân"
          subtitle={employee.name + ' · tự đánh giá'}
          avatarName={employee.name}
          accent="hsl(var(--primary-h) var(--primary-s) 50%)"
          value={commentSelf}
          onChange={mode === 'self' ? setCommentSelf : null}
          readOnly={mode !== 'self'}
          placeholder="Tự nhận xét: điểm mạnh, điểm cần cải thiện, đề xuất cho kỳ tới…"
        />
        <CommentCard
          title="Nhận xét — Cấp trên"
          subtitle="Phạm Thu Hà · Tech Lead"
          avatarName="Phạm Thu Hà"
          accent="hsl(265 60% 55%)"
          value={commentSup}
          onChange={mode === 'supervisor' ? setCommentSup : null}
          readOnly={mode !== 'supervisor'}
          placeholder="Đánh giá tổng thể từ cấp trên — sẽ được điền sau khi nhân viên gửi phiếu."
        />
      </div>

      {/* Sticky footer action bar */}
      <div className="sticky bottom-0 -mx-6 px-6 py-3 bg-background/85 backdrop-blur-md border-t border-border/70 flex items-center gap-3 z-10">
        <div className="flex items-center gap-3 flex-1 text-[12.5px]">
          {totalWeight === 100 ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
              <Icon.Check size={13} /> Trọng số hợp lệ
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-amber-600 font-semibold">
              <Icon.Sparkles size={13} /> Trọng số chưa đủ 100% — phiếu sẽ được lưu nháp
            </span>
          )}
          <span className="text-muted-foreground">·</span>
          <span className="text-muted-foreground">Lưu nháp tự động lúc <span className="font-mono">14:42</span></span>
        </div>
        <Btn variant="ghost" onClick={onClose}>Huỷ</Btn>
        <Btn variant="outline" icon="FileText">Lưu nháp</Btn>
        <Btn variant="primary" icon="Check">Gửi phiếu</Btn>
      </div>
    </div>
  );
};

/* Goal section — one of the 4 categories */
const GoalSection = ({ sectionKey, def, rows, onUpdate, onAdd, onRemove, mode, delay = 0 }) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const sectionWeight = rows.reduce((a, r) => a + (Number(r.weight) || 0), 0);
  const sectionScore = rows.reduce((a, r) => a + rowScore(r), 0);

  return (
    <div className="card-surface rise overflow-hidden" style={{ animationDelay: `${delay}ms`, background: `color-mix(in srgb, ${def.accent} 7%, hsl(var(--card)))` }}>
      {/* Section header */}
      <div className="px-5 py-3 border-b flex items-center gap-3" style={{ background: `color-mix(in srgb, ${def.accent} 15%, hsl(var(--card)))`, borderColor: `color-mix(in srgb, ${def.accent} 30%, transparent)` }}>
        <span className="h-7 w-1 rounded-full" style={{ background: def.accent }} />
        <button onClick={() => setCollapsed(c => !c)} className="inline-flex items-center gap-2 text-left">
          <Icon.ChevronDown size={14} className={'text-muted-foreground transition-transform ' + (collapsed ? '-rotate-90' : '')} />
          <h3 className="section-title">{def.label}</h3>
        </button>
        <p className="text-[11.5px] text-muted-foreground hidden md:block">— {def.desc}</p>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-[11.5px]">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground font-mono">
            Trọng số <span className="font-bold text-foreground tabular-nums">{sectionWeight}%</span>
          </span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-mono" style={{ background: `color-mix(in srgb, ${def.accent} 16%, transparent)`, color: def.accent }}>
            Điểm <span className="font-bold tabular-nums">{sectionScore.toFixed(1)}</span>
          </span>
        </div>
      </div>

      {/* Section body */}
      {!collapsed && (
        <div className="divide-y divide-border/60">
          {/* Column headers */}
          <div className="px-5 py-2 bg-muted/30 grid items-center gap-3 text-[10.5px] uppercase tracking-wider font-semibold text-muted-foreground"
            style={{ gridTemplateColumns: def.cols === 'project' ? '64px 180px 1fr 110px 110px 80px 28px' : '64px 1fr 1.4fr 110px 110px 80px 28px' }}
          >
            <span>Trọng số</span>
            {def.cols === 'project' ? <span>Dự án</span> : <span>Tên mục tiêu</span>}
            {def.cols === 'project' ? <span>Tên mục tiêu</span> : <span>{def.cols === 'other' ? 'Chi tiết' : 'Mục tiêu cụ thể'}</span>}
            <span className="text-right">Thực tế (%)</span>
            <span className="text-right" style={{ color: 'hsl(265 60% 55%)' }}>Kết quả (%)</span>
            <span className="text-right">Điểm</span>
            <span />
          </div>

          {/* Rows */}
          {rows.map(row => (
            <GoalRow
              key={row.id}
              row={row}
              section={sectionKey}
              cols={def.cols}
              mode={mode}
              accent={def.accent}
              onUpdate={(patch) => onUpdate(row.id, patch)}
              onRemove={() => onRemove(row.id)}
            />
          ))}

          {rows.length === 0 && (
            <div className="px-5 py-8 text-center text-muted-foreground text-[12.5px]">
              <Icon.Star size={28} className="mx-auto mb-2 opacity-30" />
              Chưa có mục tiêu nào trong nhóm này
            </div>
          )}

          {/* Add row */}
          <div className="px-5 py-2.5 bg-muted/15">
            <button
              onClick={onAdd}
              className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-primary hover:bg-primary/10 px-2 py-1.5 rounded-md transition-colors"
            >
              <Icon.Plus size={12} /> Thêm mục tiêu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const FieldCell = ({ value, onChange, placeholder, type = 'text', align = 'left', readOnly = false, accent }) => (
  <input
    type={type}
    value={value || ''}
    onChange={e => onChange(e.target.value)}
    placeholder={placeholder}
    readOnly={readOnly}
    className={'w-full px-2.5 py-1.5 rounded-md text-[13px] outline-none transition-all ' +
      (readOnly
        ? 'cursor-default text-foreground/70 bg-transparent border border-transparent'
        : 'border border-border bg-card hover:border-primary/40 focus:border-primary/60 text-foreground')}
    style={{ textAlign: align, fontFamily: type === 'number' ? 'JetBrains Mono, monospace' : '', color: accent || undefined }}
  />
);

const GoalRow = ({ row, section, cols, mode, accent, onUpdate, onRemove }) => {
  const score = rowScore(row);
  const isProject = cols === 'project';
  const isOther = cols === 'other';
  const grid = isProject ? '64px 180px 1fr 110px 110px 80px 28px' : '64px 1fr 1.4fr 110px 110px 80px 28px';

  return (
    <div
      className="px-5 py-2.5 grid items-center gap-3 hover:bg-muted/15 transition-colors group"
      style={{ gridTemplateColumns: grid }}
    >
      {/* Weight */}
      <div className="relative">
        <FieldCell
          value={row.weight}
          onChange={(v) => onUpdate({ weight: v === '' ? '' : Number(v) })}
          type="number"
          align="right"
          readOnly={mode !== 'self'}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10.5px] text-muted-foreground pointer-events-none">%</span>
      </div>

      {/* Project OR Name */}
      {isProject ? (
        <div className="relative">
          <select
            value={row.project || ''}
            onChange={e => onUpdate({ project: e.target.value })}
            disabled={mode !== 'self'}
            className="w-full appearance-none px-2 pr-7 py-1.5 rounded-md text-[13px] outline-none bg-transparent hover:bg-muted/40 focus:bg-card focus:ring-1 focus:ring-primary/40 text-foreground disabled:cursor-default disabled:text-foreground/70 truncate"
          >
            <option value="" disabled>Chọn dự án…</option>
            {PROJECT_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <Icon.ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      ) : (
        <FieldCell value={row.name} onChange={v => onUpdate({ name: v })} placeholder="Tên mục tiêu…" readOnly={mode !== 'self'} />
      )}

      {/* Target / detail / name (for project) */}
      {isProject ? (
        <FieldCell value={row.name} onChange={v => onUpdate({ name: v })} placeholder="Tên mục tiêu…" readOnly={mode !== 'self'} />
      ) : isOther ? (
        <FieldCell value={row.detail} onChange={v => onUpdate({ detail: v })} placeholder="Chi tiết mục tiêu…" readOnly={mode !== 'self'} />
      ) : (
        <FieldCell value={row.target} onChange={v => onUpdate({ target: v })} placeholder="Mô tả cụ thể, đo lường được…" readOnly={mode !== 'self'} />
      )}

      {/* Actual (self %) */}
      <div className="relative">
        <FieldCell
          value={row.actual}
          onChange={v => onUpdate({ actual: v })}
          placeholder="0"
          type="number"
          align="right"
          readOnly={mode !== 'self'}
          accent={mode === 'self' && row.actual !== '' ? 'hsl(var(--primary))' : undefined}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10.5px] text-muted-foreground pointer-events-none">%</span>
      </div>

      {/* Result (supervisor %) */}
      <div className="relative">
        <FieldCell
          value={row.result}
          onChange={v => onUpdate({ result: v })}
          placeholder="—"
          type="number"
          align="right"
          readOnly={mode !== 'supervisor'}
          accent={row.result !== '' ? 'hsl(265 60% 55%)' : undefined}
        />
        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10.5px] text-muted-foreground pointer-events-none">%</span>
      </div>

      {/* Computed score */}
      <div
        className="rounded-md py-1.5 px-2 text-right font-bold tabular-nums text-[14px]"
        style={{
          background: score > 0 ? accent + '12' : 'transparent',
          color: score > 0 ? accent : 'hsl(var(--muted-foreground))',
        }}
      >
        {score > 0 ? score.toFixed(1) : '—'}
      </div>

      {/* Delete */}
      <button
        onClick={onRemove}
        disabled={mode !== 'self'}
        className="h-7 w-7 rounded-md flex items-center justify-center text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-950/30 opacity-0 group-hover:opacity-100 transition-all disabled:opacity-0"
        title="Xoá mục tiêu"
      >
        <Icon.X size={13} />
      </button>
    </div>
  );
};

const CommentCard = ({ title, subtitle, avatarName, accent, value, onChange, readOnly, placeholder }) => (
  <div className="card-surface overflow-hidden">
    <div className="px-4 py-3 border-b border-border/70 flex items-center gap-3" style={{ background: `linear-gradient(90deg, ${accent}10 0%, transparent 60%)` }}>
      <Avatar name={avatarName} size={32} />
      <div className="min-w-0 flex-1">
        <p className="section-title">{title}</p>
        <p className="text-[11px] text-muted-foreground truncate">{subtitle}</p>
      </div>
      {readOnly && <Badge variant="gray">Chỉ đọc</Badge>}
    </div>
    <textarea
      value={value || ''}
      onChange={onChange ? (e) => onChange(e.target.value) : undefined}
      readOnly={readOnly}
      placeholder={placeholder}
      rows={6}
      className={'w-full px-4 py-3 text-[13px] outline-none resize-none ' +
        (readOnly ? 'bg-muted/20 text-foreground/70 cursor-default' : 'bg-transparent focus:bg-muted/10')}
      style={{ minHeight: '140px' }}
    />
  </div>
);

window.PageEvaluation = PageEvaluation;
