// ── Page Loader ──
function initLoader() {
  const loader = document.getElementById('page-loader');
  if (!loader) return;
  const fill = loader.querySelector('.loader-fill');
  if (fill) setTimeout(() => fill.style.width = '100%', 50);
  const hide = () => setTimeout(() => loader.classList.add('hidden'), 900);
  if (document.readyState === 'complete') { hide(); }
  else { window.addEventListener('load', hide); }
}

// ── Floating Particles ──
function initParticles() {
  const container = document.querySelector('.particles-container');
  if (!container) return;
  const colors  = ['#1a73e8','#60a5fa','#93c5fd','#3b82f6','#bfdbfe'];
  const sizes   = [4,5,6,7,8];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size  = sizes[Math.floor(Math.random() * sizes.length)];
    p.style.cssText = `
      left:${Math.random()*100}%;
      top:${Math.random()*100}%;
      width:${size}px; height:${size}px;
      background:${colors[Math.floor(Math.random()*colors.length)]};
      animation-delay:${Math.random()*5}s;
      animation-duration:${4+Math.random()*5}s;
      opacity:${0.08+Math.random()*0.18};
    `;
    container.appendChild(p);
  }
}

// ── Scroll Reveal ──
function initScrollReveal() {
  const els = document.querySelectorAll('.reveal-section');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        setTimeout(() => e.target.classList.add('visible'), i * 90);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08 });
  els.forEach(el => obs.observe(el));
}

// ── Animated Counters ──
function animateCounter(el, target, prefix = '', suffix = '') {
  let start    = 0;
  const dur    = 1600;
  const steps  = dur / 16;
  const inc    = target / steps;
  el.style.animation = 'countUp 0.6s ease both';
  const timer  = setInterval(() => {
    start = Math.min(start + inc, target);
    el.textContent = prefix + Math.round(start).toLocaleString() + suffix;
    if (start >= target) clearInterval(timer);
  }, 16);
}
function initCounters() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const target = parseInt(e.target.dataset.count || '0');
        const prefix = e.target.dataset.prefix || '';
        const suffix = e.target.dataset.suffix || '';
        animateCounter(e.target, target, prefix, suffix);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('[data-count]').forEach(el => obs.observe(el));
}

// ── Ripple on click ──
function initRipple() {
  document.querySelectorAll(
    '.btn, .btn-primary, .btn-danger, .btn-success, .btn-ghost'
  ).forEach(btn => {
    btn.addEventListener('click', function(e) {
      const rect   = this.getBoundingClientRect();
      const size   = Math.max(rect.width, rect.height);
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position:absolute;
        width:${size}px; height:${size}px;
        left:${e.clientX-rect.left-size/2}px;
        top:${e.clientY-rect.top-size/2}px;
        background:rgba(255,255,255,0.28);
        border-radius:50%;
        pointer-events:none;
        transform:scale(0);
        animation:rippleFx 0.6s ease;
      `;
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

// ── Scroll to top ──
function initScrollTop() {
  const btn = document.getElementById('scroll-top');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 280);
  });
  btn.addEventListener('click', () => {
    window.scrollTo({ top:0, behavior:'smooth' });
  });
}

// ── Smooth page transitions ──
function initPageTransitions() {
  document.body.style.opacity = '0';
  setTimeout(() => { document.body.style.opacity = '1'; }, 50);

  document.querySelectorAll('a[href]').forEach(link => {
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('http') ||
        href.startsWith('javascript') || href.startsWith('mailto')) return;
    link.addEventListener('click', e => {
      e.preventDefault();
      document.body.style.opacity = '0';
      setTimeout(() => { window.location.href = href; }, 320);
    });
  });
}

// ── Slot tooltips ──
function initSlotTooltips() {
  setTimeout(() => {
    document.querySelectorAll('.slot').forEach(slot => {
      const num    = slot.querySelector('.slot-num')?.textContent?.trim() || '';
      const floor  = slot.querySelector('.slot-floor')?.textContent?.trim() || '';
      const isAv   = slot.classList.contains('available');
      if (num) {
        slot.setAttribute('data-tooltip',
          `${num}${floor ? ' · ' + floor : ''} · ${isAv ? '✅ Free' : '🔴 Taken'}`
        );
      }
    });
  }, 800);
}

// ── Active nav link ──
function initNavActive() {
  const path = window.location.pathname.split('/').pop();
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href')?.split('/').pop() || '';
    if (href && path.includes(href.replace('.html', ''))) {
      a.classList.add('active');
    }
  });
}

// ── Table row animation refresh ──
function refreshTableRows() {
  document.querySelectorAll('tbody tr').forEach((row, i) => {
    row.style.animationDelay = `${i * 0.05}s`;
  });
}

// ── Stagger slot animations ──
function refreshSlotAnimations() {
  document.querySelectorAll('.slots-grid .slot').forEach((slot, i) => {
    slot.style.animationDelay = `${i * 0.04}s`;
  });
}

// ── Global showAlert override with animations ──
window.showAlertAnimated = function(id, message, type = 'error') {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.className   = `alert alert-${type}`;
  el.style.display = 'flex';
  el.style.animation = 'none';
  void el.offsetWidth;
  el.style.animation = type === 'success'
    ? 'successBounce 0.4s ease, fadeIn 0.3s ease'
    : 'shake 0.4s ease, fadeIn 0.3s ease';
  clearTimeout(el._hideTimer);
  el._hideTimer = setTimeout(() => {
    el.style.opacity = '0';
    el.style.transition = 'opacity 0.3s ease';
    setTimeout(() => {
      el.style.display = 'none';
      el.style.opacity = '1';
      el.style.transition = '';
    }, 300);
  }, 4000);
};

// ── Spinner helper ──
window.showSpinner = function(btn) {
  if (!btn) return () => {};
  const orig = btn.innerHTML;
  btn.innerHTML = `<span class="loading-spinner"></span> Please wait...`;
  btn.disabled  = true;
  btn.style.opacity = '0.85';
  return () => {
    btn.innerHTML = orig;
    btn.disabled  = false;
    btn.style.opacity = '1';
  };
};

// ── Init all ──
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initParticles();
  initScrollReveal();
  initCounters();
  initRipple();
  initScrollTop();
  initNavActive();
  initPageTransitions();
  initSlotTooltips();
  refreshTableRows();
  refreshSlotAnimations();
});