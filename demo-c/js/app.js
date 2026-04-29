/* ============================================================
   Alelyche Ancestral — App JS
   Carga secciones dinámicamente + inicializa UI
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
      if (panel) panel.classList.add('active');
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
}
