<template>
  <div class="landing-root">

    <!-- ===== NAVBAR ===== -->
    <header class="navbar" :class="{ scrolled: isScrolled }">
      <div class="nav-container">
        <a href="/" class="nav-logo">
          <img :src="logoHeader" alt="Micro ERP" class="logo-img" >
        </a>
        <nav class="nav-links">
          <a href="#about"   class="nav-link">Về ERP</a>
          <a href="#modules" class="nav-link">Dịch vụ</a>
          <a href="#pricing" class="nav-link">Báo giá</a>
        </nav>
        <div class="nav-actions">
          <NuxtLink to="/organization/find-organization" class="btn-nav-ghost">Đăng nhập</NuxtLink>
          <NuxtLink to="/organization/registration" class="btn-nav-primary">Đăng kí</NuxtLink>
        </div>
      </div>
    </header>

    <!-- ===== HERO ===== -->
    <section class="hero">
      <div class="hero-grid" />
      <div class="hero-orb hero-orb-1" />
      <div class="hero-orb hero-orb-2" />

      <div class="hero-inner">
        <div class="hero-text" data-animate="fade-up">
          <div class="hero-badge">
            <span class="badge-pulse" />
            Nền tảng ERP thế hệ mới
          </div>
          <h1 class="hero-title">
            Nền tảng quản trị<br >
            <span class="text-gradient">doanh nghiệp toàn diện</span>
          </h1>
          <p class="hero-subtitle">
            Giải pháp quản trị doanh nghiệp trong suốt, nhà quản trị có thể nhìn
            thấy toàn bộ trạng thái của doanh nghiệp theo thời gian thực.
          </p>
          <div class="hero-cta">
            <NuxtLink to="/organization/registration" class="btn-primary-hero">
              Bắt đầu miễn phí
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </NuxtLink>
            <a href="#about" class="btn-ghost-hero">Tìm hiểu thêm</a>
          </div>
        </div>

        <div class="hero-visual" data-animate="fade-up" style="--delay:0.2s">
          <div class="dash-mockup">
            <div class="dash-bar">
              <span class="dash-dot red"/><span class="dash-dot yellow"/><span class="dash-dot green"/>
              <span class="dash-label">Micro ERP Dashboard</span>
            </div>
            <div class="dash-body">
              <div class="dash-side">
                <div v-for="i in 5" :key="i" class="dash-nav-item" :class="{ active: i === 1 }">
                  <div class="nav-icon-bar"/>
                </div>
              </div>
              <div class="dash-main">
                <div class="dash-kpis">
                  <div v-for="kpi in kpiCards" :key="kpi.label" class="kpi-card" :style="`--accent:${kpi.color}`">
                    <div class="kpi-icon">
                      <svg :viewBox="kpi.viewBox" fill="none" stroke="var(--accent)" stroke-width="2" stroke-linecap="round">
                        <path :d="kpi.path"/>
                      </svg>
                    </div>
                    <div class="kpi-lines">
                      <div class="kpi-line short"/>
                      <div class="kpi-line long"/>
                    </div>
                  </div>
                </div>
                <div class="dash-chart">
                  <div v-for="(h, i) in chartBars" :key="i" class="chart-col" :style="`--h:${h}%;--i:${i};--c:${chartColors[i % chartColors.length]}`">
                    <div class="chart-bar-fill"/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Wave bottom -->
      <div class="hero-wave">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,40 C240,80 480,10 720,40 C960,70 1200,10 1440,40 L1440,80 L0,80 Z" fill="#f0f7ff"/>
        </svg>
      </div>
    </section>

    <!-- ===== PLATFORM ===== -->
    <section class="platform-section">
      <div class="platform-dots"/>
      <div class="platform-inner" data-animate="fade-up">
        <div class="platform-icon-wrap">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#109cf1" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/>
          </svg>
        </div>
        <h2 class="platform-title">Phần mềm quản trị doanh nghiệp 4.0</h2>
        <p class="platform-desc">
          Ứng dụng trí tuệ nhân tạo trong việc quản trị doanh nghiệp, thu thập và phân tích
          dữ liệu nhân sự góp phần hỗ trợ nhà quản trị đưa ra quyết định chính xác.
        </p>
        <div class="platform-chips">
          <span v-for="chip in platformChips" :key="chip" class="platform-chip">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#109cf1" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
            </svg>
            {{ chip }}
          </span>
        </div>
      </div>
    </section>

    <!-- ===== ABOUT ===== -->
    <section id="about" class="about-section">
      <div class="about-bg-deco"/>
      <div class="about-container">
        <div class="about-img-col" data-animate="fade-right">
          <div class="about-img-frame">
            <img :src="laptop2" alt="Laptop" class="about-img" >
            <div class="about-deco-ring"/>
            <div class="about-badge-card">
              <div class="badge-card-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#109cf1" stroke-width="2" stroke-linecap="round">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <div>
                <div class="badge-card-value">Thời gian thực</div>
                <div class="badge-card-label">Phân tích tức thì</div>
              </div>
            </div>
          </div>
        </div>

        <div class="about-content-col" data-animate="fade-left">
          <div class="section-eyebrow">Tại sao chọn chúng tôi</div>
          <h2 class="section-heading">Tại sao lựa chọn<br ><span class="text-gradient">Micro ERP</span><br >cho quản trị doanh nghiệp</h2>
          <ul class="why-list">
            <li v-for="(item, i) in whyItems" :key="item" class="why-item" :style="`--delay:${i*0.1}s`" data-animate="fade-up">
              <div class="why-check">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <span>{{ item }}</span>
            </li>
          </ul>
          <NuxtLink to="/organization/registration" class="btn-primary-solid">Tư vấn ngay →</NuxtLink>
        </div>
      </div>
    </section>

    <!-- ===== MODULES ===== -->
    <section id="modules" class="modules-section">
      <div class="modules-wave-top">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,30 C360,60 1080,0 1440,30 L1440,0 L0,0 Z" fill="#f0f7ff"/>
        </svg>
      </div>
      <div class="modules-container">
        <div class="section-header" data-animate="fade-up">
          <div class="section-eyebrow">Hệ sinh thái</div>
          <h2 class="section-heading centered">Các module ERP cung cấp</h2>
          <p class="section-sub">Thông dụng cho quản lí doanh nghiệp</p>
        </div>
        <div class="modules-grid">
          <div
