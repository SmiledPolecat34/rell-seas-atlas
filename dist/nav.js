/* Navigation au clavier et points de section (esprit SpaceX / Apple). */
(() => {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const secs = [...document.querySelectorAll('main section[id], main article[id], main .hero, main .codex-hero')]
    .filter((s, i, a) => a.indexOf(s) === i && !s.classList.contains('catalog-group'));
  if (secs.length < 2) return;
  secs.sort((a, b) => a.offsetTop - b.offsetTop);

  const names = (s) => s.querySelector('h2, h1')?.textContent.trim().slice(0, 40) || s.id;
  const rail = document.createElement('nav');
  rail.className = 'rail';
  rail.setAttribute('aria-label', 'Sections de la page');
  const dots = secs.map((s, i) => {
    const a = document.createElement('a');
    a.href = '#' + (s.id || 'main');
    a.dataset.label = names(s);
    a.setAttribute('aria-label', names(s));
    a.addEventListener('click', (e) => { e.preventDefault(); go(i); });
    rail.appendChild(a);
    return a;
  });
  document.body.appendChild(rail);

  const hint = document.createElement('div');
  hint.className = 'kbd-hint';
  hint.innerHTML = '<kbd>J</kbd><kbd>K</kbd> sections <span>·</span> <kbd>?</kbd> aide';
  document.body.appendChild(hint);

  const help = document.createElement('dialog');
  help.className = 'kbd-help';
  help.innerHTML = `<h2>Raccourcis clavier</h2><dl>
    <div><dt><kbd>J</kbd> / <kbd>↓</kbd></dt><dd>Section suivante</dd></div>
    <div><dt><kbd>K</kbd> / <kbd>↑</kbd></dt><dd>Section précédente</dd></div>
    <div><dt><kbd>Début</kbd> / <kbd>Fin</kbd></dt><dd>Haut / bas de page</dd></div>
    <div><dt><kbd>1</kbd>–<kbd>9</kbd></dt><dd>Aller à la section n°</dd></div>
    <div><dt><kbd>/</kbd></dt><dd>Rechercher (si disponible)</dd></div>
    <div><dt><kbd>?</kbd></dt><dd>Afficher cette aide</dd></div>
    <div><dt><kbd>Échap</kbd></dt><dd>Fermer</dd></div></dl>
    <p class="muted">Les flèches ne sont détournées qu’en dehors des champs et des listes.</p>`;
  document.body.appendChild(help);
  help.addEventListener('click', (e) => { if (e.target === help) help.close(); });

  /* Zones : thème (couleurs) + mouvement des étoiles selon la section visible. */
  const ZONES = {
    actualites: ['news', 'calm', 'Actualités'], acces: ['access', 'calm', 'Accès'],
    factions: ['faction', 'embers', 'Factions'], races: ['race', 'swirl', 'Races'], creation: ['race', 'swirl', 'Races'],
    combat: ['combat', 'embers', 'Combat'], posters: ['combat', 'embers', 'Haki'], haki: ['combat', 'embers', 'Haki'],
    armes: ['forge', 'embers', 'Armes'], 'god-fruits': ['fruit', 'swirl', 'Fruits'],
    exploration: ['sea', 'drift', 'Exploration'], carte: ['sea', 'drift', 'Mers'],
    progression: ['craft', 'calm', 'Progression'], constellation: ['craft', 'calm', 'Métiers'],
    archives: ['news', 'calm', 'Analyses'], medias: ['video', 'calm', 'Médias'], reddit: ['video', 'calm', 'Reddit'],
    build: ['build', 'rain', 'Build'], emplacements: ['build', 'rain', 'Emplacements'],
    xebec: ['build', 'rain', 'Builds'], shanks: ['build', 'rain', 'Builds'], pve: ['build', 'rain', 'Builds'],
    dossier: ['build', 'rain', 'Dossier'], resources: ['build', 'rain', 'Builds'],
    overview: ['faction', 'calm', 'Factions'], pirates: ['faction', 'drift', 'Pirates'], marines: ['marine', 'rain', 'Marines'], prison: ['marine', 'rain', 'Prisons'], impel: ['marine', 'rain', 'Impel Down'],
    revolution: ['combat', 'embers', 'Révolution'], government: ['gov', 'calm', 'Gouvernement'], hunters: ['forge', 'swirl', 'Primes'],
    systems: ['sea', 'drift', 'Systèmes'],
    metiers: ['craft', 'calm', 'Métiers'], chaine: ['craft', 'calm', 'Chaîne'], peche: ['sea', 'drift', 'Pêche'], cuisine: ['video', 'swirl', 'Cuisine'],
    artisanat: ['forge', 'embers', 'Artisanat'], bois: ['craft', 'calm', 'Bois'], minage: ['forge', 'embers', 'Minage'], navigation: ['sea', 'drift', 'Navigation'],
    vol: ['gov', 'calm', 'Vol'], medecin: ['fruit', 'swirl', 'Médecin'], dex: ['news', 'calm', 'Dex'], combos: ['build', 'rain', 'Choisir'], 'sources-metiers': ['news', 'calm', 'Sources'],
    creator: ['build', 'rain', 'Créateur'], saved: ['craft', 'calm', 'Mes builds'], review: ['faction', 'swirl', 'Retour'], choisir: ['news', 'calm', 'Choisir'], verifier: ['news', 'calm', 'Sources'],
  };
  const root = document.documentElement;
  const chip = document.createElement('div');
  chip.className = 'zone-chip';
  chip.setAttribute('aria-hidden', 'true');
  document.body.appendChild(chip);
  function setZone(el) {
    const z = ZONES[el.id] || ['', 'calm', ''];
    if (z[0]) root.dataset.zone = z[0]; else delete root.dataset.zone;
    root.dataset.motion = z[1];
    chip.textContent = z[2];
    chip.style.opacity = z[2] ? 1 : 0;
  }
  setZone(secs[0]);

  let cur = 0;
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { cur = secs.indexOf(en.target); dots.forEach((d, i) => d.classList.toggle('on', i === cur)); setZone(en.target); } });
  }, { rootMargin: '-45% 0px -50% 0px' });
  secs.forEach((s) => io.observe(s));
  dots[0].classList.add('on');

  function go(i) {
    i = Math.max(0, Math.min(secs.length - 1, i));
    cur = i;
    dots.forEach((d, n) => d.classList.toggle('on', n === i));
    secs[i].scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    history.replaceState(null, '', secs[i].id ? '#' + secs[i].id : location.pathname);
  }

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const t = e.target;
    const typing = t.closest('input, textarea, select, [contenteditable], dialog[open]') || t.tagName === 'SUMMARY' || t.tagName === 'BUTTON';
    if (e.key === '?' && !t.closest('input, textarea, select')) { e.preventDefault(); help.open ? help.close() : help.showModal(); return; }
    if (typing && !(e.key === 'Escape')) return;
    const k = e.key.toLowerCase();
    if (k === 'j' || e.key === 'ArrowDown' && e.shiftKey) { e.preventDefault(); go(cur + 1); }
    else if (k === 'k' || e.key === 'ArrowUp' && e.shiftKey) { e.preventDefault(); go(cur - 1); }
    else if (e.key === 'Home') { e.preventDefault(); go(0); }
    else if (e.key === 'End') { e.preventDefault(); go(secs.length - 1); }
    else if (/^[1-9]$/.test(e.key) && secs[+e.key - 1]) { e.preventDefault(); go(+e.key - 1); }
    else if (e.key === '/') { const q = document.querySelector('input[type=search], .catalog-controls input'); if (q) { e.preventDefault(); q.focus(); } }
  });
})();
