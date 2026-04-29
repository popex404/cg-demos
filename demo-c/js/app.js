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
  /* Header scroll */
  const hdr = document.getElementById('header');
  if (hdr) {
    window.addEventListener('scroll', () => {
      hdr.classList.toggle('scrolled', scrollY > 80);
    }, { passive: true });
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
        if (isMobile()) resetPanelCarousel(panel);
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

  /* Carouseles (mobile) */
  initCarousels();
}

/* ===== CAROUSEL HELPERS ===== */

function isMobile() {
  return window.innerWidth <= 768;
}

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
  if (!isMobile()) return;

  /* Testimonios */
  setupCarousel(
    document.querySelector('.testimonios-grid'),
    '.testimonio-card',
    document.querySelector('.testimonios-carousel-nav')
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