v-for="(mod, i) in moduleList" :key="mod.title"
               class="module-card"
               :style="`--accent:${mod.color}; --delay:${i*0.08}s`"
               data-animate="fade-up">
            <div class="module-icon-wrap">
              <svg :viewBox="mod.viewBox" fill="none" :stroke="mod.color" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="28" height="28">
                <path v-for="(p, pi) in mod.paths" :key="pi" :d="p" :fill="mod.fill || 'none'"/>
                <circle v-for="(c, ci) in (mod.circles || [])" :key="ci" :cx="c.cx" :cy="c.cy" :r="c.r"/>
              </svg>
            </div>
            <h3 class="module-title">{{ mod.title }}</h3>
            <ul class="module-list">
              <li v-for="item in mod.items" :key="item" class="module-list-item">
                <span class="module-dot" />
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== DETAIL ===== -->
    <section class="detail-section">
      <div class="detail-orb"/>
      <div class="detail-grid-overlay"/>
      <div class="detail-container">
        <div class="detail-text" data-animate="fade-right">
          <div class="section-eyebrow light">Về nền tảng</div>
          <h2 class="section-heading white">Nền tảng quản trị doanh nghiệp<br >phổ biến nhất</h2>
          <p class="detail-desc">
            Nền tảng quản trị doanh nghiệp toàn diện và thích ứng với các mô hình kinh doanh.
            Kế thừa kinh nghiệm từ hàng ngàn doanh nghiệp giúp nâng cao chất lượng quản trị.
          </p>
          <p class="detail-desc">
            Tất cả ứng dụng trên Micro ERP có thể sử dụng dễ dàng trên trình duyệt, smartphone (iOS, Android),
            máy tính bảng. Hỗ trợ đa ngôn ngữ (Tiếng Việt, English) và nâng cấp liên tục.
          </p>
        </div>
        <div class="detail-img-col" data-animate="fade-left">
          <div class="detail-img-wrap">
            <img :src="handshake" alt="Partnership" class="detail-img" >
            <div class="detail-img-glow"/>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== PARTNERS ===== -->
    <section class="partners-section" data-animate="fade-up">
      <div class="partners-container">
        <p class="partners-label">Đối tác của chúng tôi</p>
        <div class="partners-track">
          <div class="partners-logos">
            <div v-for="(logo, i) in [...partnerLogos, ...partnerLogos]" :key="i" class="partner-item">
              <img :src="logo" alt="Partner" class="partner-logo" >
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== CTA ===== -->
    <section id="pricing" class="cta-section">
      <div class="cta-wave-top">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,20 C480,60 960,0 1440,20 L1440,0 L0,0 Z" fill="white"/>
        </svg>
      </div>
      <div class="cta-grid"/>
      <div class="cta-container" data-animate="fade-up">
        <div class="cta-icon-wrap">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h2 class="cta-title">Đăng kí trải nghiệm sản phẩm ERP</h2>
        <p class="cta-desc">Nhấp vào link đăng kí bên dưới để dùng sản phẩm miễn phí</p>
        <NuxtLink to="/organization/registration" class="btn-cta">Đăng kí ngay</NuxtLink>
      </div>
    </section>

    <!-- ===== FOOTER ===== -->
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-brand">
          <img :src="logoHeader" alt="Micro ERP" class="footer-logo" >
          <p class="footer-tagline">Nền tảng quản trị doanh nghiệp thế hệ mới</p>
        </div>
        <div class="footer-cols">
          <div class="footer-col">
            <div class="footer-col-title">Sản phẩm</div>
            <a href="#about"   class="footer-link">Về ERP</a>
            <a href="#modules" class="footer-link">Dịch vụ</a>
            <a href="#pricing" class="footer-link">Báo giá</a>
          </div>
          <div class="footer-col">
            <div class="footer-col-title">Tài khoản</div>
            <NuxtLink to="/organization/find-organization" class="footer-link">Đăng nhập</NuxtLink>
            <NuxtLink to="/organization/registration"      class="footer-link">Đăng kí</NuxtLink>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        © {{ currentYear }} GMO-Z.com VietNamLab JSC. All Rights Reserved.
      </div>
    </footer>

  </div>
