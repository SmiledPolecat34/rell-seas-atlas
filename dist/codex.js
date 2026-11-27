/* Catalogues du codex : résumé visible sur chaque carte, aperçu animé, filtres (recherche, famille, statut). */
const normalize = (value) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
const ART = 'visuals/art/';

const FX_FAMILY = { Armement: 'haki-armement', Observation: 'haki-observation', Rois: 'haki-rois', Agile: 'haki-agile', Fierce: 'haki-fierce', Tactic: 'haki-tactic' };
const FX_FRUIT = {
  Dark: 'dark', Flame: 'fire', Ice: 'ice', Light: 'light', Magma: 'lava', Rumble: 'lightning', Sand: 'sand', Smoke: 'smoke',
  Barrier: 'barrier', Bomb: 'bomb', Chop: 'blade', Dough: 'dough', Gravity: 'gravity', Love: 'love', Operation: 'room', Paw: 'paw',
  Quake: 'quake', Revive: 'revive', Rubber: 'rubber', Soul: 'soul', String: 'string', Venom: 'venom',
};

/* Statuts de cartes : une carte peut cumuler plusieurs étiquettes. */
const cardStatus = (label) => {
  const n = normalize(label);
  const out = [];
  if (n.includes('wiki')) out.push('wiki');
  if (n.includes('demo')) out.push('demo');
  if (n.includes('nom recense')) out.push('nom');
  if (n.includes('guide')) out.push('guide');
  return out.length ? out : ['autre'];
};
const STATUS_LABELS = {
  wiki: ['Wiki', 'Décrite par le wiki communautaire'],
  demo: ['Ancienne démo', 'Effet relevé dans l’ancienne démo'],
  nom: ['Nom recensé', 'Seul le nom est connu'],
  guide: ['Guide communautaire', 'Relevé dans les guides'],
  detail: ['Fiche détaillée', 'Passifs ou mouvements décrits'],
  theme: ['Thème seul', 'Seul le thème est connu'],
};

const excerpt = (text, max = 150) => {
  const t = text.replace(/\s+/g, ' ').trim();
  const parts = t.split(/(?<=[.!?])\s+/);
  let out = parts[0];
  if (out.length < 60 && parts[1]) out += ' ' + parts[1];
  return out.length > max ? out.slice(0, max - 1).trimEnd() + '…' : out;
};

function enhanceEntries(list, kind) {
  list.querySelectorAll('details.entry').forEach((entry) => {
    const summary = entry.querySelector('summary');
    const icon = summary && summary.querySelector('.card-image');
    if (!icon) return;
    const group = entry.closest('[data-family], .catalog-group');
    const family = group?.dataset.family || group?.querySelector('h3')?.textContent.trim() || '';
    const name = [...summary.childNodes].find((n) => n.nodeType === 3)?.textContent.trim() || '';
    const small = summary.querySelector('small');
    const para = entry.querySelector(':scope > p');
    const text = para ? para.textContent : '';
    entry.classList.add('entry-rich');
    entry.dataset.name = name;
    entry.dataset.family = family;

    let tags;
    if (kind === 'fruit') tags = [/demandent une source de gameplay/i.test(text) ? 'theme' : 'detail'];
    else tags = cardStatus(small ? small.textContent : '');
    entry.dataset.status = tags.join(' ');

    // Aperçu animé (illustration, pas une capture de jeu)
    const fx = kind === 'fruit'
      ? (FX_FRUIT[name] || (family === 'Zoan mythique' ? 'aura' : 'claw'))
      : FX_FAMILY[family];
    if (fx) {
      const fig = document.createElement('div');
      fig.className = 'entry-fx';
      const img = new Image();
      img.src = ART + 'fx-' + fx + '.svg';
      img.alt = '';
      img.loading = 'lazy';
      img.decoding = 'async';
      fig.append(img);
      const tag = document.createElement('span');
      tag.textContent = 'Aperçu animé';
      fig.append(tag);
      summary.prepend(fig);
    }

    // Résumé visible sans ouvrir la carte
    const sum = document.createElement('p');
    sum.className = 'entry-sum';
    sum.textContent = text ? excerpt(text) : 'Détails à l’intérieur.';
    summary.append(sum);
    const meta = document.createElement('span');
    meta.className = 'entry-meta';
    meta.textContent = family;
    summary.append(meta);
  });
}

document.querySelectorAll('[data-catalog]').forEach((form) => {
  const list = document.getElementById(form.dataset.catalog);
  const kind = form.dataset.catalog === 'fruit-list' ? 'fruit' : 'card';
  const groups = Array.from(list.querySelectorAll('[data-family]'));
  enhanceEntries(list, kind);
  form.hidden = false;
  const query = form.elements.query;
  const family = form.elements.family;
  const result = form.querySelector('output');

  // Checklist de statuts
  const counts = {};
  list.querySelectorAll('.entry').forEach((e) => (e.dataset.status || '').split(' ').filter(Boolean).forEach((s) => { counts[s] = (counts[s] || 0) + 1; }));
  const order = kind === 'fruit' ? ['detail', 'theme'] : ['wiki', 'demo', 'nom', 'guide'];
  const box = document.createElement('fieldset');
  box.className = 'status-filter';
  box.innerHTML = '<legend>Statut de la fiche <button type="button" class="link-btn" hidden>Tout afficher</button></legend>';
  const reset = box.querySelector('button');
  order.filter((s) => counts[s]).forEach((s) => {
    const label = document.createElement('label');
    label.className = 'pill-check';
    label.title = STATUS_LABELS[s][1];
    label.innerHTML = '<input type="checkbox" name="status" value="' + s + '"><span>' + STATUS_LABELS[s][0] + ' <b>' + counts[s] + '</b></span>';
    box.append(label);
  });
  form.append(box);

  const update = () => {
    const term = normalize(query.value.trim());
    const wanted = [...box.querySelectorAll('input:checked')].map((i) => i.value);
    reset.hidden = wanted.length === 0;
    let visible = 0;
    groups.forEach((group) => {
      let matches = 0;
      group.querySelectorAll('.entry').forEach((entry) => {
        const tags = (entry.dataset.status || '').split(' ');
        entry.hidden = Boolean(family.value && group.dataset.family !== family.value)
          || !normalize(entry.textContent).includes(term)
          || (wanted.length > 0 && !wanted.some((w) => tags.includes(w)));
        matches += Number(!entry.hidden);
      });
      group.hidden = matches === 0;
      visible += matches;
    });
    result.textContent = visible ? new Intl.NumberFormat('fr').format(visible) + ' fiches' : 'Aucune fiche trouvée';
  };

  form.addEventListener('submit', (event) => event.preventDefault());
  query.addEventListener('input', update);
  family.addEventListener('change', update);
  box.addEventListener('change', update);
  reset.addEventListener('click', () => { box.querySelectorAll('input').forEach((i) => { i.checked = false; }); update(); });
  update();
});

const openLinkedCard = () => {
  const target = document.getElementById(window.location.hash.slice(1));
  if (target instanceof HTMLDetailsElement) {
    target.open = true;
  }
};

window.addEventListener('hashchange', openLinkedCard);
openLinkedCard();
