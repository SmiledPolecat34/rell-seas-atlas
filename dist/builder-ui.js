/* Créateur de build : chaque choix devient une tuile avec image, résumé et aperçu animé,
   et un sélecteur visuel. Les <select> d'origine restent la source de vérité. */
(() => {
  const ids = {
    card: ['bHaki1', 'bHaki2', 'bHaki3', 'bHaki4', 'bAgile', 'bFierce', 'bTactic', 'bExtra'],
    fruit: ['bFruit'], weapon: ['bWeapon'], race: ['bRace'],
  };
  const A = () => window.AtlasArt;
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const norm = (v) => v.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();

  let S = null; let D = null;
  const load = () => Promise.all([fetch('summaries.json').then((r) => r.json()), fetch('builder-data.json').then((r) => r.json())]).then(([s, d]) => { S = s; D = d; });

  /* Fiche d'un choix : image, titre, résumé, aperçu animé. */
  function info(type, name, optText) {
    if (!name) return null;
    const art = A().base;
    if (type === 'card') {
      const c = S.cards[name];
      if (!c) return { title: name, sum: 'Nom connu, aucun effet vérifié.', meta: 'Titre' };
      return { title: name, img: c.img, sum: c.sum, meta: c.fam, badge: c.status, fx: A().fxFamily(c.fam) };
    }
    if (type === 'fruit') {
      const f = S.fruits[name];
      return { title: name, img: f?.img, sum: f ? f.sum : '', meta: f?.fam || 'Fruit', fx: A().fxFruit(name, f?.fam) };
    }
    if (type === 'weapon') {
      const w = D.weapons.find((x) => x.name === name);
      return { title: name, img: A().weaponPhoto(name), fb: art + 'weapon-' + A().weaponIcon(name) + '.svg', photo: true, sum: w ? 'Famille ' + w.family + ' · classe ' + w.cls + '. La classe varie selon les sources.' : (optText || ''), meta: w ? w.cls : 'Arme' };
    }
    const r = D.races.find((x) => x.fr === name);
    const key = A().raceKey(name);
    return { title: name, img: key ? A().racePath(key) : null, fb: key ? art + 'race-' + key + '.svg' : null, portrait: true, photo: true, sum: r ? r.note : '', meta: r ? r.en + ' · tier ' + r.tier : 'Race' };
  }

  const imgTag = (i, lazy) => {
    if (!i.img) return '';
    const cls = 'pk-img' + (i.photo ? ' photo' : '') + (i.portrait ? ' por' : '');
    const fb = i.fb ? ' onerror="this.onerror=null;this.src=\'' + i.fb + '\';this.classList.remove(\'photo\')"' : '';
    return '<img class="' + cls + '"' + (lazy ? ' loading="lazy"' : '') + ' src="' + i.img + '"' + fb + ' alt="">';
  };

  function tileHtml(i, empty) {
    if (!i) return '<span class="pk-empty">' + esc(empty) + '</span>';
    const thumb = imgTag(i);
    const fx = i.fx ? '<img class="pk-fx" src="' + A().base + 'fx-' + i.fx + '.svg" alt="" loading="lazy">' : '';
    return fx + '<span class="pk-row">' + thumb + '<span class="pk-txt"><b>' + esc(i.title) + '</b><i>' + esc(i.meta || '') + (i.badge ? ' · ' + esc(i.badge) : '') + '</i></span></span><span class="pk-sum">' + esc(i.sum || '') + '</span>';
  }

  /* Boîte de dialogue de choix */
  let dlg;
  function openPicker(sel, type, label) {
    dlg = dlg || el('dialog', 'picker');
    dlg.textContent = '';
    const head = el('div', 'pk-head', '<h3>' + esc(label) + '</h3>');
    const close = el('button', 'pk-close', '×'); close.type = 'button'; close.setAttribute('aria-label', 'Fermer');
    close.addEventListener('click', () => dlg.close());
    const search = el('input'); search.type = 'search'; search.placeholder = 'Rechercher un nom ou un effet'; search.className = 'pk-search';
    const clear = el('button', 'btn pk-clear', 'Vider ce choix'); clear.type = 'button';
    clear.addEventListener('click', () => { set(sel, ''); dlg.close(); });
    head.append(close);
    const body = el('div', 'pk-body');
    const groups = [];
    const walk = (parent, gLabel) => [...parent.children].forEach((n) => {
      if (n.tagName === 'OPTGROUP') return walk(n, n.label);
      if (!n.value) return;
      let g = groups.find((x) => x.label === gLabel); if (!g) { g = { label: gLabel, items: [] }; groups.push(g); }
      g.items.push(n);
    });
    walk(sel, '');
    groups.forEach((g) => {
      const sec = el('section', 'pk-group');
      if (g.label) sec.append(el('h4', '', esc(g.label)));
      const grid = el('div', 'pk-grid');
      g.items.forEach((o) => {
        const i = info(type, o.value, o.textContent);
        const b = el('button', 'pk-item', '<span class="pk-row">' + imgTag(i, true) + '<span class="pk-txt"><b>' + esc(i.title) + '</b><i>' + esc(i.meta || '') + '</i></span></span><span class="pk-sum">' + esc(i.sum || '') + '</span>');
        b.type = 'button';
        b.dataset.q = norm(o.value + ' ' + (i.sum || ''));
        if (o.value === sel.value) b.classList.add('on');
        b.addEventListener('click', () => { set(sel, o.value); dlg.close(); });
        grid.append(b);
      });
      sec.append(grid); body.append(sec);
    });
    search.addEventListener('input', () => {
      const q = norm(search.value.trim());
      body.querySelectorAll('.pk-item').forEach((b) => { b.hidden = q && !b.dataset.q.includes(q); });
      body.querySelectorAll('.pk-group').forEach((s) => { s.hidden = ![...s.querySelectorAll('.pk-item')].some((b) => !b.hidden); });
    });
    const tools = el('div', 'pk-tools'); tools.append(search, clear);
    dlg.append(head, tools, body);
    if (!dlg.isConnected) { document.body.append(dlg); dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); }); }
    dlg.showModal();
    search.focus();
  }

  function set(sel, value) {
    sel.value = value;
    sel.dispatchEvent(new Event('input', { bubbles: true }));
    sel.dispatchEvent(new Event('change', { bubbles: true }));
  }

  const picks = [];
  function mount(id, type) {
    const sel = document.getElementById(id);
    if (!sel || sel.dataset.pick) return;
    sel.dataset.pick = '1';
    const lab = sel.closest('label');
    const label = lab?.querySelector('span')?.textContent || id;
    const empty = type === 'fruit' ? 'Aucun fruit' : type === 'weapon' ? 'À choisir' : type === 'race' ? 'Choisir' : 'Emplacement vide';
    const tile = el('button', 'pick-tile'); tile.type = 'button';
    tile.setAttribute('aria-label', 'Choisir : ' + label);
    tile.addEventListener('click', (e) => { e.preventDefault(); openPicker(sel, type, label); });
    sel.classList.add('pick-hidden');
    sel.after(tile);
    picks.push({ sel, tile, type, empty, last: null });
  }
  function refresh() {
    picks.forEach((p) => {
      if (p.last === p.sel.value) return;
      p.last = p.sel.value;
      p.tile.classList.toggle('filled', Boolean(p.sel.value));
      p.tile.innerHTML = tileHtml(info(p.type, p.sel.value, p.sel.selectedOptions[0]?.textContent), p.empty);
    });
    // Icônes des Main Traits
    document.querySelectorAll('#bTraits .trait').forEach((row) => {
      if (row.dataset.icon) return;
      row.dataset.icon = '1';
      const k = { willPower: 'will-power' }[row.dataset.k] || row.dataset.k;
      const i = new Image(); i.src = A().base + 'trait-' + k + '.svg'; i.alt = ''; i.className = 'trait-icon';
      row.querySelector('.trait-h')?.prepend(i);
    });
  }

  load().then(() => {
    let tries = 0;
    const wait = setInterval(() => {
      const ready = document.getElementById('bHaki1')?.options.length > 1 && window.AtlasArt;
      if (ready || ++tries > 60) {
        clearInterval(wait);
        if (!ready) return;
        const ex = document.getElementById('bExtra');
        if (ex && !ex.dataset.ready) {
          ex.dataset.ready = '1';
          const keep = ex.value;
          ex.textContent = '';
          const none = document.createElement('option'); none.value = ''; none.textContent = '— Vide'; ex.append(none);
          ['Agile', 'Fierce', 'Tactic'].forEach((fam) => {
            const g = document.createElement('optgroup'); g.label = fam;
            (D.posters[fam] || []).forEach((p) => { const o = document.createElement('option'); o.value = p.name; o.textContent = p.name; g.append(o); });
            ex.append(g);
          });
          if ([...ex.options].some((o) => o.value === keep)) ex.value = keep;
        }
        Object.entries(ids).forEach(([type, list]) => list.forEach((id) => mount(id, type)));
        refresh();
        setInterval(refresh, 350);
      }
    }, 150);
  }).catch(() => { /* sans résumés, le formulaire reste utilisable */ });
})();