</template>

<script setup lang="ts">
import logoHeader from '~/assets/images/logoheader.png'
import laptop2    from '~/assets/images/laptop2.png'
import handshake  from '~/assets/images/handshake.png'
import logoF1     from '~/assets/images/logo_footer_1.png'
import logoF2     from '~/assets/images/logo_footer_2.png'
import logoF3     from '~/assets/images/logo_footer_3.png'
import logoF6     from '~/assets/images/logo_footer_6.png'
import logoF7     from '~/assets/images/logo_footer_7.png'

definePageMeta({ layout: false, middleware: 'guest' })
useHead({ title: 'Micro ERP — Nền tảng quản trị doanh nghiệp toàn diện' })

const currentYear  = useState('year', () => new Date().getFullYear())
const isScrolled   = ref(false)
const partnerLogos = [logoF1, logoF2, logoF3, logoF6, logoF7]

const chartBars   = [38, 62, 48, 78, 55, 88, 70]
const chartColors = ['#109cf1', '#1e88e5', '#42a5f5', '#109cf1', '#1565c0', '#42a5f5', '#1e88e5']

const kpiCards = [
  { label: 'Users', color: '#109cf1', viewBox: '0 0 24 24', path: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z' },
  { label: 'Check', color: '#10b981', viewBox: '0 0 24 24', path: 'M9 11l3 3L22 4 M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11' },
  { label: 'Chart', color: '#f59e0b', viewBox: '0 0 24 24', path: 'M18 20V10 M12 20V4 M6 20v-6' },
  { label: 'Globe', color: '#8b5cf6', viewBox: '0 0 24 24', path: 'M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z M2 12h20 M12 2a15 15 0 0 1 0 20 M12 2a15 15 0 0 0 0 20' },
]

const platformChips = ['Triển khai nhanh', 'Hỗ trợ 24/7', 'Đa ngôn ngữ', 'Cập nhật liên tục']

const whyItems = [
  'Ứng dụng toàn diện all-in-one',
  'Phù hợp nhất với các mô hình doanh nghiệp vừa và nhỏ',
  'Khả năng tích hợp & mở rộng',
  'Chi phí hợp lí',
]

const moduleList: Array<{ title: string; color: string; viewBox: string; paths: string[]; circles: { cx: number; cy: number; r: number }[]; items: string[]; fill?: string }> = [
  {
    title: 'Quản trị nhân sự',
    color: '#109cf1',
    viewBox: '0 0 24 24',
    paths: ['M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2', 'M23 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
    circles: [{ cx: 9, cy: 7, r: 4 }],
    items: ['Quản trị thành viên', 'Quản trị tài sản', 'Quản trị hợp đồng', 'Nghỉ phép', 'Chấm công'],
  },
  {
    title: 'Quản trị mục tiêu',
    color: '#1565c0',
    viewBox: '0 0 24 24',
    paths: ['M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2z', 'M12 6a6 6 0 1 0 0 12A6 6 0 0 0 12 6z'],
    circles: [{ cx: 12, cy: 12, r: 2 }],
    items: ['Quản trị đánh giá', 'Quản trị theo OKR', 'Quản trị theo KPI'],
  },
  {
    title: 'Quản trị đào tạo',
    color: '#0288d1',
    viewBox: '0 0 24 24',
    paths: ['M22 10v6M2 10l10-5 10 5-10 5z', 'M6 12v5c3 3 9 3 12 0v-5'],
    circles: [],
    items: ['Quản trị tài liệu', 'Quản trị khóa học', 'Quản trị tuyển dụng'],
  },
  {
    title: 'Luồng công việc',
    color: '#0097a7',
    viewBox: '0 0 24 24',
    paths: ['M13 2L3 14h9l-1 8 10-12h-9l1-8z'],
    circles: [],
    items: ['Quản lí yêu cầu OT', 'Quản lí đề xuất', 'Phê duyệt tự động'],
  },
  {
    title: 'Quản lí tài chính',
    color: '#00838f',
    viewBox: '0 0 24 24',
    paths: ['M23 6L13.5 15.5 8.5 10.5 1 18', 'M17 6h6v6'],
    circles: [],
    items: ['Quản lí ngân sách', 'Báo cáo tài chính', 'Quản lí nội bộ'],
  },
  {
    title: 'Báo cáo & Thống kê',
    color: '#1976d2',
    viewBox: '0 0 24 24',
    paths: ['M18 20V10', 'M12 20V4', 'M6 20v-6'],
    circles: [],
    items: ['Dashboard thời gian thực', 'Báo cáo tự động', 'Phân tích xu hướng'],
  },
]

onMounted(() => {
  // Navbar scroll
  window.addEventListener('scroll', () => { isScrolled.value = window.scrollY > 30 })

  const allEls = Array.from(document.querySelectorAll('[data-animate]'))

  const revealIfVisible = () => {
    allEls.forEach(el => {
      const rect = el.getBoundingClientRect()
      if (rect.top < window.innerHeight + 80 && !el.classList.contains('is-visible')) {
        el.classList.add('is-visible')
      }
    })
  }

  // Run on next paint — catches all above-fold elements immediately
  requestAnimationFrame(revealIfVisible)
  // Run again slightly later to catch edge cases
  setTimeout(revealIfVisible, 200)

  // Reveal as user scrolls
  window.addEventListener('scroll', revealIfVisible, { passive: true })
})
</script>

<style scoped>
/* ===========================
   RESET & BASE
   =========================== */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
.landing-root {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1a2744;
  overflow-x: hidden;
}

/* Gradient text — blue brand */
.text-gradient {
  background: linear-gradient(135deg, #109cf1 0%, #42a5f5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Section typography */
.section-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #109cf1;
  padding: 0.3rem 0.9rem;
  border: 1px solid rgba(16,156,241,0.25);
  border-radius: 999px;
  background: rgba(16,156,241,0.06);
  margin-bottom: 1rem;
}
.section-eyebrow.light {
  color: #90caf9;
  border-color: rgba(144,202,249,0.3);
  background: rgba(144,202,249,0.1);
}
.section-heading {
  font-size: clamp(1.8rem, 3vw, 2.6rem);
  font-weight: 800;
  line-height: 1.2;
  color: #1a2744;
  margin-bottom: 0.75rem;
}
.section-heading.centered { text-align: center; }
.section-heading.white { color: #fff; }
.section-sub { color: #64748b; font-size: 1rem; text-align: center; margin-bottom: 0; }

/* ===========================
   SCROLL ANIMATIONS
   =========================== */
[data-animate] {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
  transition-delay: var(--delay, 0s);
}
[data-animate="fade-right"] { transform: translateX(-28px); }
[data-animate="fade-left"]  { transform: translateX(28px); }
[data-animate="fade-up"]    { transform: translateY(24px); }
[data-animate].is-visible   { opacity: 1; transform: translate(0, 0); }

/* ===========================
   NAVBAR
   =========================== */
.navbar {
  position: fixed; top: 0; left: 0; right: 0; z-index: 200;
  padding: 0 2rem;
  transition: background 0.35s, box-shadow 0.35s, backdrop-filter 0.35s;
}
.navbar.scrolled {
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(14px);
  box-shadow: 0 1px 0 rgba(0,0,0,0.07);
}
.nav-container {
  max-width: 1160px; margin: 0 auto;
  display: flex; align-items: center; justify-content: space-between;
  height: 66px;
}
.logo-img { height: 34px; display: block; }
.nav-links { display: flex; gap: 0.2rem; }
.nav-link {
  color: rgba(255,255,255,0.88); font-size: 0.9rem; font-weight: 500;
  padding: 0.45rem 1rem; border-radius: 8px; text-decoration: none;
  transition: background 0.15s;
}
.nav-link:hover { background: rgba(255,255,255,0.12); }
.scrolled .nav-link { color: #374151; }
.scrolled .nav-link:hover { background: #f1f5f9; }
.nav-actions { display: flex; align-items: center; gap: 0.75rem; }
.btn-nav-ghost {
  color: rgba(255,255,255,0.88); font-size: 0.9rem; font-weight: 500;
  padding: 0.45rem 1rem; border-radius: 8px; text-decoration: none;
  transition: background 0.15s;
}
.btn-nav-ghost:hover { background: rgba(255,255,255,0.12); }
.scrolled .btn-nav-ghost { color: #374151; }
.scrolled .btn-nav-ghost:hover { background: #f1f5f9; }
.btn-nav-primary {
  background: #fff; color: #1565c0; font-size: 0.9rem; font-weight: 700;
  padding: 0.5rem 1.25rem; border-radius: 8px; text-decoration: none;
  box-shadow: 0 2px 10px rgba(0,0,0,0.15);
  transition: transform 0.15s, box-shadow 0.15s;
}
.btn-nav-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 18px rgba(0,0,0,0.2); }
.scrolled .btn-nav-primary { background: #109cf1; color: #fff; box-shadow: 0 2px 12px rgba(16,156,241,0.4); }

/* ===========================
   HERO
   =========================== */
.hero {
  position: relative;
  min-height: 100vh;
  background: linear-gradient(150deg, #0d2b5e 0%, #1565c0 55%, #1e88e5 100%);
  display: flex; flex-direction: column;
  padding-bottom: 0; overflow: hidden;
}
/* Dot grid */
.hero-grid {
  position: absolute; inset: 0; pointer-events: none;
  background-image: radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px);
  background-size: 36px 36px;
}
/* Glowing orbs */
.hero-orb {
  position: absolute; border-radius: 50%; filter: blur(90px); pointer-events: none;
  animation: orb-float 7s ease-in-out infinite;
}
.hero-orb-1 { width: 480px; height: 480px; background: rgba(66,165,245,0.3); top: -120px; left: -80px; animation-delay: 0s; }
.hero-orb-2 { width: 360px; height: 360px; background: rgba(21,101,192,0.4); bottom: 60px; right: -60px; animation-delay: 3s; }
@keyframes orb-float {
  0%, 100% { transform: translate(0,0); }
  50%       { transform: translate(20px, -20px); }
}

.hero-inner {
  flex: 1;
  max-width: 1160px; margin: 0 auto; padding: 140px 2rem 80px;
  display: flex; align-items: center; gap: 4rem;
  position: relative; z-index: 2;
}
.hero-text { flex: 1; max-width: 520px; }
.hero-badge {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.3);
  color: #e0f0ff; font-size: 0.8rem; font-weight: 600;
  padding: 0.4rem 1rem; border-radius: 999px; margin-bottom: 1.5rem;
  backdrop-filter: blur(8px);
}
.badge-pulse {
  width: 7px; height: 7px; background: #64dfdf; border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}
@keyframes pulse-dot {
  0%, 100% { transform: scale(1); opacity: 1; box-shadow: 0 0 0 0 rgba(100,223,223,0.6); }
  50%       { transform: scale(1.15); opacity: 0.8; box-shadow: 0 0 0 5px rgba(100,223,223,0); }
}
.hero-title {
  font-size: clamp(2.2rem, 4vw, 3.4rem); font-weight: 900; line-height: 1.14;
  color: #fff; margin-bottom: 1.25rem;
}
.hero-subtitle {
  color: rgba(255,255,255,0.75); font-size: 1.05rem; line-height: 1.8; margin-bottom: 2.25rem;
}
.hero-cta { display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; }
.btn-primary-hero {
  display: inline-flex; align-items: center; gap: 0.5rem;
  background: #fff; color: #1565c0; font-weight: 700; font-size: 0.95rem;
  padding: 0.85rem 1.9rem; border-radius: 10px; text-decoration: none;
  box-shadow: 0 4px 20px rgba(0,0,0,0.2);
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-primary-hero:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,0,0,0.25); }
.btn-ghost-hero {
  color: rgba(255,255,255,0.8); font-size: 0.95rem; font-weight: 500;
  text-decoration: none; border-bottom: 1px solid rgba(255,255,255,0.35);
  padding-bottom: 2px; transition: color 0.15s, border-color 0.15s;
}
.btn-ghost-hero:hover { color: #fff; border-color: #fff; }

/* Dashboard mockup */
.hero-visual { flex: 1; display: flex; justify-content: center; }
.dash-mockup {
  width: 100%; max-width: 500px;
  background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.15);
  border-radius: 14px; backdrop-filter: blur(12px);
  box-shadow: 0 30px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.05);
  overflow: hidden;
}
.dash-bar {
  display: flex; align-items: center; gap: 0.4rem;
  padding: 0.65rem 1rem; background: rgba(255,255,255,0.05);
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.dash-dot { width: 10px; height: 10px; border-radius: 50%; }
.dash-dot.red    { background: #ef4444; }
.dash-dot.yellow { background: #f59e0b; }
.dash-dot.green  { background: #22c55e; }
.dash-label { color: rgba(255,255,255,0.35); font-size: 0.72rem; margin-left: 0.4rem; }
.dash-body  { display: flex; height: 260px; }
.dash-side  {
  width: 48px; background: rgba(255,255,255,0.03);
  border-right: 1px solid rgba(255,255,255,0.06);
  padding: 0.75rem 0.5rem; display: flex; flex-direction: column; gap: 0.55rem;
}
.dash-nav-item {
  height: 30px; border-radius: 6px; background: rgba(255,255,255,0.07);
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s;
}
.dash-nav-item.active { background: rgba(16,156,241,0.4); }
.nav-icon-bar { width: 18px; height: 2px; background: rgba(255,255,255,0.35); border-radius: 1px; }
.dash-main { flex: 1; padding: 0.9rem; display: flex; flex-direction: column; gap: 0.9rem; }
.dash-kpis { display: grid; grid-template-columns: repeat(4,1fr); gap: 0.5rem; }
.kpi-card {
  background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1);
  border-radius: 8px; padding: 0.6rem 0.5rem;
  border-top: 2px solid var(--accent);
  transition: background 0.2s;
}
.kpi-icon { width: 18px; height: 18px; margin-bottom: 0.4rem; }
.kpi-icon svg { width: 100%; height: 100%; }
.kpi-lines { display: flex; flex-direction: column; gap: 3px; }
.kpi-line { height: 3px; border-radius: 2px; background: rgba(255,255,255,0.12); }
.kpi-line.short { width: 50%; }
.kpi-line.long  { width: 80%; }
.dash-chart {
  flex: 1; display: flex; align-items: flex-end; gap: 5px;
  background: rgba(255,255,255,0.03); border-radius: 8px; padding: 0.6rem;
}
.chart-col { flex: 1; display: flex; flex-direction: column; justify-content: flex-end; }
.chart-bar-fill {
  width: 100%; height: var(--h); border-radius: 4px 4px 0 0;
  background: var(--c); opacity: 0.8;
  animation: bar-grow 0.7s ease-out calc(var(--i) * 0.08s) both;
}
@keyframes bar-grow {
  from { height: 0; }
  to   { height: var(--h); }
}

/* Wave */
.hero-wave { position: relative; z-index: 2; margin-top: auto; }
.hero-wave svg { display: block; width: 100%; height: 80px; }

/* ===========================
   PLATFORM
   =========================== */
.platform-section {
  background: #f0f7ff;
  padding: 5rem 2rem;
  text-align: center;
  position: relative; overflow: hidden;
}
/* Subtle blue dot bg */
.platform-dots {
  position: absolute; inset: 0; pointer-events: none;
  background-image: radial-gradient(#bfdbfe 1.5px, transparent 1.5px);
  background-size: 30px 30px; opacity: 0.5;
}
.platform-inner { max-width: 680px; margin: 0 auto; position: relative; z-index: 2; }
.platform-icon-wrap {
  display: inline-flex; align-items: center; justify-content: center;
  width: 64px; height: 64px; border-radius: 16px;
  background: linear-gradient(135deg, #e0f2fe, #dbeafe);
  border: 2px solid #bae6fd;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(16,156,241,0.15);
}
.platform-title {
  font-size: clamp(1.5rem, 2.5vw, 2rem); font-weight: 800; color: #1a2744; margin-bottom: 1rem;
}
.platform-desc { color: #475569; line-height: 1.8; margin-bottom: 2rem; font-size: 1rem; }
.platform-chips { display: flex; flex-wrap: wrap; justify-content: center; gap: 0.6rem; }
.platform-chip {
  display: inline-flex; align-items: center; gap: 0.35rem;
  background: #fff; border: 1px solid #bae6fd; color: #1565c0;
  font-size: 0.8rem; font-weight: 600;
  padding: 0.35rem 0.85rem; border-radius: 999px;
  box-shadow: 0 2px 6px rgba(16,156,241,0.1);
}

/* ===========================
   ABOUT
   =========================== */
.about-section {
  background: #fff; padding: 6rem 2rem; position: relative; overflow: hidden;
}
/* Subtle right side accent */
.about-bg-deco {
  position: absolute; top: 0; right: 0; width: 45%; height: 100%;
  background: linear-gradient(180deg, #f0f7ff 0%, #fff 100%);
  clip-path: polygon(15% 0, 100% 0, 100% 100%, 0 100%);
  pointer-events: none;
}
.about-container {
  max-width: 1160px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center;
  position: relative; z-index: 2;
}
.about-img-frame { position: relative; }
.about-img {
  width: 100%; border-radius: 20px;
  box-shadow: 0 20px 60px rgba(21,101,192,0.15), 0 4px 16px rgba(0,0,0,0.08);
}
.about-deco-ring {
  position: absolute; top: -16px; left: -16px; right: 16px; bottom: 16px;
  border: 2px solid #bae6fd; border-radius: 20px; pointer-events: none;
}
.about-badge-card {
  position: absolute; bottom: -20px; right: -20px;
  background: #fff; border-radius: 14px; padding: 0.85rem 1.1rem;
  display: flex; align-items: center; gap: 0.75rem;
  box-shadow: 0 8px 32px rgba(21,101,192,0.15);
  animation: float-badge 3.5s ease-in-out infinite;
}
@keyframes float-badge {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-8px); }
}
.badge-card-icon {
  width: 40px; height: 40px; border-radius: 10px;
  background: linear-gradient(135deg, #e0f2fe, #dbeafe);
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.badge-card-value { font-size: 0.85rem; font-weight: 700; color: #1a2744; }
.badge-card-label { font-size: 0.75rem; color: #64748b; margin-top: 1px; }

.why-list { list-style: none; display: flex; flex-direction: column; gap: 1rem; margin: 1.5rem 0 2rem; }
.why-item { display: flex; align-items: center; gap: 0.9rem; font-size: 0.95rem; color: #374151; font-weight: 500; }
.why-check {
  width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
  background: linear-gradient(135deg, #109cf1, #1565c0);
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 3px 10px rgba(16,156,241,0.35);
}
.btn-primary-solid {
  display: inline-flex; align-items: center;
  background: linear-gradient(135deg, #109cf1, #1565c0);
  color: #fff; font-weight: 700; font-size: 0.95rem;
  padding: 0.85rem 2rem; border-radius: 10px; text-decoration: none;
  box-shadow: 0 4px 20px rgba(16,156,241,0.4);
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-primary-solid:hover { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(16,156,241,0.5); }

/* ===========================
   MODULES
   =========================== */
.modules-section {
  background: #f0f7ff; padding: 5rem 2rem 6rem;
  position: relative; overflow: hidden;
}
.modules-wave-top { position: relative; margin-bottom: 0; line-height: 0; }
.modules-wave-top svg { display: block; width: 100%; height: 60px; }
.modules-container { max-width: 1160px; margin: 0 auto; }
.section-header { text-align: center; margin-bottom: 3rem; }
.modules-grid {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
}
.module-card {
  background: #fff; border-radius: 16px; overflow: hidden;
  border: 1px solid #dbeafe;
  box-shadow: 0 2px 12px rgba(21,101,192,0.06);
  transition: transform 0.25s, box-shadow 0.25s, border-color 0.25s;
}
.module-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 36px rgba(21,101,192,0.14);
  border-color: var(--accent);
}
.module-icon-wrap {
  display: inline-flex; align-items: center; justify-content: center;
  width: 52px; height: 52px; border-radius: 14px; margin: 1.5rem 1.5rem 0;
  background: linear-gradient(135deg, rgba(16,156,241,0.08), rgba(21,101,192,0.12));
  border: 1px solid rgba(16,156,241,0.15);
  box-shadow: 0 3px 10px rgba(16,156,241,0.12);
}
.module-title {
  font-size: 0.95rem; font-weight: 700; color: #1a2744;
  padding: 0.75rem 1.5rem 0;
}
.module-list { padding: 0.75rem 1.5rem 1.5rem; list-style: none; display: flex; flex-direction: column; gap: 0.6rem; }
.module-list-item { display: flex; align-items: center; gap: 0.65rem; font-size: 0.85rem; color: #475569; }
.module-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--accent); flex-shrink: 0; }

/* ===========================
   DETAIL
   =========================== */
.detail-section {
  background: linear-gradient(150deg, #0d2b5e 0%, #1565c0 60%, #1e88e5 100%);
  padding: 6rem 2rem; position: relative; overflow: hidden;
}
.detail-orb {
  position: absolute; width: 600px; height: 600px; border-radius: 50%;
  background: rgba(66,165,245,0.15); filter: blur(120px);
  top: 50%; left: 50%; transform: translate(-50%,-50%); pointer-events: none;
}
.detail-grid-overlay {
  position: absolute; inset: 0; pointer-events: none;
  background-image: radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px);
  background-size: 36px 36px;
}
.detail-container {
  max-width: 1160px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 5rem; align-items: center;
  position: relative; z-index: 2;
}
.detail-desc { color: rgba(255,255,255,0.7); font-size: 0.95rem; line-height: 1.8; margin-top: 1.25rem; }
.detail-img-wrap { position: relative; }
.detail-img { width: 100%; border-radius: 20px; }
.detail-img-glow {
  position: absolute; inset: -20px;
  background: radial-gradient(ellipse, rgba(66,165,245,0.25) 0%, transparent 70%);
  pointer-events: none;
}

/* ===========================
   PARTNERS
   =========================== */
.partners-section { background: #fff; padding: 4rem 2rem; }
.partners-container { max-width: 1160px; margin: 0 auto; }
.partners-label {
  text-align: center; color: #94a3b8; font-size: 0.8rem; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 2.5rem;
}
.partners-track { overflow: hidden; position: relative; }
.partners-track::before,
.partners-track::after {
  content: ''; position: absolute; top: 0; bottom: 0; width: 120px; z-index: 2;
}
.partners-track::before { left: 0;  background: linear-gradient(to right, #fff, transparent); }
.partners-track::after  { right: 0; background: linear-gradient(to left, #fff, transparent); }
.partners-logos {
  display: flex; gap: 3.5rem; width: max-content;
  animation: scroll-logos 22s linear infinite;
}
@keyframes scroll-logos {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.partner-item { display: flex; align-items: center; }
.partner-logo {
  height: 38px; object-fit: contain; opacity: 0.45; filter: grayscale(1);
  transition: opacity 0.25s, filter 0.25s;
}
.partner-logo:hover { opacity: 1; filter: none; }

/* ===========================
   CTA
   =========================== */
.cta-section {
  background: linear-gradient(135deg, #1565c0 0%, #109cf1 60%, #42a5f5 100%);
  padding: 6rem 2rem; text-align: center; position: relative; overflow: hidden;
}
.cta-wave-top { position: relative; top: -6rem; margin-bottom: -5rem; line-height: 0; }
.cta-wave-top svg { display: block; width: 100%; height: 60px; }
.cta-grid {
  position: absolute; inset: 0; pointer-events: none;
  background-image: radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px);
  background-size: 36px 36px;
}
.cta-container { max-width: 580px; margin: 0 auto; position: relative; z-index: 2; }
.cta-icon-wrap {
  display: inline-flex; align-items: center; justify-content: center;
  width: 68px; height: 68px; border-radius: 18px;
  background: rgba(255,255,255,0.15); border: 1px solid rgba(255,255,255,0.3);
  margin-bottom: 1.5rem;
  backdrop-filter: blur(8px);
  animation: icon-bob 3s ease-in-out infinite;
}
@keyframes icon-bob {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-6px); }
}
.cta-title {
  font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 800;
  color: #fff; margin-bottom: 0.75rem; line-height: 1.25;
}
.cta-desc { color: rgba(255,255,255,0.8); font-size: 1rem; margin-bottom: 2.25rem; line-height: 1.6; }
.btn-cta {
  display: inline-flex; align-items: center;
  background: #fff; color: #1565c0; font-weight: 700; font-size: 1rem;
  padding: 0.9rem 2.5rem; border-radius: 10px; text-decoration: none;
  box-shadow: 0 4px 24px rgba(0,0,0,0.2);
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-cta:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.28); }

/* ===========================
   FOOTER
   =========================== */
.footer { background: #0d2b5e; padding: 4rem 2rem 0; }
.footer-container {
  max-width: 1160px; margin: 0 auto;
  display: flex; justify-content: space-between; gap: 3rem;
  padding-bottom: 3rem; border-bottom: 1px solid rgba(255,255,255,0.07);
  flex-wrap: wrap;
}
.footer-logo { height: 30px; margin-bottom: 0.9rem; }
.footer-tagline { color: #475f85; font-size: 0.85rem; max-width: 220px; line-height: 1.6; }
.footer-cols { display: flex; gap: 4rem; }
.footer-col  { display: flex; flex-direction: column; gap: 0.65rem; }
.footer-col-title { color: #64748b; font-size: 0.72rem; font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 0.3rem; }
.footer-link { color: #334d6e; font-size: 0.875rem; text-decoration: none; transition: color 0.15s; }
.footer-link:hover { color: #90caf9; }
.footer-bottom {
  max-width: 1160px; margin: 0 auto;
  padding: 1.5rem 0; color: #2c4166; font-size: 0.78rem;
}

/* ===========================
   RESPONSIVE
   =========================== */
@media (max-width: 1024px) {
  .hero-inner         { flex-direction: column; text-align: center; padding-top: 110px; }
  .hero-cta           { justify-content: center; }
  .hero-visual        { width: 100%; }
  .about-container,
  .detail-container   { grid-template-columns: 1fr; gap: 3rem; }
  .modules-grid       { grid-template-columns: repeat(2, 1fr); }
  .about-bg-deco      { display: none; }
}
@media (max-width: 640px) {
  .modules-grid { grid-template-columns: 1fr; }
  .nav-links    { display: none; }
  .footer-cols  { flex-direction: column; gap: 2rem; }
  .about-badge-card { display: none; }
}
</style>
