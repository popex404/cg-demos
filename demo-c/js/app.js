/* ============================================================
   Alelyche Ancestral — App JS
   Carga secciones dinámicamente + inicializa UI + carouseles
   ============================================================ */

const SECTIONS = [
  '01-hero',
  '02-trust-strip',
  '03-pain',
  '04-mecanismo',
  '05-prueba',
  '06-solucion',
  '08-value-stack',
  '09-urgencia',
  '10-garantia',
  '11-faq',
  '12-cta-final',
  '13-footer'
];

(async function loadSections() {
  const root = document.getElementById('sections-root');
  if (!root) return;

  for (const name of SECTIONS) {
    try {
      const res = await fetch(`sections/${name}.html?v=${Date.now()}`);
      if (!res.ok) { console.warn(`Section not found: ${name}`); continue; }
      const html = await res.text();
      root.insertAdjacentHTML('beforeend', html);
    } catch (e) {
      console.warn('Section load error:', name, e);
    }
  }

  initApp();
})();

function initApp() {
  /* Menú hamburguesa (mobile) */
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (burger && mobileMenu) {
    const setMenu = (open) => {
      burger.classList.toggle('open', open);
      mobileMenu.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', String(open));
      mobileMenu.setAttribute('aria-hidden', String(!open));
    };
    burger.addEventListener('click', () => setMenu(!burger.classList.contains('open')));
    mobileMenu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => setMenu(false))
    );
  }

  /* Service tabs */
  document.querySelectorAll('.tab-btn').forEach(b => {
    b.addEventListener('click', () => {
      const t = b.dataset.tab;
      document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      const panel = document.getElementById('tab-' + t);
      if (panel) {
        panel.classList.add('active');
        resetPanelCarousel(panel);
      }
    });
  });

  /* FAQ accordion */
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(x => x.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* Carouseles */
  initCarousels();

  /* Aparición al bajar + números animados */
  initReveal();
  initCounters();
}

/* ===== SCROLL REVEAL + CONTADORES ===== */

const REVEAL_SELECTORS = [
  '.section-header', '.section-header-light',
  '.mec-inner',
  '.pain-grid',                       // contenedor (no las cards: en mobile son carrusel)
  '.testimonios-grid', '.datos-grid',
  '.servicios-intro', '.servicios-tabs',
  '.value-inner',
  '.urgencia-main', '.urgencia-sub', '#urgencia .btn',
  '.garantia-inner',
  '.faq-item',
  '.cta-content',
  '.trust-pill'
].join(',');

function staggerChildren(containerSel, childSel) {
  document.querySelectorAll(containerSel).forEach(c => {
    c.querySelectorAll(childSel).forEach((el, i) => {
      el.style.transitionDelay = (i * 80) + 'ms';
    });
  });
}

function initReveal() {
  const els = [...document.querySelectorAll(REVEAL_SELECTORS)];
  els.forEach(el => el.classList.add('reveal'));
  // Stagger en grupos visibles (no carruseles ocultos)
  staggerChildren('.trust-strip', '.trust-pill');
  staggerChildren('.faq-list', '.faq-item');

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -20px 0px' });

  els.forEach(el => io.observe(el));
}

function initCounters() {
  const nums = document.querySelectorAll('.dato-num');
  const easeOut = t => t * (2 - t);
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      io.unobserve(el);
      const m = el.textContent.trim().match(/^(\D*)(\d+)(\D*)$/);
      if (!m) return;
      const prefix = m[1], target = parseInt(m[2], 10), suffix = m[3];
      const dur = 1200, start = performance.now();
      (function step(now) {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = prefix + Math.round(easeOut(p) * target) + suffix;
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    });
  }, { threshold: 0.4 });

  nums.forEach(el => io.observe(el));
}

/* ===== CAROUSEL HELPERS ===== */

function buildDots(nav, count) {
  const dotsEl = nav.querySelector('.carousel-dots');
  if (!dotsEl) return;
  dotsEl.innerHTML = Array.from({ length: count }, (_, i) =>
    `<span class="carousel-dot${i === 0 ? ' active' : ''}"></span>`
  ).join('');
}

function showSlide(cards, nav, idx) {
  cards.forEach((c, i) => c.classList.toggle('carousel-active', i === idx));
  nav.querySelectorAll('.carousel-dot').forEach((d, i) => d.classList.toggle('active', i === idx));
  nav.dataset.current = String(idx);
}

function bindNav(cards, nav) {
  const prev = nav.querySelector('.carousel-prev');
  const next = nav.querySelector('.carousel-next');
  if (prev) prev.addEventListener('click', () => {
    const cur = +(nav.dataset.current || 0);
    showSlide(cards, nav, (cur - 1 + cards.length) % cards.length);
  });
  if (next) next.addEventListener('click', () => {
    const cur = +(nav.dataset.current || 0);
    showSlide(cards, nav, (cur + 1) % cards.length);
  });
}

function setupCarousel(track, cardSel, nav) {
  if (!track || !nav) return;
  const cards = [...track.querySelectorAll(cardSel)];
  if (!cards.length) return;
  buildDots(nav, cards.length);
  showSlide(cards, nav, 0);
  bindNav(cards, nav);
}

function resetPanelCarousel(panel) {
  const grid = panel.querySelector('.servicios-grid');
  const nav = panel.querySelector('.servicios-carousel-nav');
  if (!grid || !nav) return;
  const cards = [...grid.querySelectorAll('.servicio-card')];
  showSlide(cards, nav, 0);
}

function initCarousels() {
  /* Testimonios */
  setupCarousel(
    document.querySelector('.testimonios-grid'),
    '.testimonio-card',
    document.querySelector('.testimonios-carousel-nav')
  );

  /* Pain — Escucho tu historia */
  setupCarousel(
    document.querySelector('.pain-grid'),
    '.pain-item',
    document.querySelector('.pain-carousel-nav')
  );

  /* Value stack */
  setupCarousel(
    document.querySelector('.value-inner'),
    '.value-block',
    document.querySelector('.value-carousel-nav')
  );

  /* Servicios — un carousel por tab panel */
  document.querySelectorAll('.tab-panel').forEach(panel => {
    setupCarousel(
      panel.querySelector('.servicios-grid'),
      '.servicio-card',
      panel.querySelector('.servicios-carousel-nav')
    );
  });
}
