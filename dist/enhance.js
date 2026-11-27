/* Images et contexte ajoutés aux pages : prisons, mers, races, traits, armes, métiers, grades. */
(() => {
  const ART = 'visuals/art/';
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const norm = (v) => v.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
  const pic = (file, cls, alt = '') => {
    const i = new Image();
    i.src = ART + file + '.svg';
    i.alt = alt;
    i.loading = 'lazy';
    i.decoding = 'async';
    if (cls) i.className = cls;
    return i;
  };
  const photo = (src, fallback, cls, alt = '') => {
    const i = new Image();
    i.src = src; i.alt = alt; i.loading = 'lazy'; i.decoding = 'async';
    if (cls) i.className = cls;
    i.onerror = () => { i.onerror = null; i.src = ART + fallback + '.svg'; i.classList.add('is-art'); };
    return i;
  };
  const RACE_WIKI = { human: 'human', 'three-eyes': 'three-eyes', avalonian: 'avalonian', lunarian: 'lunars', oni: 'oni', giant: 'giant', cyborg: 'cyborg', beastman: 'beastman', marinian: 'marinian', dwarf: 'dwarf' };
  const racePhoto = (key, cls) => photo('visuals/wiki/races/' + RACE_WIKI[key] + '.webp', 'race-' + key, cls);
  const slug = (t) => t.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };

  /* ---------- Bannières sur les fiches .dcard ---------- */
  const DCARD = [
    [/^forestis/, 'sea-forestis', 'F'], [/^motley/, 'sea-motley', 'M'], [/^shrouded/, 'sea-shrouded', 'S'], [/^desolate/, 'sea-desolate', 'D'],
    [/^sunken/, 'sea-sunken', 'S'], [/^molten/, 'sea-molten', 'M'], [/^uncharted/, 'sea-uncharted', 'U'],
    [/palier 1/, 'prison-stocks'], [/palier 2/, 'prison-cell'], [/palier 3/, 'prison-camp'], [/palier 4/, 'prison-platform'], [/palier 5/, 'prison-hades'],
    [/^pirates$/, 'faction-pirates'], [/^marines$/, 'faction-marines'], [/^revolutionnaires$/, 'faction-revolution'], [/^gouvernement/, 'faction-government'], [/^chasseurs/, 'faction-hunters'],
    [/^human(ain)?$/, 'race-human', '', 1], [/^(trois yeux|three eyes)/, 'race-three-eyes', '', 1], [/^avalonian?|^avalonien/, 'race-avalonian', '', 1], [/^(lunaria|lunars?|lunarian)/, 'race-lunarian', '', 1], [/^oni$/, 'race-oni', '', 1],
    [/^(geant|giant)/, 'race-giant', '', 1], [/^cyborg/, 'race-cyborg', '', 1], [/^(homme-bete|beastman)/, 'race-beastman', '', 1], [/^(marinien|marinian)/, 'race-marinian', '', 1], [/^(nain|dwarf)/, 'race-dwarf', '', 1],
  ];
  $$('.dcard').forEach((card) => {
    const h = card.querySelector('h3');
    if (!h || card.querySelector('.dcard-art')) return;
    const key = norm(h.textContent);
    const hit = DCARD.find(([re]) => re.test(key));
    if (!hit) return;
    const wrap = el('div', 'dcard-art' + (hit[3] ? ' portrait' : ''));
    wrap.append(hit[3] ? racePhoto(hit[1].replace('race-', ''), '', ) : pic(hit[1], '', h.textContent.trim()));
    if (hit[2]) wrap.append(el('span', 'art-initial', hit[2]));
    card.prepend(wrap);
    card.classList.add('has-art');
  });

  /* ---------- Mers : noms, initiales, royaumes ---------- */
  const SEA = {
    forestis: ['Latin médiéval forestis, « terrain à l’écart » : l’origine du mot forêt.', 'Mer 1 · Ember Pirates, Ivory Smiths (relevé de fans)', '57 sites de trésor au journal'],
    motley: ['Motley : l’habit bariolé du bouffon, donc hétéroclite.', 'Mer 2 · Jade Moon, Sunset Fury (relevé de fans)', '66 sites de trésor au journal'],
    shrouded: ['Shroud : un linceul, ce qui enveloppe et cache.', 'Groupes locaux non relevés', 'Mer 3 et 84 sites ? rapprochement à vérifier'],
    desolate: ['Latin desolatus : laissé seul, abandonné.', 'Groupes locaux non relevés', 'Mer 4 et 122 sites ? lien à vérifier'],
    sunken: ['Participe de sink : ce qui a coulé.', 'Groupes locaux non relevés', 'Vue dans le clip de démonstration à 0:50'],
    molten: ['Participe de melt : fondu, en fusion.', 'Groupes locaux non relevés', 'Aucun compteur relevé'],
    uncharted: ['Absent des cartes marines : « non cartographié ».', 'Groupes locaux non relevés', 'Statut incertain : mer ou zone spéciale'],
  };
  $$('.dcard.has-art').forEach((card) => {
    const k = norm(card.querySelector('h3').textContent).split(' ')[0];
    if (!SEA[k] || card.querySelector('.sea-facts')) return;
    const [ety, gr, sites] = SEA[k];
    card.append(el('dl', 'sea-facts',
      '<div><dt>Origine du nom</dt><dd>' + ety + '</dd></div><div><dt>Royaumes et groupes</dt><dd>' + gr + '</dd></div><div><dt>Journal</dt><dd>' + sites + '</dd></div>'));
  });

  const seasAnchor = $$('#carte h3').find((h) => /Théorie des mers/.test(h.textContent));
  if (seasAnchor && !$$('.names-lab').length) {
    const lab = el('div', 'names-lab');
    lab.innerHTML = `
      <h3 class="sub-h">Noms, initiales et royaumes<small>lecture des noms</small></h3>
      <p class="muted">Ce que les sources et les noms eux-mêmes permettent de dire sur les noms de famille, les initiales de titre et les royaumes. Rien n’est confirmé par les développeurs.</p>
      <div class="lab-grid">
        <article class="lab-card"><h4>Initiales des sept mers</h4>
          <div class="initials" aria-label="F, M, S, D, S, M, U"><b>F</b><b>M</b><b>S</b><b>D</b><b>S</b><b>M</b><b>U</b></div>
          <p>Deux S et deux M : l’initiale seule ne suffit pas à reconnaître une mer. Forestis et Motley sont les seules reliées à des compteurs sûrs (Mer 1 et Mer 2).</p></article>
        <article class="lab-card"><h4>Titres et noms de personnage</h4>
          <p>Un relevé Reddit indique que les traits viennent du Randomize ou, pour certains noms, d’une quête. Les bonus rapportés touchent les <strong>royaumes</strong>, l’XP et certaines classes d’armes. La quatrième case Max-Potential, Extra / Title, dépendrait du titre obtenu.</p>
          <p class="muted">Le relevé n’explique pas ce que sont ces « royaumes ». Ne pas les confondre avec les sous-espèces royales (King, Queen, Royalty) des races.</p></article>
        <article class="lab-card"><h4>Familles de noms des cartes</h4>
          <ul class="fam">
            <li><b>Armement</b> chevaliers et héros : Sir Galahad, Gawain, Lancelot, Percival, Sigurd.</li>
            <li><b>Observation</b> savants : Opp E. Heimer, New D. ton, Ein S. Tein, Dar D. Win, Tom E. Dison.</li>
            <li><b>Rois</b> conquérants : Alexander, Julius C. Zar, Geng D. Khan, Nap O. Leon, Hannibal.</li>
            <li><b>Agile, Fierce, Tactic</b> noms de techniques : Flash Dash, Faster Punch, Parry God.</li>
          </ul>
          <p class="muted">Le motif « X D. Y » revient six fois (Xanda D. Goat, Alexander D. Great, Geng D. Khan, Go D. Zilla, New D. ton, Dar D. Win) : un clin d’œil, sans effet connu.</p></article>
      </div>`;
    seasAnchor.before(lab);
  }

  /* ---------- Armes : tuiles avec icône ---------- */
  const WEAPON_ICON = [
    [/katana/, 'katana'], [/great ?sword|greatsword/, 'greatsword'], [/axe|cleaver|bisento/, 'axe'], [/trident/, 'trident'], [/spear/, 'spear'],
    [/bazooka|gatling|cannon/, 'cannon'], [/blunderbuss|flintlock|gun/, 'gun'], [/crossbow|bow/, 'crossbow'], [/cane/, 'cane'], [/guitar/, 'guitar'],
    [/staff|pipe/, 'staff'], [/mace|hammer/, 'mace'], [/sickle/, 'sickle'], [/chakram/, 'chakram'], [/hook/, 'hook'], [/\bsaw\b/, 'saw'], [/dagger/, 'dagger'],
    [/shield/, 'shield'], [/sword|cutlass|rapier|fanblade|scimitar|curved/, 'sword'],
  ];
  const weaponIcon = (name) => (WEAPON_ICON.find(([re]) => re.test(name.toLowerCase())) || [0, 'sword'])[1];
  $$('#armes ul.chips').forEach((ul) => {
    const items = $$('li', ul);
    if (items.length < 4 || ul.classList.contains('wp-grid')) return;
    const plan = items.filter((li) => /blueprint/i.test(li.textContent)).length > items.length / 2;
    const gtxt = (ul.previousElementSibling?.textContent || '').trim();
    const prefix = /^Leviathan/.test(gtxt) ? 'leviathan-' : /^Sea Cow/.test(gtxt) ? 'sea-cow-' : '';
    ul.classList.add('wp-grid');
    items.forEach((li) => {
      const name = li.textContent.trim();
      li.textContent = '';
      li.classList.add('wp');
      const icon = weaponIcon(name);
      li.append(plan ? pic('weapon-' + icon, 'wp-ico is-art') : photo('visuals/wiki/weapons/' + prefix + slug(name) + '.webp', 'weapon-' + icon, 'wp-ico wp-photo'));
      li.append(el('span', '', name.replace(/ Blueprint$/i, '')));
      if (plan || /blueprint/i.test(name)) li.append(el('em', '', 'Plan'));
    });
  });
  const CLASS_ICON = { light: 'dagger', medium: 'sword', heavy: 'axe', 'ranged / gunsman': 'gun' };
  $$('table.data').forEach((t) => {
    const first = norm(t.querySelector('th')?.textContent || '');
    if (first === 'classe') $$('tbody tr', t).forEach((tr) => {
      const c = tr.firstElementChild; const ic = CLASS_ICON[norm(c.textContent)];
      if (ic) c.prepend(pic('weapon-' + ic, 'cell-ico'));
    });
  });

  /* ---------- Main Traits : icônes ---------- */
  const TRAIT_ICON = { health: 'health', endurance: 'endurance', defense: 'defense', spiritual: 'spiritual', 'will-power': 'will-power', luck: 'luck' };
  $$('table.data').forEach((t) => {
    if (norm(t.querySelector('th')?.textContent || '') !== 'main trait') return;
    $$('tbody tr', t).forEach((tr) => {
      const c = tr.firstElementChild; const k = TRAIT_ICON[norm(c.textContent)];
      if (!k) return;
      const wrap = el('span', 'trait-name');
      wrap.append(pic('trait-' + k, 'trait-ico'), el('span', '', c.textContent));
      c.textContent = '';
      c.append(wrap);
    });
    const strip = el('div', 'trait-strip');
    $$('tbody tr', t).forEach((tr) => {
      const k = TRAIT_ICON[norm(tr.firstElementChild.textContent)];
      if (!k) return;
      const cells = $$('td', tr);
      strip.append(el('div', 'trait-tile', '<img src="' + ART + 'trait-' + k + '.svg" alt="" loading="lazy"><b>' + cells[0].textContent.trim() + '</b><span>' + cells[1].textContent.trim() + '</span>'));
    });
    t.closest('.table-wrap').before(strip);
  });

  /* ---------- Tableaux : lisibles en cartes sur mobile ---------- */
  $$('table.data').forEach((t) => {
    const heads = $$('thead th', t).map((th) => th.textContent.trim());
    if (heads.length > 4) return;
    t.classList.add('stackable');
    $$('tbody tr', t).forEach((tr) => $$('td', tr).forEach((td, i) => { if (heads[i]) td.dataset.label = heads[i]; }));
  });

  /* ---------- Posters : miniatures dans les tableaux ---------- */
  $$('#haki table.data').forEach((t) => {
    if (norm(t.querySelector('th')?.textContent || '') !== 'poster') return;
    $$('tbody tr', t).forEach((tr) => {
      const c = tr.firstElementChild;
      const ALIAS = { godkilla: 'go-d-zilla', 'genghis-khan': 'geng-d-khan', napoleon: 'nap-o-leon', 'julius-caesar': 'julius-c-zar' };
      let slug = norm(c.textContent).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      slug = ALIAS[slug] || slug;
      const i = new Image();
      i.src = 'visuals/cartes-' + slug + '.webp';
      i.alt = '';
      i.className = 'cell-thumb';
      i.loading = 'lazy';
      i.onerror = () => i.remove();
      c.prepend(i);
    });
  });

  /* ---------- Races sur l’accueil ---------- */
  const RACE_FILE = { humain: 'human', trois: 'three-eyes', avalonien: 'avalonian', lunaria: 'lunarian', oni: 'oni', geant: 'giant', cyborg: 'cyborg', homme: 'beastman', marinien: 'marinian', nain: 'dwarf' };
  $$('dl.races > div').forEach((d) => {
    const dt = d.querySelector('dt'); if (!dt || d.querySelector('.race-thumb')) return;
    const f = RACE_FILE[norm(dt.firstChild.textContent).split(/[\s-]/)[0]];
    if (f) d.prepend(racePhoto(f, 'race-thumb'));
  });

  /* ---------- Métiers ---------- */
  const JOBS = [['peche', 'Pêche'], ['cuisine', 'Cuisine'], ['artisanat', 'Artisanat'], ['bois', 'Bois'], ['minage', 'Minage'], ['navigation', 'Navigation'], ['vol', 'Vol'], ['medecin', 'Médecin']];
  const jobsHead = $$('#metiers .table-wrap')[0];
  if (jobsHead && !$$('.job-strip').length) {
    const strip = el('nav', 'job-strip');
    strip.setAttribute('aria-label', 'Les huit métiers');
    JOBS.forEach(([id, label]) => { const a = el('a', 'job-tile'); a.href = '#' + id; a.append(pic('job-' + id), el('span', '', label)); strip.append(a); });
    jobsHead.before(strip);
  }
  JOBS.forEach(([id]) => { const h = $('#' + id + ' h2'); if (h && !h.querySelector('.job-ico')) h.prepend(pic('job-' + id, 'job-ico')); });
  function $(s) { return document.querySelector(s); }

  /* ---------- Grades de la Marine ---------- */
  const ROMAN = { I: 1, II: 2, III: 3 };
  $$('ol.ladder').forEach((ol) => $$('li', ol).forEach((li, i) => {
    if (li.querySelector('.pips')) return;
    const m = li.textContent.trim().match(/\s(I{1,3})$/);
    const n = m ? ROMAN[m[1]] : Math.min(6, i - 14);
    li.prepend(el('span', 'pips', '<i></i>'.repeat(Math.max(1, n))));
  }));

  /* Utilitaires partagés (créateur de build) */
  const FX_FRUIT = { Dark: 'dark', Flame: 'fire', Ice: 'ice', Light: 'light', Magma: 'lava', Rumble: 'lightning', Sand: 'sand', Smoke: 'smoke', Barrier: 'barrier', Bomb: 'bomb', Chop: 'blade', Dough: 'dough', Gravity: 'gravity', Love: 'love', Operation: 'room', Paw: 'paw', Quake: 'quake', Revive: 'revive', Rubber: 'rubber', Soul: 'soul', String: 'string', Venom: 'venom' };
  const FX_FAMILY = { Armement: 'haki-armement', Observation: 'haki-observation', Rois: 'haki-rois', Agile: 'haki-agile', Fierce: 'haki-fierce', Tactic: 'haki-tactic' };
  const RACE_KEY = { humain: 'human', 'trois yeux': 'three-eyes', avalonien: 'avalonian', lunaria: 'lunarian', oni: 'oni', geant: 'giant', cyborg: 'cyborg', 'homme-bete': 'beastman', marinien: 'marinian', nain: 'dwarf' };
  window.AtlasArt = {
    base: ART, weaponIcon,
    fxFruit: (name, fam) => FX_FRUIT[name] || (fam === 'Zoan mythique' ? 'aura' : 'claw'),
    fxFamily: (fam) => FX_FAMILY[fam],
    raceKey: (fr) => RACE_KEY[norm(fr)],
    racePath: (key) => 'visuals/wiki/races/' + RACE_WIKI[key] + '.webp',
    weaponPhoto: (name) => 'visuals/wiki/weapons/' + slug(name) + '.webp',
  };
})();
