/* Menu principal : 6 pages sur une ligne, sections de la page dans un menu déroulant, burger sur mobile. */
(() => {
  const bar = document.querySelector('header.top .bar');
  const nav = bar && bar.querySelector('nav');
  if (!nav) return;

  const PAGES = [['index.html', 'Atlas'], ['codex.html', 'Codex'], ['factions.html', 'Factions'], ['acces.html', 'Accès'], ['metiers.html', 'Métiers'], ['builder.html', 'Créateur'], ['builds.html', 'Builds']];
  const here = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const sections = [...nav.querySelectorAll('a')].filter((a) => (a.getAttribute('href') || '').startsWith('#'));

  nav.textContent = '';
  nav.id = nav.id || 'mainNav';
  nav.classList.add('site-nav');
  PAGES.forEach(([href, label]) => {
    const a = document.createElement('a');
    a.href = href;
    a.textContent = label;
    if (href === here) a.setAttribute('aria-current', 'page');
    nav.append(a);
  });
  bar.querySelectorAll('.official').forEach((n) => n.remove());

  if (sections.length) {
    const d = document.createElement('details');
    d.className = 'nav-sections';
    const s = document.createElement('summary');
    s.textContent = 'Sur cette page';
    const panel = document.createElement('div');
    panel.className = 'nav-sections-panel';
    sections.forEach((a) => { const c = a.cloneNode(true); c.addEventListener('click', () => { d.open = false; bar.classList.remove('open'); }); panel.append(c); });
    d.append(s, panel);
    nav.append(d);
    document.addEventListener('click', (e) => { if (!d.contains(e.target) && !e.target.closest('.nav-toggle') && !matchMedia('(max-width: 900px)').matches) d.open = false; });
  }

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'nav-toggle';
  btn.setAttribute('aria-controls', nav.id);
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<span class="sr">Menu</span><i></i><i></i><i></i>';
  bar.append(btn);
  const mobile = matchMedia('(max-width: 900px)');
  const set = (open) => {
    bar.classList.toggle('open', open); btn.setAttribute('aria-expanded', String(open));
    const d = nav.querySelector('.nav-sections'); if (d && mobile.matches) d.open = open;
  };
  btn.addEventListener('click', () => set(!bar.classList.contains('open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) set(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
})();
