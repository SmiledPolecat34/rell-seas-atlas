/* Créateur de build : formulaire, fiche en direct, retour automatique, retour IA, stockage.
   Stockage : sur le serveur du site (/api/builds) si server.py tourne, sinon dans ce navigateur. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const TRAITS = [
    ['health', 'Health', 'Résistance globale'], ['endurance', 'Endurance', 'Stamina, mobilité, combats longs'], ['defense', 'Defense', 'Réduction des coups'],
    ['spiritual', 'Spiritual', 'Effet non confirmé'], ['willPower', 'Will-Power', 'Volonté, Haki possible'], ['luck', 'Luck', 'Effet non confirmé'],
  ];
  const GOALS = { 'pvp-melee': 'PvP mêlée', 'pvp-mobile': 'PvP mobilité', 'pvp-ranged': 'PvP à distance', pve: 'PvE / boss', explore: 'Exploration', naval: 'Combat naval', economy: 'Économie / craft', hybrid: 'Polyvalent' };
  const FACTIONS = ['Pirates', 'Marines', 'Révolutionnaires', 'Gouvernement', 'Chasseurs de primes (statut contesté)'];
  const CLASSES = ['Light', 'Medium', 'Heavy', 'Gunsman'];
  const STYLES = ['Aucun', 'Black Leg', 'Dragon Claw Fist', 'Rokushiki', 'Électro', 'Karaté des hommes-poissons'];
  const JOBS = ['Pêche', 'Cuisine', 'Artisanat', 'Bois', 'Minage', 'Navigation', 'Vol', 'Médecin'];
  const GOOD = {
    Humain: ['Medium'], 'Trois yeux': ['Gunsman', 'Medium'], Avalonien: ['Light'], Lunaria: ['Heavy', 'Medium'], Oni: ['Heavy'], Géant: ['Heavy'],
    Cyborg: ['Gunsman', 'Heavy'], 'Homme-bête': ['Light'], Marinien: ['Light', 'Medium'], Nain: ['Light', 'Gunsman'],
  };
  const STRONG = ['Go D. Zilla', 'Sir Gawain', 'Sir Lancelot', 'Alexander D. Great', 'Khwarizmi', 'Kanada'];

  let data = null, mode = 'local', ai = false, current = blank(), builds = [];

  function blank() {
    return { id: '', name: '', goal: 'hybrid', faction: 'Pirates', race: 'Humain', sub: '', cls: 'Medium',
      traits: { health: 20, endurance: 25, defense: 15, spiritual: 10, willPower: 25, luck: 5 },
      weapon: '', fruit: '', style: 'Aucun', spiritual: ['', '', '', ''], agile: '', fierce: '', tactic: '', extra: '', jobMain: '', jobs: [], notes: '', review: null, updated: 0 };
  }

  /* ---------- Éléments du formulaire ---------- */
  const f = {
    name: $('#bName'), goal: $('#bGoal'), faction: $('#bFaction'), race: $('#bRace'), sub: $('#bSub'), cls: $('#bClass'), weapon: $('#bWeapon'),
    fruit: $('#bFruit'), style: $('#bStyle'), agile: $('#bAgile'), fierce: $('#bFierce'), tactic: $('#bTactic'), extra: $('#bExtra'),
    jobMain: $('#bJobMain'), notes: $('#bNotes'), spiritual: [1, 2, 3, 4].map((i) => $('#bHaki' + i)),
  };
  const opt = (sel, value, label) => { const o = el('option', '', label || value || '—'); o.value = value; sel.append(o); };
  const optGroup = (sel, label) => { const g = el('optgroup'); g.label = label; sel.append(g); return g; };
  const fill = (sel, list, empty) => { sel.textContent = ''; if (empty != null) opt(sel, '', empty); list.forEach((v) => opt(sel, typeof v === 'string' ? v : v.value, typeof v === 'string' ? v : v.label)); };

  function buildForm() {
    fill(f.goal, Object.entries(GOALS).map(([value, label]) => ({ value, label })));
    fill(f.faction, FACTIONS); fill(f.cls, CLASSES); fill(f.style, STYLES);
    fill(f.race, data.races.map((r) => r.fr));
    fill(f.jobMain, JOBS, '— Aucun');
    // armes par famille
    f.weapon.textContent = ''; opt(f.weapon, '', '— À choisir');
    ['Leviathan', 'Sea Cow', 'Autres'].forEach((fam) => {
      const g = optGroup(f.weapon, fam);
      data.weapons.filter((w) => w.family === fam).forEach((w) => { const o = el('option', '', w.name + ' · ' + w.cls); o.value = w.name; g.append(o); });
    });
    // fruits par famille
    f.fruit.textContent = ''; opt(f.fruit, '', 'Aucun fruit');
    Object.entries(data.fruits).forEach(([fam, names]) => { const g = optGroup(f.fruit, fam); names.forEach((n) => { const o = el('option', '', n); o.value = n; g.append(o); }); });
    // posters Spiritual : Armement, Observation, Rois
    f.spiritual.forEach((s) => {
      s.textContent = ''; opt(s, '', '— Slot vide');
      ['Armement', 'Observation', 'Rois'].forEach((fam) => { const g = optGroup(s, fam); data.posters[fam].forEach((p) => { const o = el('option', '', p.name); o.value = p.name; g.append(o); }); });
    });
    [['agile', 'Agile'], ['fierce', 'Fierce'], ['tactic', 'Tactic']].forEach(([k, fam]) => {
      f[k].textContent = ''; opt(f[k], '', '— Vide'); data.posters[fam].forEach((p) => opt(f[k], p.name));
    });
    f.extra.textContent = ''; opt(f.extra, '', '— Vide'); opt(f.extra, 'Titre à choisir', 'Titre à choisir');
    // métiers secondaires
    const box = $('#bJobs'); box.textContent = '';
    JOBS.forEach((j) => {
      const lab = el('label', 'check'); const cb = el('input'); cb.type = 'checkbox'; cb.value = j; cb.name = 'job';
      cb.addEventListener('change', () => { limitJobs(cb); sync(); });
      lab.append(cb, el('span', '', j)); box.append(lab);
    });
    // traits
    const tb = $('#bTraits'); tb.textContent = '';
    TRAITS.forEach(([k, label, hint]) => {
      const row = el('div', 'trait'); row.dataset.k = k;
      const head = el('div', 'trait-h'); head.append(el('strong', '', label), el('span', 'hint', hint));
      const range = el('input'); range.type = 'range'; range.min = 0; range.max = 60; range.step = 1; range.id = 't-' + k; range.setAttribute('aria-label', label);
      const out = el('output', 'trait-v', '0');
      range.addEventListener('input', () => { out.textContent = range.value; sync(); });
      row.append(head, range, out); tb.append(row);
    });
  }
  function limitJobs(cb) {
    const checked = [...document.querySelectorAll('#bJobs input:checked')];
    if (checked.length > 2 && cb.checked) cb.checked = false;
  }
  function subsFor(raceFr) { const r = data.races.find((x) => x.fr === raceFr); return r ? r.subs : []; }
  function refreshSubs(keep) {
    fill(f.sub, subsFor(f.race.value), 'Sous-espèce');
    if (keep) f.sub.value = keep;
  }

  /* ---------- Lecture / écriture ---------- */
  function read() {
    const s = { ...current };
    s.name = f.name.value.trim().slice(0, 60); s.goal = f.goal.value; s.faction = f.faction.value; s.race = f.race.value; s.sub = f.sub.value; s.cls = f.cls.value;
    s.weapon = f.weapon.value; s.fruit = f.fruit.value; s.style = f.style.value;
    s.agile = f.agile.value; s.fierce = f.fierce.value; s.tactic = f.tactic.value; s.extra = f.extra.value;
    s.spiritual = f.spiritual.map((x) => x.value);
    s.jobMain = f.jobMain.value; s.jobs = [...document.querySelectorAll('#bJobs input:checked')].map((c) => c.value);
    s.notes = f.notes.value.slice(0, 500);
    s.traits = {}; TRAITS.forEach(([k]) => { s.traits[k] = +$('#t-' + k).value; });
    return s;
  }
  function write(s) {
    current = { ...blank(), ...s, traits: { ...blank().traits, ...(s.traits || {}) } };
    f.name.value = current.name; f.goal.value = current.goal; f.faction.value = current.faction; f.race.value = current.race; refreshSubs(current.sub);
    f.cls.value = current.cls; f.weapon.value = current.weapon; f.fruit.value = current.fruit; f.style.value = current.style;
    f.agile.value = current.agile; f.fierce.value = current.fierce; f.tactic.value = current.tactic; f.extra.value = current.extra;
    f.spiritual.forEach((x, i) => { x.value = current.spiritual[i] || ''; });
    f.jobMain.value = current.jobMain; document.querySelectorAll('#bJobs input').forEach((c) => { c.checked = current.jobs.includes(c.value); });
    f.notes.value = current.notes;
    TRAITS.forEach(([k]) => { const r = $('#t-' + k); r.value = current.traits[k]; r.nextElementSibling.textContent = r.value; });
    sync(true);
  }

  /* ---------- Fiche en direct ---------- */
  function radar(traits) {
    const NS = 'http://www.w3.org/2000/svg', size = 240, c = size / 2, R = 84, max = 60;
    const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('viewBox', `0 0 ${size} ${size}`); svg.setAttribute('role', 'img'); svg.setAttribute('aria-label', 'Répartition des Main Traits');
    const pt = (i, v) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 6; return [c + (R * v / max) * Math.cos(a), c + (R * v / max) * Math.sin(a)]; };
    [0.25, 0.5, 0.75, 1].forEach((k) => {
      const p = document.createElementNS(NS, 'polygon'); p.setAttribute('points', TRAITS.map((_, i) => pt(i, max * k).join(',')).join(' ')); p.setAttribute('class', 'ring'); svg.append(p);
    });
    TRAITS.forEach(([k, label], i) => {
      const [x, y] = pt(i, max * 1.28); const t = document.createElementNS(NS, 'text'); t.setAttribute('x', x); t.setAttribute('y', y); t.setAttribute('text-anchor', 'middle'); t.setAttribute('dominant-baseline', 'middle'); t.setAttribute('class', 'lab'); t.textContent = label; svg.append(t);
    });
    const poly = document.createElementNS(NS, 'polygon'); poly.setAttribute('points', TRAITS.map(([k], i) => pt(i, Math.min(max, traits[k])).join(' ').replace(' ', ',')).join(' ')); poly.setAttribute('class', 'shape'); svg.append(poly);
    return svg;
  }
  function renderCard(s) {
    const box = $('#bCard'); box.textContent = '';
    const total = Object.values(s.traits).reduce((a, b) => a + b, 0);
    const head = el('div', 'card-h'); head.append(el('h3', '', s.name || 'Build sans nom'), el('span', 'tag', GOALS[s.goal]));
    box.append(head);
    box.append(radar(s.traits));
    const tot = el('p', 'total ' + (total === 100 ? 'ok' : 'warn'), `Total des traits : ${total} / 100`); box.append(tot);
    const rows = [
      ['Faction', s.faction], ['Race', s.race + (s.sub ? ' · ' + s.sub : '')], ['Classe', s.cls], ['Arme', s.weapon || '—'], ['Fruit', s.fruit || 'Aucun'], ['Style', s.style],
      ['Spiritual', s.spiritual.filter(Boolean).join(', ') || '—'], ['Potentials', [s.agile, s.fierce, s.tactic, s.extra].filter(Boolean).join(', ') || '—'],
      ['Métiers', [s.jobMain, ...s.jobs.filter((j) => j !== s.jobMain)].filter(Boolean).join(', ') || '—'],
    ];
    const dl = el('dl'); rows.forEach(([k, v]) => { const d = el('div'); d.append(el('dt', '', k), el('dd', '', v)); dl.append(d); }); box.append(dl);
  }

  /* ---------- Retour automatique ---------- */
  function analyse(s) {
    const T = s.traits, total = Object.values(T).reduce((a, b) => a + b, 0), ok = [], risk = [], tips = [];
    let score = 70;
    const add = (arr, t, d = 0) => { arr.push(t); score += d; };
    const pos = s.spiritual.filter(Boolean), allPos = [...pos, s.agile, s.fierce, s.tactic].filter(Boolean);
    const fam = (n) => ['Armement', 'Observation', 'Rois', 'Agile', 'Fierce', 'Tactic'].find((F) => (data.posters[F] || []).some((p) => p.name === n));
    const race = data.races.find((r) => r.fr === s.race);
    const wp = data.weapons.find((w) => w.name === s.weapon);

    if (total !== 100) add(risk, `Le total des traits est ${total}/100 : répartis exactement 100 points pour pouvoir comparer ce build.`, -5);
    else add(ok, 'Répartition des traits équilibrée sur un budget de 100.', 3);

    if (s.cls === 'Heavy') (T.health + T.defense >= 45 ? add(ok, 'Heavy cohérent : Health + Defense élevés tiennent la posture.', 5) : add(tips, 'Une classe Heavy gagne à monter Health et Defense (45 points ou plus à eux deux).', -4));
    if (s.cls === 'Light') (T.endurance >= 28 ? add(ok, 'Light cohérent : l’Endurance soutient la mobilité.', 5) : add(tips, 'Light vit de mobilité : vise 28 points d’Endurance ou plus.', -4));
    if (s.cls === 'Medium') (Math.max(...Object.values(T)) <= 40 ? add(ok, 'Medium polyvalent : aucun trait ne domine.', 4) : add(tips, 'Medium est la classe équilibrée ; un trait au-dessus de 40 la rend moins polyvalente.', -2));
    if (s.cls === 'Gunsman') (T.endurance + T.defense >= 40 ? add(ok, 'Gunsman cohérent : Endurance et Defense aident à tenir la distance.', 5) : add(tips, 'Gunsman gagne à combiner Endurance et Defense (40 points ou plus).', -4));
    if (T.luck > 8) add(risk, `Luck à ${T.luck} : son effet n’est pas confirmé, évite d’y investir avant d’en savoir plus.`, -4);
    if (T.spiritual > 25) add(risk, `Spiritual à ${T.spiritual} : aucun effet chiffré connu sur les posters ou le Haki.`, -3);

    const goalChecks = {
      'pvp-melee': () => { (['Heavy', 'Medium'].includes(s.cls) ? add(ok, 'Classe adaptée à la mêlée.', 4) : add(risk, 'Light ou Gunsman sont moins naturels pour une mêlée directe.', -3)); const n = pos.filter((p) => ['Armement', 'Rois'].includes(fam(p))).length; (n >= 2 ? add(ok, 'Au moins deux posters d’Armement ou de Rois : bonne pression de mêlée.', 4) : add(tips, 'Pour la mêlée, vise au moins deux posters d’Armement ou de Rois (Sir Gawain, Sir Lancelot, Alexander D. Great).', -2)); },
      'pvp-mobile': () => { (s.cls === 'Light' ? add(ok, 'Light : la classe de la mobilité.', 4) : add(tips, 'Light est la classe naturelle de la mobilité.', -2)); (s.agile ? add(ok, 'Un potentiel Agile est équipé.', 3) : add(tips, 'Ajoute un potentiel Agile (Flash Dash, Geppo Master).', -3)); },
      'pvp-ranged': () => { (s.cls === 'Gunsman' ? add(ok, 'Gunsman : la classe du tir.', 4) : add(risk, 'Le tir est plus naturel avec Gunsman.', -3)); (pos.some((p) => fam(p) === 'Observation') ? add(ok, 'Un poster d’Observation aide à anticiper les approches.', 3) : add(tips, 'Un poster d’Observation (Khwarizmi, Kanada) aide à voir venir l’adversaire.', -2)); },
      pve: () => { (T.health + T.defense >= 45 ? add(ok, 'Health et Defense solides pour les boss.', 4) : add(risk, 'Contre des boss, Health + Defense à 45 ou plus est plus sûr.', -4)); (pos.some((p) => ['Sir Gawain', 'Sir Lancelot'].includes(p)) ? add(ok, 'Sir Gawain ou Sir Lancelot : bonne gestion de la posture.', 3) : add(tips, 'Sir Gawain (+20 % de posture) est un choix sûr pour les boss.', -1)); },
      explore: () => { (s.jobs.includes('Navigation') || s.jobMain === 'Navigation' ? add(ok, 'Navigation sélectionnée : boussoles, pelles et trésors.', 4) : add(risk, 'Une exploration sans le métier Navigation se prive des boussoles et de la pelle.', -4)); (T.endurance >= 28 ? add(ok, 'Endurance suffisante pour voyager.', 2) : add(tips, 'Monte l’Endurance pour explorer plus longtemps.', -1)); },
      naval: () => { (s.jobs.includes('Navigation') || s.jobMain === 'Navigation' ? add(ok, 'Navigation prise : indispensable pour barrer et repérer.', 4) : add(risk, 'Le combat naval gagne à avoir Navigation.', -4)); (s.jobs.includes('Médecin') || s.jobMain === 'Médecin' ? add(ok, 'Un médecin à bord est conseillé à cause des maladies.', 3) : add(tips, 'Un médecin de crew est conseillé (maladies, peste en mer sous la pluie).', 0)); },
      economy: () => { const eco = ['Artisanat', 'Minage', 'Cuisine', 'Pêche', 'Bois'].filter((j) => s.jobMain === j || s.jobs.includes(j)).length; (eco >= 2 ? add(ok, 'Plusieurs métiers de production se complètent.', 5) : add(risk, 'Un build économie demande au moins deux métiers de production liés (par exemple Minage + Artisanat).', -5)); (T.health + T.defense + T.endurance < 70 ? add(tips, 'Garde une base de survie suffisante malgré les métiers.', 0) : null); },
      hybrid: () => { add(ok, 'Objectif polyvalent : aucune contrainte forte à respecter.', 0); },
    };
    goalChecks[s.goal]();

    const filled = pos.length;
    if (filled < 4) add(tips, `${4 - filled} slot(s) Spiritual vide(s) : le Movie 3 en montre quatre (le plafond n’est pas confirmé).`, -2 * (4 - filled));
    const dup = pos.filter((p, i) => pos.indexOf(p) !== i); if (dup.length) add(risk, 'Poster en double : le même poster ne devrait pas occuper deux slots.', -4);
    const strong = pos.filter((p) => STRONG.includes(p)); if (strong.length) add(ok, `Posters à l’effet lisible sur les captures : ${strong.join(', ')}.`, Math.min(6, strong.length * 2));
    if (!s.agile || !s.fierce || !s.tactic) add(tips, 'Complète les trois potentiels Max-Potential (Agile, Fierce, Tactic) ; la quatrième case est « Title ».', -3);

    if (race) {
      if (['S', 'S+', 'A+'].includes(race.tier)) add(ok, `Race ${s.race} : tier théorique ${race.tier}, mais aucun passif racial n’est confirmé.`, 2);
      const good = GOOD[s.race] || [];
      if (good.includes(s.cls)) add(ok, `${s.race} + ${s.cls} : combinaison cohérente avec le profil supposé de la race.`, 3);
      else add(tips, `${s.race} + ${s.cls} est hors du profil supposé (${good.join(' ou ')}), sans conséquence prouvée.`, -1);
      if (s.race === 'Marinien' && s.fruit) add(risk, 'Marinien avec un fruit : l’incompatibilité avec les capacités aquatiques est possible.', -3);
    }
    if (wp) { if (wp.cls !== s.cls) add(risk, `L’arme ${wp.name} est rangée en ${wp.cls} dans le catalogue, ta classe est ${s.cls} (classement non confirmé).`, -5); else add(ok, 'Arme cohérente avec la classe.', 3); } else add(tips, 'Choisis une arme : le catalogue en recense 39.', -3);

    if (s.fruit) add(risk, `Fruit ${s.fruit} : obtention, probabilités et éveil inconnus ; plafond de détention et Marines à ses trousses en EAC.`, -2);
    else add(ok, 'Base sans fruit : aucune dépendance à un tirage rare.', 2);

    if (s.faction === 'Marines') add(risk, 'Marines : taxes sur les gains et obligation de rester dans la légalité.', -1);
    if (s.faction === 'Pirates') add(tips, 'Pirates : une prime élevée t’expose à la capture et à la prison.', 0);
    if (s.faction === 'Révolutionnaires' || s.faction === 'Gouvernement') add(risk, `${s.faction} : faction pré-release, presque aucun détail confirmé.`, -4);
    if (s.faction.startsWith('Chasseurs')) add(risk, 'Chasseurs de primes : statut de faction contesté entre les sources.', -3);

    if (s.style === 'Rokushiki' && !['Marines', 'Gouvernement'].includes(s.faction)) add(risk, 'Rokushiki est probablement lié aux Marines ou au Gouvernement : accès non confirmé pour ta faction.', -3);
    if (s.style === 'Dragon Claw Fist' && s.faction !== 'Révolutionnaires') add(risk, 'Dragon Claw Fist est probablement lié aux Révolutionnaires : accès non confirmé pour ta faction.', -3);

    const jobs = [...new Set([s.jobMain, ...s.jobs].filter(Boolean))];
    if (jobs.length > 3) add(risk, 'Plus de trois métiers : ils partagent les Stat-Points avec tes stats.', -4);
    if (!jobs.length && !['pvp-melee', 'pvp-mobile', 'pvp-ranged'].includes(s.goal)) add(tips, 'Aucun métier choisi : prévois au moins un métier utile à ton objectif.', -2);

    score = Math.max(0, Math.min(100, score));
    return { score, ok, risk, tips, unknown: [
      'Aucun bonus racial ni effet de sous-espèce n’est confirmé : ils peuvent être cosmétiques.',
      'Les effets exacts des six Main Traits et le coût des métiers en Stat-Points sont inconnus.',
      'Le nombre de slots de posters et leurs règles de cumul ne sont pas confirmés.'] };
  }
  function renderReview(s) {
    const box = $('#bReview'); box.textContent = '';
    const a = analyse(s);
    const top = el('div', 'rv-top');
    const meter = el('div', 'meter'); const bar = el('span'); bar.style.width = a.score + '%'; meter.append(bar);
    top.append(el('strong', 'rv-score', a.score + ' / 100'), el('span', 'rv-sub', 'Cohérence théorique'), meter);
    box.append(top);
    const col = (title, cls, items) => { if (!items.length) return; const c = el('div', 'rv-col ' + cls); c.append(el('h4', '', title)); const ul = el('ul'); items.forEach((t) => ul.append(el('li', '', t))); c.append(ul); box.append(c); };
    col('Points forts', 'good', a.ok); col('Risques', 'bad', a.risk); col('Conseils', 'tip', a.tips); col('Incertitudes', 'unk', a.unknown);
    return a;
  }
  function renderAI(text) {
    const box = $('#bAI'); box.textContent = '';
    if (!text) return;
    const p = el('div', 'ai-box'); text.split(/\n+/).forEach((l) => p.append(el('p', '', l)));
    p.append(el('span', 'ai-tag', 'Retour IA · à vérifier : le jeu n’est pas sorti')); box.append(p);
  }

  /* ---------- Synchronisation ---------- */
  let timer = 0;
  function sync(immediate) {
    current = read();
    renderCard(current);
    const run = () => { renderReview(current); };
    clearTimeout(timer); immediate ? run() : (timer = setTimeout(run, 180));
  }

  /* ---------- Stockage ---------- */
  const LS = 'rell-seas-builds';
  const store = {
    async init() {
      try {
        const r = await fetch('/api/builds', { cache: 'no-store' });
        if (r.ok) { mode = 'server'; return (await r.json()).builds || []; }
      } catch (e) { /* hors serveur */ }
      mode = 'local';
      try { return JSON.parse(localStorage.getItem(LS) || '[]'); } catch (e) { return []; }
    },
    async save(b) {
      if (mode === 'server') {
        const r = await fetch('/api/builds', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) });
        if (!r.ok) throw new Error('save');
        return (await r.json()).build;
      }
      const list = (() => { try { return JSON.parse(localStorage.getItem(LS) || '[]'); } catch (e) { return []; } })();
      const i = list.findIndex((x) => x.id === b.id);
      if (i >= 0) list[i] = b; else list.unshift(b);
      localStorage.setItem(LS, JSON.stringify(list.slice(0, 100)));
      return b;
    },
    async del(id) {
      if (mode === 'server') { await fetch('/api/builds/' + encodeURIComponent(id), { method: 'DELETE' }); return; }
      try { localStorage.setItem(LS, JSON.stringify(JSON.parse(localStorage.getItem(LS) || '[]').filter((x) => x.id !== id))); } catch (e) { /* ignore */ }
    },
  };
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'b-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8));

  function renderList() {
    const box = $('#bList'); box.textContent = '';
    $('#bMode').textContent = mode === 'server' ? 'Stocké sur le serveur du site' : 'Stocké dans ce navigateur (lance server.py pour le stocker sur le site)';
    $('#bMode').dataset.mode = mode;
    if (!builds.length) { box.append(el('p', 'muted', 'Aucun build enregistré pour le moment.')); return; }
    builds.forEach((b) => {
      const card = el('article', 'saved'); const left = el('div');
      left.append(el('h4', '', b.name || 'Build sans nom'), el('p', 'muted', `${b.race}${b.sub ? ' · ' + b.sub : ''} · ${b.cls} · ${GOALS[b.goal] || ''}`));
      if (b.review && b.review.score != null) left.append(el('span', 'mini', `Cohérence ${b.review.score}/100${b.review.ai ? ' · retour IA' : ''}`));
      const acts = el('div', 'saved-a');
      const mk = (label, fn) => { const x = el('button', 'btn small', label); x.type = 'button'; x.addEventListener('click', fn); return x; };
      acts.append(mk('Ouvrir', () => { write(b); renderAI(b.review && b.review.ai); $('#creator').scrollIntoView({ behavior: 'smooth' }); }),
        mk('Dupliquer', async () => { const c = { ...b, id: uid(), name: (b.name || 'Build') + ' (copie)', updated: Date.now() }; await persist(c); }),
        mk('Supprimer', async () => { if (confirm('Supprimer ce build ?')) { await store.del(b.id); builds = builds.filter((x) => x.id !== b.id); renderList(); } }));
      card.append(left, acts); box.append(card);
    });
  }
  async function persist(b) {
    const saved = await store.save(b);
    const i = builds.findIndex((x) => x.id === saved.id);
    if (i >= 0) builds[i] = saved; else builds.unshift(saved);
    builds.sort((x, y) => (y.updated || 0) - (x.updated || 0));
    renderList();
    return saved;
  }
  function status(msg, bad) { const s = $('#bStatus'); s.textContent = msg; s.className = 'status' + (bad ? ' bad' : ''); setTimeout(() => { if (s.textContent === msg) s.textContent = ''; }, 4000); }

  /* ---------- Actions ---------- */
  $('#bSave').addEventListener('click', async () => {
    const s = read();
    if (!s.name) { status('Donne un nom à ton build avant de l’enregistrer.', true); f.name.focus(); return; }
    s.id = current.id || uid(); s.updated = Date.now();
    const a = analyse(s); s.review = { score: a.score, at: s.updated, ai: current.review && current.review.ai || '' };
    try { current = await persist(s); status('Build enregistré.'); } catch (e) { status('Échec de l’enregistrement.', true); }
  });
  $('#bNew').addEventListener('click', () => { write(blank()); renderAI(''); status('Nouveau build.'); });
  $('#bAIBtn').addEventListener('click', async () => {
    if (!ai) return;
    const s = read(); const btn = $('#bAIBtn'); btn.disabled = true; btn.textContent = 'Analyse en cours…';
    try {
      const r = await fetch('/api/build-review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ build: { ...s, review: undefined }, local: analyse(s) }) });
      const d = await r.json(); if (!r.ok || !d.reply) throw new Error(d.error || 'erreur');
      current.review = { ...(current.review || {}), ai: d.reply, score: analyse(s).score }; renderAI(d.reply);
      if (current.id) { current = { ...read(), id: current.id, review: current.review, updated: Date.now() }; await persist(current); }
      status('Retour IA reçu.');
    } catch (e) { status('L’IA ne répond pas pour le moment.', true); }
    btn.disabled = false; btn.textContent = 'Demander un retour IA';
  });
  $('#bExport').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify({ app: 'rell-seas-atlas', builds }, null, 2)], { type: 'application/json' });
    const a = el('a'); a.href = URL.createObjectURL(blob); a.download = 'mes-builds-rell-seas.json'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $('#bImport').addEventListener('change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    try {
      const j = JSON.parse(await file.text()); const list = Array.isArray(j) ? j : j.builds;
      let n = 0; for (const b of (list || []).slice(0, 50)) { if (b && typeof b === 'object' && b.race && b.cls) { await persist({ ...blank(), ...b, id: uid(), updated: Date.now() }); n++; } }
      status(n + ' build(s) importé(s).');
    } catch (err) { status('Fichier illisible.', true); }
    e.target.value = '';
  });

  [f.name, f.goal, f.faction, f.cls, f.weapon, f.fruit, f.style, f.agile, f.fierce, f.tactic, f.extra, f.jobMain, f.notes, ...f.spiritual].forEach((x) => x.addEventListener('input', () => sync()));
  f.race.addEventListener('change', () => { refreshSubs(''); sync(); });
  f.sub.addEventListener('change', () => sync());

  /* ---------- Démarrage ---------- */
  Promise.all([fetch('builder-data.json', { cache: 'no-cache' }).then((r) => r.json()), fetch('/api/status', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).catch(() => null)]).then(async ([d, st]) => {
    data = d; ai = !!(st && st.ai);
    buildForm(); write(blank());
    const btn = $('#bAIBtn');
    btn.disabled = !ai;
    $('#bAINote').textContent = ai ? 'L’IA analyse ton build à partir de la base de connaissances de l’Atlas.' : 'IA indisponible : lance server.py avec une clé GROQ_API_KEY. Le retour automatique ci-dessus fonctionne déjà.';
    builds = (await store.init()).sort((x, y) => (y.updated || 0) - (x.updated || 0)); renderList();
    const id = new URLSearchParams(location.search).get('id'); const found = id && builds.find((b) => b.id === id); if (found) { write(found); renderAI(found.review && found.review.ai); }
  });
})();
