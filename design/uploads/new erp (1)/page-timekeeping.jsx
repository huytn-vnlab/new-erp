/* HRM > Chấm công — timekeeping with calendar heatmap & today card */

/* Generate plausible history for May 2026 (22 days so far) */
const buildHistory = () => {
  const rows = [];
  for (let d = 1; d <= 22; d++) {
    const date = new Date(2026, 4, d);
    const dow = date.getDay();
    if (dow === 0 || dow === 6) {
      rows.push({ date: `${String(d).padStart(2, '0')}/05/2026`, weekday: dow, status: 'weekend' });
      continue;
    }
    // Some random absences
    if (d === 5) { rows.push({ date: '05/05/2026', weekday: dow, status: 'leave', note: 'Phép năm' }); continue; }
    if (d === 12) { rows.push({ date: '12/05/2026', weekday: dow, status: 'leave', note: 'Nghỉ ốm' }); continue; }
    if (d === 19) { rows.push({ date: '19/05/2026', weekday: dow, in: '09:42', out: '18:30', hours: 8.0, late: 42, status: 'late' }); continue; }
    if (d === 7)  { rows.push({ date: '07/05/2026', weekday: dow, in: '08:55', out: '17:18', hours: 7.4, late: 0,  status: 'short' }); continue; }
    const inMin = 30 + Math.floor(Math.random() * 20);  // 8:30-8:50
    const inH = '08:' + String(inMin).padStart(2, '0');
    const outH = '18:' + String(5 + Math.floor(Math.random() * 30)).padStart(2, '0');
    const hours = +(8 + Math.random() * 1.4).toFixed(1);
    rows.push({ date: `${String(d).padStart(2, '0')}/05/2026`, weekday: dow, in: inH, out: outH, hours, late: 0, status: 'full' });
  }
  return rows;
};

const HISTORY = buildHistory();

const TK_STATUS_META = {
  full:    { label: 'Đủ công',  color: 'hsl(160 60% 50%)', bg: 'hsl(160 60% 88%)' },
  late:    { label: 'Đi muộn',  color: 'hsl(38 92% 50%)',  bg: 'hsl(38 92% 92%)' },
  short:   { label: 'Thiếu giờ', color: 'hsl(0 65% 60%)',  bg: 'hsl(0 65% 94%)' },
  leave:   { label: 'Nghỉ',     color: 'hsl(265 55% 60%)', bg: 'hsl(265 55% 95%)' },
  weekend: { label: 'Cuối tuần', color: 'hsl(220 14% 75%)',bg: 'hsl(220 14% 95%)' },
  empty:   { label: '—',        color: 'hsl(var(--border))',bg: 'hsl(var(--muted))' },
};

