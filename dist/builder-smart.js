/* Créateur de build : objectifs qui pré-remplissent, profil déduit des stats, menus déroulants faits main. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fire = (node, types) => types.forEach((t) => node.dispatchEvent(new Event(t, { bubbles: true })));

  /* ---------------------------------------------------------------- Objectifs */
  const KEYS = ['health', 'endurance', 'defense', 'spiritual', 'willPower', 'luck'];
  const NAMES = { health: 'Health', endurance: 'Endurance', defense: 'Defense', spiritual: 'Spiritual', willPower: 'Will-Power', luck: 'Luck' };
  const PRESETS = {
    'pvp-melee': {
      label: 'PvP mêlée', desc: 'Duel au corps à corps : posture solide, Health et Defense élevées.',
      traits: [28, 18, 24, 5, 20, 5], cls: 'Heavy', style: 'Aucun',
      weapons: ['Leviathan Great Sword', 'Leviathan Mace', 'Leviathan Axe (Set-1)'],
      haki: ['Sir Gawain', 'Sir Lancelot', 'Alexander D. Great', 'Go D. Zilla'], pot: ['Alpha Crasher', 'Strong Puncher', 'Parry God'], agile: 'Wall Bouncer', jobs: [],
    },
    'pvp-mobile': {
      label: 'PvP mobilité', desc: 'Esquive et poursuite : Endurance haute, classe Light.',
      traits: [18, 34, 10, 8, 25, 5], cls: 'Light', style: 'Black Leg',
      weapons: ['Leviathan Short Sword', 'Cat Cutlass'],
      haki: ['Sir Gawain', 'Kanada', 'Khwarizmi', 'Opp E. Heimer'], pot: ['Faster Punch', 'Evade God'], agile: 'Geppo Master', jobs: [],
    },
    'pvp-ranged': {
      label: 'PvP à distance', desc: 'Tir et contrôle de zone : Gunsman, Endurance et Defense.',
      traits: [18, 25, 20, 12, 20, 5], cls: 'Gunsman', style: 'Aucun',
      weapons: ['Leviathan Flintlocks', 'Leviathan Blunderbuss', 'Leviathan Bazooka'],
      haki: ['Khwarizmi', 'Kanada', 'Opp E. Heimer', 'Sir Gawain'], pot: ['M1 God', 'Quick Parry'], agile: 'Wall Bouncer', jobs: [],
    },
    pve: {
      label: 'PvE / boss', desc: 'Encaisser les boss : Health et Defense en tête, posture renforcée.',
      traits: [30, 18, 25, 5, 17, 5], cls: 'Heavy', style: 'Aucun',
      weapons: ['Leviathan Great Sword', 'Leviathan Mace', 'Leviathan Bisento'],
      haki: ['Sir Gawain', 'Sir Lancelot', 'Go D. Zilla', 'Alexander D. Great'], pot: ['Strong Puncher', 'Auto Parry'], agile: 'Mr Windstep', jobs: ['Médecin'],
    },
    explore: {
      label: 'Exploration', desc: 'Parcourir les mers : Endurance, navigation et métiers de terrain.',
      traits: [22, 32, 13, 10, 18, 5], cls: 'Light', style: 'Aucun',
      weapons: ['Leviathan Short Sword', 'Cat Cutlass'],
      haki: ['Sir Gawain', 'Kanada', 'Opp E. Heimer', ''], pot: ['Faster Punch', 'Evade God'], agile: 'Flash Dash', main: 'Navigation', jobs: ['Minage'],
    },
    naval: {
      label: 'Combat naval', desc: 'Barrer et tenir le pont : Navigation et classe équilibrée.',
      traits: [22, 28, 15, 10, 20, 5], cls: 'Medium', style: 'Aucun',
      weapons: ['Leviathan Katana', 'Leviathan Spear', 'Leviathan Sword'],
      haki: ['Sir Gawain', 'Khwarizmi', '', ''], pot: ['Faster Punch', 'Parry God'], agile: 'Flash Dash', main: 'Navigation', jobs: ['Artisanat'],
    },
    economy: {
      label: 'Économie / craft', desc: 'Produire et vendre : deux métiers de production, stats équilibrées.',
      traits: [22, 25, 15, 8, 25, 5], cls: 'Medium', style: 'Aucun',
      weapons: ['Leviathan Katana', 'Leviathan Sword'],
      haki: ['Sir Gawain', '', '', ''], pot: [], agile: '', main: 'Artisanat', jobs: ['Minage', 'Cuisine'],
    },
    hybrid: {
      label: 'Polyvalent', desc: 'Aucun domaine dominant : une base saine pour tester.',
      traits: [20, 25, 15, 10, 25, 5], cls: 'Medium', style: 'Aucun',
      weapons: ['Leviathan Katana', 'Leviathan Sword'],
      haki: ['Sir Gawain', 'Kanada', '', ''], pot: ['Faster Punch', 'Auto Parry'], agile: 'Flash Dash', jobs: [],
    },
  };
  const POT_SLOT = { fierce: ['Alpha Crasher', 'M1 God', 'Full Stack', 'Faster Punch', 'Strong Puncher', 'Down God', 'James Bond'], tactic: ['Auto Parry', 'Parry God', 'Quick Parry', 'Evade God', 'Parryingan'] };

  const has = (sel, v) => $$('option', sel).some((o) => o.value === v);
  const put = (sel, v) => { if (sel && has(sel, v)) { sel.value = v; fire(sel, ['input', 'change']); } };
  const optClass = (o) => (o.textContent.split(' · ')[1] || '').trim();

  function snapshot() {
    const s = { sel: {}, rng: {}, jobs: $$('#bJobs input').map((c) => [c, c.checked]) };
    ['bGoal', 'bClass', 'bStyle', 'bWeapon', 'bHaki1', 'bHaki2', 'bHaki3', 'bHaki4', 'bAgile', 'bFierce', 'bTactic', 'bJobMain'].forEach((id) => { const n = $('#' + id); if (n) s.sel[id] = n.value; });
    KEYS.forEach((k) => { s.rng[k] = $('#t-' + k)?.value; });
    return s;
  }
  function restore(s) {
    Object.entries(s.sel).forEach(([id, v]) => { const n = $('#' + id); if (n) { n.value = v; fire(n, ['input']); } });
    KEYS.forEach((k) => { const r = $('#t-' + k); if (r) { r.value = s.rng[k]; fire(r, ['input']); } });
    s.jobs.forEach(([c, v]) => { c.checked = v; });
    fire($('#bJobMain') || document, ['input']);
  }

  let skipPrefill = false;

  /* Affinités raciales (hypothèses du codex) et classes cohérentes avec chaque race */
  const RACE_EN = { Humain: 'Human', 'Trois yeux': 'Three Eyes', Avalonien: 'Avalonian', Lunaria: 'Lunarian', Oni: 'Oni', Géant: 'Giant', Cyborg: 'Cyborg', 'Homme-bête': 'Beastman', Marinien: 'Marinian', Nain: 'Dwarf' };
  const AFFINITY = {
    health: ['Giant', 'Oni', 'Lunarian'], endurance: ['Beastman', 'Marinian', 'Avalonian', 'Dwarf'], defense: ['Lunarian', 'Cyborg', 'Giant', 'Oni'],
    spiritual: ['Three Eyes', 'Avalonian', 'Lunarian'], willPower: ['Oni', 'Three Eyes', 'Human', 'Lunarian'],
  };
  const RACE_CLASS = { Humain: ['Medium'], 'Trois yeux': ['Gunsman', 'Medium'], Avalonien: ['Light'], Lunaria: ['Heavy', 'Medium'], Oni: ['Heavy'], Géant: ['Heavy'], Cyborg: ['Gunsman', 'Heavy'], 'Homme-bête': ['Light'], Marinien: ['Light', 'Medium'], Nain: ['Light', 'Gunsman'] };

  /* Préréglage de l'objectif ajusté à la race : classe cohérente, stats déplacées vers les traits affines. */
  function tune(goal, race) {
    const p = PRESETS[goal];
    const good = RACE_CLASS[race] || [];
    const keepsClass = !good.length || good.includes(p.cls);
    const cls = keepsClass ? p.cls : good[0];
    const traits = [...p.traits];
    const en = RACE_EN[race];
    const aff = KEYS.map((k) => (AFFINITY[k] || []).includes(en));
    let moved = 0;
    aff.forEach((is, i) => { if (is) { traits[i] += 3; moved += 3; } });
    while (moved > 0) {
      let j = -1; let m = -1;
      traits.forEach((v, i) => { if (!aff[i] && v > m && v > 5) { m = v; j = i; } });
      if (j < 0) break;
      traits[j] -= 1; moved -= 1;
    }
    while (moved > 0) { traits[traits.indexOf(Math.max(...traits))] -= 1; moved -= 1; }
    return { cls, keepsClass, traits, boosted: KEYS.filter((k, i) => aff[i]).map((k) => NAMES[k]), good };
  }

  function pickWeapon(p, cls) {
    const wsel = $('#bWeapon');
    if (!wsel) return;
    const byClass = (o) => o.value && optClass(o) === cls;
    const pick = (cls === p.cls ? p.weapons.find((n) => has(wsel, n)) : null) || $$('option', wsel).find(byClass)?.value;
    if (pick) put(wsel, pick);
  }

  function applyGoal(goal, opts = {}) {
    const p = PRESETS[goal];
    if (!p) return;
    const race = $('#bRace')?.value || '';
    const t = tune(goal, race);
    const before = snapshot();
    t.traits.forEach((v, i) => { const r = $('#t-' + KEYS[i]); if (r) { r.value = v; fire(r, ['input']); } });
    put($('#bClass'), t.cls);
    pickWeapon(p, t.cls);
    if (!opts.raceOnly) {
      put($('#bStyle'), p.style);
      p.haki.forEach((v, i) => put($('#bHaki' + (i + 1)), v));
      put($('#bAgile'), p.agile || '');
      put($('#bFierce'), p.pot.find((n) => POT_SLOT.fierce.includes(n)) || '');
      put($('#bTactic'), p.pot.find((n) => POT_SLOT.tactic.includes(n)) || '');
      put($('#bJobMain'), p.main || '');
      const wanted = p.jobs.slice(0, 2);
      $$('#bJobs input').forEach((c) => { c.checked = wanted.includes(c.value); });
    }
    fire($('#bName'), ['input']);
    const raceNote = race ? ' · ' + race + (t.boosted.length ? ' renforce ' + t.boosted.join(', ') : '') + (t.keepsClass ? '' : ' · classe ' + t.cls + ' (' + p.cls + ' hors profil de la race)') : '';
    toast(opts.raceOnly
      ? 'Race ' + race + ' : classe et stats ajustées à l’objectif « ' + p.label + ' »' + (t.boosted.length ? ' (' + t.boosted.join(', ') + ' en hausse).' : '.')
      : 'Objectif « ' + p.label + ' » appliqué' + raceNote + '.', () => restore(before));
  }

  /* ---------------------------------------------------------------- Message avec annulation */
  let toastTimer = 0; let toastEl;
  function toast(msg, undo) {
    toastEl = toastEl || document.body.appendChild(el('div', 'b-toast'));
    toastEl.textContent = '';
    toastEl.append(el('span', '', esc(msg)));
    if (undo) {
      const b = el('button', 'btn', 'Annuler'); b.type = 'button';
      b.addEventListener('click', () => { undo(); toastEl.classList.remove('show'); });
      toastEl.append(b);
    }
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 9000);
  }

  /* ---------------------------------------------------------------- Profil déduit des stats */
  function profile() {
    const box = $('#bProfile'); if (!box) return;
    const raw = KEYS.map((k) => +($('#t-' + k)?.value || 0));
    const total = raw.reduce((a, b) => a + b, 0);
    const cls = $('#bClass')?.value;
    const goal = $('#bGoal')?.value;
    if (!total) { box.innerHTML = ''; return; }
    const v = raw.map((x) => (x * 100) / total);
    const scored = Object.entries(PRESETS).map(([id, p]) => {
      const dist = p.traits.reduce((a, t, i) => a + Math.abs(t - v[i]), 0);
      let sim = Math.max(0, 100 - dist * 1.7);
      if (p.cls === cls) sim = Math.min(100, sim + 8);
      return { id, p, sim: Math.round(sim) };
    }).sort((a, b) => b.sim - a.sim);
    const best = scored[0];
    const top = raw.map((x, i) => [KEYS[i], x]).sort((a, b) => b[1] - a[1]).slice(0, 2).map(([k]) => NAMES[k]);
    const cur = scored.find((s) => s.id === goal);
    let verdict;
    if (best.id === goal) verdict = 'Tes stats collent à ton objectif.';
    else if (cur && best.sim - cur.sim >= 8) verdict = 'Tes stats ressemblent plus à « ' + best.p.label + ' » (' + best.sim + ' %) qu’à ton objectif « ' + cur.p.label + ' » (' + cur.sim + ' %).';
    else verdict = 'Tes stats restent proches de ton objectif.';
    box.innerHTML = '<h3>Profil de tes stats</h3><p class="pf-lead"><b>' + esc(best.p.label) + '</b> <span>' + best.sim + ' % de ressemblance</span></p>'
      + '<p class="pf-desc">' + esc(best.p.desc) + '</p><p class="pf-strong">Traits dominants : ' + esc(top.join(' et ')) + (total !== 100 ? ' · total ' + total + '/100, ramené à 100 pour la comparaison' : '') + '</p>'
      + '<ul class="pf-list">' + scored.slice(0, 4).map((s) => '<li class="' + (s.id === goal ? 'on' : '') + '"><span>' + esc(s.p.label) + '</span><i><u style="width:' + s.sim + '%"></u></i><b>' + s.sim + ' %</b>'
        + (s.id !== goal ? '<button type="button" data-goal="' + s.id + '" aria-label="Choisir l’objectif ' + esc(s.p.label) + '">Choisir</button>' : '<em>Objectif</em>') + '</li>').join('') + '</ul>'
      + '<p class="pf-verdict">' + esc(verdict) + '</p>';
  }

  /* ---------------------------------------------------------------- Menus déroulants faits main */
  const CAPTIONS = {
    bGoal: Object.fromEntries(Object.entries(PRESETS).map(([k, p]) => [k, p.desc])),
    bClass: { Light: 'Rapide, mobile, enchaînements.', Medium: 'Équilibre dégâts, vitesse, portée.', Heavy: 'Fort impact, pression sur la posture.', Gunsman: 'Distance et contrôle de zone.' },
    bFaction: { Pirates: 'Équipage et liberté.', Marines: 'Ordre, justice, 21 rangs.', Révolutionnaires: 'Faction pré-release.', Gouvernement: 'Faction pré-release.' },
  };
  let pop; let current;
  const closePop = () => { if (pop) { pop.hidden = true; } if (current) { current.btn.setAttribute('aria-expanded', 'false'); current = null; } };
  function openPop(inst) {
    closePop();
    pop = pop || document.body.appendChild(el('ul', 'fsel-list'));
    pop.setAttribute('role', 'listbox');
    pop.textContent = '';
    const cap = CAPTIONS[inst.sel.id] || {};
    let first = true;
    const addOpt = (o) => {
      const li = el('li', 'fsel-opt' + (o.value === inst.sel.value ? ' on' : ''));
      li.setAttribute('role', 'option');
      li.setAttribute('aria-selected', String(o.value === inst.sel.value));
      li.tabIndex = -1;
      li.dataset.value = o.value;
      li.innerHTML = '<b>' + esc(o.textContent) + '</b>' + (cap[o.value] ? '<small>' + esc(cap[o.value]) + '</small>' : '');
      li.addEventListener('click', () => choose(inst, o.value));
      pop.append(li);
    };
    [...inst.sel.children].forEach((n) => {
      if (n.tagName === 'OPTGROUP') { pop.append(el('li', 'fsel-group', esc(n.label))); [...n.children].forEach(addOpt); } else addOpt(n);
      first = false;
    });
    const r = inst.btn.getBoundingClientRect();
    pop.hidden = false;
    pop.style.minWidth = r.width + 'px';
    pop.style.left = Math.max(8, Math.min(r.left, innerWidth - Math.max(r.width, 260) - 8)) + 'px';
    const room = innerHeight - r.bottom;
    const h = Math.min(pop.scrollHeight, 320);
    if (room < h + 16 && r.top > room) { pop.style.top = ''; pop.style.bottom = (innerHeight - r.top + 6) + 'px'; pop.style.maxHeight = Math.min(320, r.top - 16) + 'px'; }
    else { pop.style.bottom = ''; pop.style.top = (r.bottom + 6) + 'px'; pop.style.maxHeight = Math.min(320, room - 16) + 'px'; }
    inst.btn.setAttribute('aria-expanded', 'true');
    current = inst;
    (pop.querySelector('.on') || pop.querySelector('.fsel-opt'))?.focus();
    pop.querySelector('.on')?.scrollIntoView({ block: 'nearest' });
  }
  function choose(inst, value) {
    closePop();
    if (inst.sel.value !== value) {
      inst.sel.value = value;
      if (inst.sel.id === 'bGoal') skipPrefill = false;
      fire(inst.sel, ['input', 'change']);
    }
    inst.btn.focus();
  }
  const TILE_IDS = ['bHaki1', 'bHaki2', 'bHaki3', 'bHaki4', 'bAgile', 'bFierce', 'bTactic', 'bExtra', 'bFruit', 'bWeapon', 'bRace'];
  const insts = [];
  function mount(sel) {
    if (sel.dataset.fsel || sel.classList.contains('pick-hidden') || TILE_IDS.includes(sel.id)) return;
    sel.dataset.fsel = '1';
    const btn = el('button', 'fsel-btn'); btn.type = 'button';
    btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span class="fsel-val"></span><svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 6l5 5 5-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    sel.classList.add('pick-hidden');
    sel.after(btn);
    const inst = { sel, btn, last: null, count: -1 };
    btn.addEventListener('click', () => (current === inst ? closePop() : openPop(inst)));
    btn.addEventListener('keydown', (e) => { if (['ArrowDown', 'ArrowUp'].includes(e.key)) { e.preventDefault(); openPop(inst); } });
    insts.push(inst);
  }
  document.addEventListener('keydown', (e) => {
    if (!current || !pop || pop.hidden) return;
    const opts = $$('.fsel-opt', pop); const i = opts.indexOf(document.activeElement);
    if (e.key === 'Escape') { e.preventDefault(); const b = current.btn; closePop(); b.focus(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); opts[Math.min(opts.length - 1, i + 1)]?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); opts[Math.max(0, i - 1)]?.focus(); }
    else if (e.key === 'Enter' || e.key === ' ') { if (i >= 0) { e.preventDefault(); choose(current, opts[i].dataset.value); } }
    else if (e.key === 'Tab') closePop();
    else if (e.key.length === 1) { const n = opts.find((o) => o.textContent.toLowerCase().startsWith(e.key.toLowerCase())); n?.focus(); }
  });
  document.addEventListener('mousedown', (e) => { if (current && !e.target.closest('.fsel-list, .fsel-btn')) closePop(); });
  addEventListener('scroll', (e) => { if (current && !e.target.closest?.('.fsel-list')) closePop(); }, true);
  addEventListener('resize', closePop);

  function refresh() {
    insts.forEach((i) => {
      const n = i.sel.options.length;
      if (i.last === i.sel.value && i.count === n) return;
      i.last = i.sel.value; i.count = n;
      const o = i.sel.selectedOptions[0];
      const lab = i.btn.querySelector('.fsel-val');
      lab.textContent = o ? o.textContent : '—';
      lab.classList.toggle('placeholder', !i.sel.value && i.sel.options.length > 0 && /^—|Aucun|Sous-esp|À choisir/.test(o?.textContent || ''));
    });
  }

  /* ---------------------------------------------------------------- Démarrage */
  function start() {
    const form = $('#bForm'); const goal = $('#bGoal');
    if (!form || !goal || goal.options.length < 2 || !$('#t-health')) return false;
    $$('select', form).forEach(mount);
    const aside = $('.b-aside');
    if (aside && !$('#bProfile')) { const b = el('div', 'b-profile'); b.id = 'bProfile'; $('#bCard').after(b); }
    goal.addEventListener('change', () => { if (skipPrefill) { skipPrefill = false; return; } applyGoal(goal.value); });
    $('#bRace')?.addEventListener('change', () => applyGoal(goal.value, { raceOnly: true }));
    form.addEventListener('input', () => setTimeout(profile, 0));
    form.addEventListener('change', () => setTimeout(profile, 0));
    aside?.addEventListener('click', (e) => {
      const b = e.target.closest('[data-goal]'); if (!b) return;
      skipPrefill = true; goal.value = b.dataset.goal; fire(goal, ['input', 'change']); skipPrefill = false;
    });
    setInterval(refresh, 250);
    refresh(); profile();
    return true;
  }
  let tries = 0;
  const t = setInterval(() => { if (start() || ++tries > 80) clearInterval(t); }, 150);
})();
