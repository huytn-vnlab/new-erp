/* Landing page — faithful port of the original app/pages/index.vue */

const LP_KPIS = [
  { label: 'Users', color: '#109cf1', path: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  { label: 'Check', color: '#10b981', path: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  { label: 'Chart', color: '#f59e0b', path: 'M18 20V10 M12 20V4 M6 20v-6' },
  { label: 'Globe', color: '#8b5cf6', path: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M2 12h20 M12 2a15 15 0 0 1 0 20 M12 2a15 15 0 0 0 0 20' },
];
const LP_BARS = [38, 62, 48, 78, 55, 88, 70];
const LP_BAR_COLORS = ['#109cf1', '#1e88e5', '#42a5f5', '#109cf1', '#1565c0', '#42a5f5', '#1e88e5'];
const LP_CHIPS = ['Triển khai nhanh', 'Hỗ trợ 24/7', 'Đa ngôn ngữ', 'Cập nhật liên tục'];
const LP_WHY = ['Ứng dụng toàn diện all-in-one', 'Phù hợp nhất với các mô hình doanh nghiệp vừa và nhỏ', 'Khả năng tích hợp & mở rộng', 'Chi phí hợp lí'];
const LP_MODULES = [
  { title: 'Quản trị nhân sự', color: '#109cf1', paths: ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'], circles: [{ cx: 9, cy: 7, r: 4 }], items: ['Quản trị thành viên', 'Quản trị tài sản', 'Quản trị hợp đồng', 'Nghỉ phép', 'Chấm công'] },
  { title: 'Quản trị mục tiêu', color: '#1565c0', paths: ['M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z', 'M12 6a6 6 0 1 0 0 12A6 6 0 0 0 12 6z'], circles: [{ cx: 12, cy: 12, r: 2 }], items: ['Quản trị đánh giá', 'Quản trị theo OKR', 'Quản trị theo KPI'] },
  { title: 'Quản trị đào tạo', color: '#0288d1', paths: ['M22 10v6M2 10l10-5 10 5-10 5z', 'M6 12v5c3 3 9 3 12 0v-5'], circles: [], items: ['Quản trị tài liệu', 'Quản trị khóa học', 'Quản trị tuyển dụng'] },
  { title: 'Luồng công việc', color: '#0097a7', paths: ['M13 2L3 14h9l-1 8 10-12h-9l1-8z'], circles: [], items: ['Quản lí yêu cầu OT', 'Quản lí đề xuất', 'Phê duyệt tự động'] },
  { title: 'Quản lí tài chính', color: '#00838f', paths: ['M23 6L13.5 15.5 8.5 10.5 1 18', 'M17 6h6v6'], circles: [], items: ['Quản lí ngân sách', 'Báo cáo tài chính', 'Quản lí nội bộ'] },
  { title: 'Báo cáo & Thống kê', color: '#1976d2', paths: ['M18 20V10', 'M12 20V4', 'M6 20v-6'], circles: [], items: ['Dashboard thời gian thực', 'Báo cáo tự động', 'Phân tích xu hướng'] },
];
const LP_PARTNERS = ['assets/logo_footer_1.png', 'assets/logo_footer_2.png', 'assets/logo_footer_3.png', 'assets/logo_footer_6.png', 'assets/logo_footer_7.png'];

const LandingScreen = ({ go }) => {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="landing-root">
      <header className={'navbar' + (scrolled ? ' scrolled' : '')}>
        <div className="nav-container">
          <a href="#top" className="nav-logo"><img src="assets/logoheader.png" alt="Micro ERP" className="logo-img" /></a>
          <nav className="nav-links">
            <a href="#about" className="nav-link">Về ERP</a>
            <a href="#modules" className="nav-link">Dịch vụ</a>
            <a href="#pricing" className="nav-link">Báo giá</a>
          </nav>
          <div className="nav-actions">
            <button onClick={() => go('find-org')} className="btn-nav-ghost">Đăng nhập</button>
            <button onClick={() => go('register-org')} className="btn-nav-primary">Đăng kí</button>
          </div>
        </div>
      </header>

      <section className="hero" id="top">
        <div className="hero-grid" />
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-inner">
          <div className="hero-text" data-animate="fade-up">
            <div className="hero-badge"><span className="badge-pulse" />Nền tảng ERP thế hệ mới</div>
            <h1 className="hero-title">Nền tảng quản trị<br /><span className="text-gradient">doanh nghiệp toàn diện</span></h1>
            <p className="hero-subtitle">Giải pháp quản trị doanh nghiệp trong suốt, nhà quản trị có thể nhìn thấy toàn bộ trạng thái của doanh nghiệp theo thời gian thực.</p>
            <div className="hero-cta">
              <button onClick={() => go('register-org')} className="btn-primary-hero">
                Bắt đầu miễn phí
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </button>
              <a href="#about" className="btn-ghost-hero">Tìm hiểu thêm</a>
            </div>
          </div>
          <div className="hero-visual" data-animate="fade-up" style={{ '--delay': '0.2s' }}>
            <div className="dash-mockup">
              <div className="dash-bar">
                <span className="dash-dot red" /><span className="dash-dot yellow" /><span className="dash-dot green" />
                <span className="dash-label">Micro ERP Dashboard</span>
              </div>
              <div className="dash-body">
                <div className="dash-side">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={'dash-nav-item' + (i === 1 ? ' active' : '')}><div className="nav-icon-bar" /></div>
                  ))}
                </div>
                <div className="dash-main">
                  <div className="dash-kpis">
                    {LP_KPIS.map((kpi) => (
                      <div key={kpi.label} className="kpi-card" style={{ '--accent': kpi.color }}>
                        <div className="kpi-icon"><svg viewBox="0 0 24 24" fill="none" stroke={kpi.color} strokeWidth="2" strokeLinecap="round"><path d={kpi.path} /></svg></div>
                        <div className="kpi-lines"><div className="kpi-line short" /><div className="kpi-line long" /></div>
                      </div>
                    ))}
                  </div>
                  <div className="dash-chart">
                    {LP_BARS.map((h, i) => (
                      <div key={i} className="chart-col" style={{ '--h': h + '%', '--i': i, '--c': LP_BAR_COLORS[i % LP_BAR_COLORS.length] }}><div className="chart-bar-fill" /></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-wave">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg"><path d="M0,40 C240,80 480,10 720,40 C960,70 1200,10 1440,40 L1440,80 L0,80 Z" fill="#f0f7ff" /></svg>
        </div>
      </section>

      <section className="platform-section">
        <div className="platform-dots" />
        <div className="platform-inner" data-animate="fade-up">
          <div className="platform-icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#109cf1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" /></svg>
          </div>
          <h2 className="platform-title">Phần mềm quản trị doanh nghiệp 4.0</h2>
          <p className="platform-desc">Ứng dụng trí tuệ nhân tạo trong việc quản trị doanh nghiệp, thu thập và phân tích dữ liệu nhân sự góp phần hỗ trợ nhà quản trị đưa ra quyết định chính xác.</p>
          <div className="platform-chips">
            {LP_CHIPS.map((chip) => (
              <span key={chip} className="platform-chip">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#109cf1" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="about-section">
        <div className="about-bg-deco" />
        <div className="about-container">
          <div className="about-img-col" data-animate="fade-right">
            <div className="about-img-frame">
              <img src="assets/laptop2.png" alt="Laptop" className="about-img" />
              <div className="about-deco-ring" />
              <div className="about-badge-card">
                <div className="badge-card-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#109cf1" strokeWidth="2" strokeLinecap="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
                </div>
                <div>
                  <div className="badge-card-value">Thời gian thực</div>
                  <div className="badge-card-label">Phân tích tức thì</div>
                </div>
              </div>
            </div>
          </div>
          <div className="about-content-col" data-animate="fade-left">
            <div className="section-eyebrow">Tại sao chọn chúng tôi</div>
            <h2 className="section-heading">Tại sao lựa chọn<br /><span className="text-gradient">Micro ERP</span><br />cho quản trị doanh nghiệp</h2>
            <ul className="why-list">
              {LP_WHY.map((item, i) => (
                <li key={item} className="why-item" style={{ '--delay': i * 0.1 + 's' }} data-animate="fade-up">
                  <div className="why-check"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            <button onClick={() => go('register-org')} className="btn-primary-solid">Tư vấn ngay →</button>
          </div>
        </div>
      </section>

      <section id="modules" className="modules-section">
        <div className="modules-wave-top">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none"><path d="M0,30 C360,60 1080,0 1440,30 L1440,0 L0,0 Z" fill="#fff" /></svg>
        </div>
        <div className="modules-container">
          <div className="section-header" data-animate="fade-up">
            <div className="section-eyebrow">Hệ sinh thái</div>
            <h2 className="section-heading centered">Các module ERP cung cấp</h2>
            <p className="section-sub">Thông dụng cho quản lí doanh nghiệp</p>
          </div>
          <div className="modules-grid">
            {LP_MODULES.map((mod, i) => (
              <div key={mod.title} className="module-card" style={{ '--accent': mod.color, '--delay': i * 0.08 + 's' }} data-animate="fade-up">
                <div className="module-icon-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke={mod.color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="28" height="28">
                    {mod.paths.map((p, pi) => <path key={pi} d={p} />)}
                    {mod.circles.map((c, ci) => <circle key={ci} cx={c.cx} cy={c.cy} r={c.r} />)}
                  </svg>
                </div>
                <h3 className="module-title">{mod.title}</h3>
                <ul className="module-list">
                  {mod.items.map((item) => <li key={item} className="module-list-item"><span className="module-dot" />{item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="detail-section">
        <div className="detail-orb" />
        <div className="detail-grid-overlay" />
        <div className="detail-container">
          <div className="detail-text" data-animate="fade-right">
            <div className="section-eyebrow light">Về nền tảng</div>
            <h2 className="section-heading white">Nền tảng quản trị doanh nghiệp<br />phổ biến nhất</h2>
            <p className="detail-desc">Nền tảng quản trị doanh nghiệp toàn diện và thích ứng với các mô hình kinh doanh. Kế thừa kinh nghiệm từ hàng ngàn doanh nghiệp giúp nâng cao chất lượng quản trị.</p>
            <p className="detail-desc">Tất cả ứng dụng trên Micro ERP có thể sử dụng dễ dàng trên trình duyệt, smartphone (iOS, Android), máy tính bảng. Hỗ trợ đa ngôn ngữ (Tiếng Việt, English) và nâng cấp liên tục.</p>
          </div>
          <div className="detail-img-col" data-animate="fade-left">
            <div className="detail-img-wrap">
              <img src="assets/handshake.png" alt="Partnership" className="detail-img" />
              <div className="detail-img-glow" />
            </div>
          </div>
        </div>
      </section>

      <section className="partners-section" data-animate="fade-up">
        <div className="partners-container">
          <p className="partners-label">Đối tác của chúng tôi</p>
          <div className="partners-track">
            <div className="partners-logos">
              {[...LP_PARTNERS, ...LP_PARTNERS].map((logo, i) => (
                <div key={i} className="partner-item"><img src={logo} alt="Partner" className="partner-logo" /></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="cta-section">
        <div className="cta-wave-top">
          <svg viewBox="0 0 1440 60" preserveAspectRatio="none"><path d="M0,20 C480,60 960,0 1440,20 L1440,0 L0,0 Z" fill="white" /></svg>
        </div>
        <div className="cta-grid" />
        <div className="cta-container" data-animate="fade-up">
          <div className="cta-icon-wrap">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
          </div>
          <h2 className="cta-title">Đăng kí trải nghiệm sản phẩm ERP</h2>
          <p className="cta-desc">Nhấp vào link đăng kí bên dưới để dùng sản phẩm miễn phí</p>
          <button onClick={() => go('register-org')} className="btn-cta">Đăng kí ngay</button>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-container">
          <div className="footer-brand">
            <img src="assets/logoheader.png" alt="Micro ERP" className="footer-logo" />
            <p className="footer-tagline">Nền tảng quản trị doanh nghiệp thế hệ mới</p>
          </div>
          <div className="footer-cols">
            <div className="footer-col">
              <div className="footer-col-title">Sản phẩm</div>
              <a href="#about" className="footer-link">Về ERP</a>
              <a href="#modules" className="footer-link">Dịch vụ</a>
              <a href="#pricing" className="footer-link">Báo giá</a>
            </div>
            <div className="footer-col">
              <div className="footer-col-title">Tài khoản</div>
              <button onClick={() => go('find-org')} className="footer-link">Đăng nhập</button>
              <button onClick={() => go('register-org')} className="footer-link">Đăng kí</button>
            </div>
          </div>
        </div>
        <div className="footer-bottom">© 2026 GMO-Z.com VietNamLab JSC. All Rights Reserved.</div>
      </footer>
    </div>
  );
};

Object.assign(window, { LandingScreen });