const TimekeepingCalendar = ({ year = 2026, month = 4 }) => {
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1);
  const startWeekday = (firstDay.getDay() + 6) % 7;
  const monthName = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'][month];

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push({ blank: true });
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${String(d).padStart(2, '0')}/05/2026`;
    const hist = HISTORY.find(h => h.date === dateStr);
    const status = hist ? hist.status : (d > 22 ? 'empty' : 'empty');
    cells.push({ d, status, hist });
  }
  while (cells.length % 7) cells.push({ blank: true });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="section-title">{monthName} {year}</h4>
        <div className="flex items-center gap-0.5">
          <button className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"><Icon.ChevronRight size={12} className="rotate-180" /></button>
          <button className="h-7 px-2 text-[11px] rounded-md hover:bg-muted text-foreground font-medium">Hôm nay</button>
          <button className="h-7 w-7 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground"><Icon.ChevronRight size={12} /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(d => (
          <div key={d} className="text-[10.5px] uppercase font-semibold tracking-wider text-muted-foreground text-center py-1">{d}</div>
        ))}
        {cells.map((c, i) => {
          if (c.blank) return <div key={i} />;
          const meta = TK_STATUS_META[c.status];
          const isToday = c.d === 22;
          return (
            <div
              key={i}
              title={c.hist ? `${c.date}: ${meta.label}${c.hist.in ? ` (${c.hist.in}–${c.hist.out})` : ''}` : meta.label}
              className={'aspect-square rounded-md p-1.5 text-center cursor-pointer transition-all hover:scale-[1.05] relative ' +
                (isToday ? 'ring-1 ring-primary ring-offset-1 ring-offset-background' : '')}
              style={{
                background: meta.bg,
              }}
            >
              <span className={'text-[11px] tabular-nums font-medium block ' + (isToday ? 'text-primary font-bold' : '')} style={{ color: c.status === 'weekend' || c.status === 'empty' ? 'hsl(var(--muted-foreground))' : meta.color }}>{c.d}</span>
              {c.hist && c.hist.in && (
                <span className="text-[8.5px] font-mono mt-0.5 block" style={{ color: meta.color, opacity: 0.85 }}>{c.hist.hours}h</span>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/60 text-[11px] text-muted-foreground">
        {[['full', 'Đủ công'], ['late', 'Muộn'], ['short', 'Thiếu giờ'], ['leave', 'Nghỉ'], ['weekend', 'Cuối tuần']].map(([k, l]) => (
          <span key={k} className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ background: TK_STATUS_META[k].color }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
};

const PageTimekeeping = () => {
  const [checkinState, setCheckinState] = React.useState('in'); // none | in | out
  const [tab, setTab] = React.useState('mine'); // mine | team

  const doCheck = () => setCheckinState(s => s === 'none' ? 'in' : s === 'in' ? 'out' : 'none');

  const workdays = HISTORY.filter(h => h.status === 'full' || h.status === 'late' || h.status === 'short').length;
  const lateDays = HISTORY.filter(h => h.status === 'late').length;
  const leaveDays = HISTORY.filter(h => h.status === 'leave').length;
  const totalHours = HISTORY.reduce((a, h) => a + (h.hours || 0), 0).toFixed(1);
  const avgInTimes = HISTORY.filter(h => h.in).map(h => h.in);
  const lateMinutes = HISTORY.filter(h => h.late).reduce((a, h) => a + h.late, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="HRM · Chấm công"
        title="Chấm công"
        description="Theo dõi thời gian làm việc hàng ngày của bạn và lịch sử trong tháng. Quản lý có thể xem cả nhóm."
        actions={
          <>
            <Btn variant="outline" icon="FileText">Xuất Excel</Btn>
            <Btn variant="outline" icon="Clock">Yêu cầu sửa giờ</Btn>
          </>
        }
      />

      {/* Today check-in card — big, centerpiece */}
      <div className="card-surface overflow-hidden rise" style={{ animationDelay: '40ms' }}>
        <div className="relative grid grid-cols-1 lg:grid-cols-[1.2fr,1fr] gap-0">
          {/* Left: check-in panel */}
          <div className="p-6 relative overflow-hidden">
            <div
              className="absolute -right-12 -top-12 w-48 h-48 rounded-full"
              style={{ background: 'radial-gradient(circle, hsl(var(--primary-h) var(--primary-s) 60% / 0.18), transparent 65%)' }}
            />
            <div className="relative">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Chấm công hôm nay</p>
              <div className="mt-2 flex items-baseline gap-2">
                <h2 className="text-[40px] font-bold font-heading text-foreground tabular-nums leading-none">{new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</h2>
                <span className="text-[14px] text-muted-foreground">Thứ Sáu · 22/05/2026</span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 max-w-md">
                <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">
                    <Icon.LogIn size={12} /> Giờ vào
                  </div>
                  <p className={'text-[24px] font-bold font-heading mt-1 tabular-nums ' + (checkinState === 'none' ? 'text-muted-foreground/60' : 'text-foreground')}>
                    {checkinState === 'none' ? '—' : '08:42'}
                  </p>
                  {checkinState !== 'none' && <p className="text-[11px] text-emerald-600 font-medium">Đúng giờ</p>}
                </div>
                <div className="rounded-xl border border-border/70 bg-muted/30 p-4">
                  <div className="flex items-center gap-2 text-muted-foreground text-[11px] uppercase tracking-wider font-semibold">
                    <Icon.LogOut size={12} /> Giờ ra
                  </div>
                  <p className={'text-[24px] font-bold font-heading mt-1 tabular-nums ' + (checkinState === 'out' ? 'text-foreground' : 'text-muted-foreground/60')}>
                    {checkinState === 'out' ? '18:15' : '—'}
                  </p>
                  {checkinState === 'out' && <p className="text-[11px] text-emerald-600 font-medium">9h 33m làm việc</p>}
                </div>
              </div>

              <div className="mt-6 flex items-center gap-3">
                {checkinState === 'none' && (
                  <Btn variant="primary" icon="LogIn" onClick={doCheck}>Chấm công vào</Btn>
                )}
                {checkinState === 'in' && (
                  <Btn variant="primary" icon="LogOut" onClick={doCheck}>Chấm công ra</Btn>
                )}
                {checkinState === 'out' && (
                  <span className="inline-flex items-center gap-2 px-3 h-9 rounded-md bg-emerald-500/10 text-emerald-600 font-semibold text-[13px]">
                    <Icon.Check size={14} /> Đã hoàn tất hôm nay
                  </span>
                )}
                <Btn variant="ghost" size="sm" onClick={() => setCheckinState('none')}>Đặt lại (demo)</Btn>
              </div>
            </div>
          </div>

          {/* Right: this week strip */}
          <div className="border-l border-border/70 p-6 bg-muted/20">
            <p className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">Tuần này</p>
            <div className="mt-3 grid grid-cols-7 gap-1.5">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d, i) => {
                const dayN = 18 + i;
                const hist = HISTORY.find(h => h.date === `${String(dayN).padStart(2, '0')}/05/2026`);
                const meta = TK_STATUS_META[(hist?.status) || 'empty'];
                const isToday = dayN === 22;
                return (
                  <div key={d} className="text-center">
                    <p className="text-[10px] uppercase font-semibold text-muted-foreground">{d}</p>
                    <div
                      className={'mt-1 aspect-square rounded-lg flex flex-col items-center justify-center transition-transform hover:scale-105 ' +
                        (isToday ? 'ring-2 ring-primary ring-offset-1 ring-offset-card' : '')}
                      style={{ background: meta.bg }}
                    >
                      <span className="text-[13px] font-bold tabular-nums" style={{ color: meta.color }}>{dayN}</span>
                      {hist?.hours && <span className="text-[9px] font-mono" style={{ color: meta.color }}>{hist.hours}h</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-5 space-y-2 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Đã làm tuần này</span>
                <span className="font-bold tabular-nums text-foreground">36.4 / 40 giờ</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <div className="h-full rounded-full" style={{ width: '91%', background: 'linear-gradient(90deg, hsl(var(--primary-h) var(--primary-s) 65%), hsl(var(--primary-h) var(--primary-s) 45%))' }} />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border/60">
                <span className="text-muted-foreground">Tổng tháng</span>
                <span className="font-bold tabular-nums text-foreground">{totalHours} giờ</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Số ngày đi muộn</span>
                <span className={'font-bold tabular-nums ' + (lateDays > 0 ? 'text-amber-600' : 'text-foreground')}>{lateDays}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MiniStat label="Ngày công" value={workdays} sublabel="Tháng 5/2026" accent="green" delay={80} />
        <MiniStat label="Tổng giờ" value={totalHours} sublabel="Mục tiêu 160h" accent="primary" delay={120} />
        <MiniStat label="Tổng phút muộn" value={lateMinutes} sublabel={`${lateDays} ngày`} accent={lateMinutes > 0 ? 'amber' : 'green'} delay={160} />
        <MiniStat label="Ngày nghỉ" value={leaveDays} sublabel="Đã được duyệt" accent="violet" delay={200} />
      </div>

      {/* Tab strip */}
      <div className="border-b border-border/70 flex items-center justify-between">
        <div className="flex gap-7">
          {[{ k: 'mine', l: 'Lịch sử của tôi' }, { k: 'team', l: 'Cả phòng ban' }].map(t => (
            <button key={t.k} onClick={() => setTab(t.k)} data-active={tab === t.k} className="tab-trigger">{t.l}</button>
          ))}
        </div>
        <div className="flex items-center gap-2 pb-1">
          <Select
            value="2026-05"
            onChange={() => {}}
            options={[
              { value: '2026-05', label: 'Tháng 5/2026' },
              { value: '2026-04', label: 'Tháng 4/2026' },
              { value: '2026-03', label: 'Tháng 3/2026' },
            ]}
            width={150}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <SectionCard delay={260} className="lg:col-span-2" title="Lịch tháng">
          <TimekeepingCalendar year={2026} month={4} />
        </SectionCard>

        <SectionCard delay={300} className="lg:col-span-3" title="Lịch sử chấm công"
          action={
            <span className="text-[11.5px] text-muted-foreground">{HISTORY.length} bản ghi · Tháng 5/2026</span>
          }
        >
          <div className="-mx-5 -mb-5">
            <div className="max-h-[480px] overflow-y-auto scrollbar-thin">
              <table className="w-full text-[13px]">
                <thead className="sticky top-0 bg-card z-10">
                  <tr className="bg-muted/40 border-y border-border/70 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
                    <th className="text-left py-2.5 px-5">Ngày</th>
                    <th className="text-left py-2.5 px-3">Giờ vào</th>
                    <th className="text-left py-2.5 px-3">Giờ ra</th>
                    <th className="text-right py-2.5 px-3">Số giờ</th>
                    <th className="text-center py-2.5 px-3">Trạng thái</th>
                    <th className="text-left py-2.5 px-5">Ghi chú</th>
                  </tr>
                </thead>
                <tbody>
                  {[...HISTORY].reverse().map((h, i) => {
                    const meta = TK_STATUS_META[h.status];
                    return (
                      <tr key={i} className="border-b border-border/60 last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 px-5">
                          <span className="font-mono font-medium text-foreground">{h.date}</span>
                          <p className="text-[11px] text-muted-foreground">{['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][h.weekday]}</p>
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums">{h.in || <span className="text-muted-foreground">—</span>}</td>
                        <td className="py-2.5 px-3 font-mono tabular-nums">{h.out || <span className="text-muted-foreground">—</span>}</td>
                        <td className="py-2.5 px-3 text-right font-semibold tabular-nums">{h.hours ?? <span className="text-muted-foreground font-normal">—</span>}{h.hours ? 'h' : ''}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium font-mono"
                            style={{ background: meta.bg, color: meta.color }}>
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: meta.color }} />
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-2.5 px-5 text-muted-foreground text-[12px]">{h.note || h.late > 0 ? `Muộn ${h.late} phút` : ''}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
};

window.PageTimekeeping = PageTimekeeping;
