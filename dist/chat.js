/* Assistant de l'Atlas : réponses préfaites + suggestions pendant la frappe.
   Si le serveur local (server.py) expose /api/chat, les questions sans réponse
   préfaite sont envoyées à l'IA. Aucune clé n'est stockée dans ce fichier. */
(() => {
  const norm = (s) => s.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().replace(/[’']/g, ' ').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const STOP = new Set('le la les un une des du de d l et ou a au aux en dans sur est sont ce ca cest quoi que qui quel quelle quels quelles comment ou y on il elle je tu nous vous pour par avec sans mais donc the jeu site'.split(' '));
  const toks = (s) => norm(s).split(' ').filter((t) => t && !STOP.has(t));
  const near = (a, b) => { // distance d'édition <= 1
    if (Math.abs(a.length - b.length) > 1) return false;
    let i = 0, j = 0, d = 0;
    while (i < a.length && j < b.length) {
      if (a[i] === b[j]) { i++; j++; continue; }
      if (++d > 1) return false;
      if (a.length > b.length) i++; else if (a.length < b.length) j++; else { i++; j++; }
    }
    return d + (a.length - i) + (b.length - j) <= 1;
  };

  let kb = [], topics = [], starters = [], ai = false, busy = false;
  const history = [];

  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

  /* ---------- UI ---------- */
  const fab = el('button', 'chat-fab');
  fab.type = 'button';
  fab.setAttribute('aria-label', 'Ouvrir l’assistant de l’Atlas');
  fab.setAttribute('aria-expanded', 'false');
  fab.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path fill="currentColor" d="M12 2 13.8 8.2 20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z"/></svg>';

  const panel = el('section', 'chat');
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Assistant de l’Atlas RELL Seas');
  panel.hidden = true;
  const head = el('header', 'chat-head');
  const title = el('div', 'chat-title');
  title.append(el('strong', '', 'Assistant Atlas'), el('span', 'chat-mode', 'Réponses préfaites'));
  const close = el('button', 'chat-x', '×');
  close.type = 'button';
  close.setAttribute('aria-label', 'Fermer l’assistant');
  head.append(title, close);

  const log = el('div', 'chat-log');
  log.setAttribute('aria-live', 'polite');
  const bar = el('div', 'chat-topics');
  bar.setAttribute('role', 'toolbar');
  bar.setAttribute('aria-label', 'Sujets');
  const sugg = el('ul', 'chat-sugg');
  sugg.setAttribute('role', 'listbox');
  sugg.id = 'chat-sugg';
  const form = el('form', 'chat-form');
  const input = el('input');
  input.type = 'text';
  input.placeholder = 'Pose une question…';
  input.autocomplete = 'off';
  input.maxLength = 300;
  input.setAttribute('role', 'combobox');
  input.setAttribute('aria-expanded', 'false');
  input.setAttribute('aria-controls', 'chat-sugg');
  input.setAttribute('aria-label', 'Ta question');
  const send = el('button', 'chat-send', 'Envoyer');
  send.type = 'submit';
  form.append(input, send);
  const foot = el('p', 'chat-foot', 'Site de fans : beaucoup d’infos sont des hypothèses communautaires.');
  panel.append(head, log, bar, sugg, form, foot);
  document.body.append(fab, panel);

  /* ---------- Messages ---------- */
  function bubble(who, text, link) {
    const m = el('div', 'msg ' + who);
    m.append(el('p', '', text));
    if (link) {
      const a = el('a', 'msg-link', link[1] + ' →');
      a.href = link[0];
      m.append(a);
    }
    log.append(m);
    log.scrollTop = log.scrollHeight;
    return m;
  }
  const block = (label, entries) => {
    const wrap = el('div', 'msg-rel');
    if (label) wrap.append(el('span', 'rel-label', label));
    entries.forEach((e) => {
      const b = el('button', 'chip-q', e.q);
      b.type = 'button';
      b.addEventListener('click', () => ask(e.q, e));
      wrap.append(b);
    });
    log.append(wrap);
    log.scrollTop = log.scrollHeight;
  };
  const topicOf = (id) => topics.find((t) => t.id === id);
  function related(entry) {
    const same = kb.filter((e) => e.t === entry.t && e !== entry).slice(0, 5);
    const t = topicOf(entry.t);
    if (same.length) block('Précisions · ' + (t ? t.label : ''), same);
    const more = rank(entry.q + ' ' + entry.k).filter((r) => r.e.t !== entry.t).slice(0, 2).map((r) => r.e);
    if (more.length) block('Voir aussi', more);
  }
  function openTopic(t) {
    if (busy) return;
    bubble('me', t.icon + ' ' + t.label);
    bubble('bot', 'Sujet « ' + t.label + ' » : que veux-tu savoir ?');
    block('', kb.filter((e) => e.t === t.id));
    input.value = '';
    showSugg();
  }
  function buildBar() {
    bar.textContent = '';
    topics.forEach((t) => {
      const b = el('button', 'topic', t.icon + ' ' + t.label);
      b.type = 'button';
      b.addEventListener('click', () => openTopic(t));
      bar.append(b);
    });
  }

  /* ---------- Recherche ---------- */
  function rank(query) {
    const q = toks(query);
    const nq = norm(query);
    if (!q.length) return [];
    return kb.map((e) => {
      const words = e._w;
      let s = 0;
      q.forEach((t) => {
        if (words.has(t)) s += 2;
        else if (t.length >= 3 && [...words].some((w) => w.startsWith(t))) s += 1.3;
        else if (t.length >= 5 && [...words].some((w) => w.length >= 5 && near(t, w))) s += 1.1;
      });
      s = s / q.length;
      if (e._q.includes(nq) && nq.length > 2) s += 1;
      return { e, s };
    }).filter((r) => r.s > 0).sort((a, b) => b.s - a.s);
  }

  /* ---------- Suggestions ---------- */
  let sel = -1, items = [];
  function showSugg() {
    sugg.textContent = '';
    sel = -1;
    const v = input.value.trim();
    if (v.length < 2) {
      items = log.querySelector('.msg.me') ? [] : starters.slice(0, 3).map((q) => kb.find((e) => e.q === q)).filter(Boolean).map((e) => ({ label: e.q, e }));
    } else {
      const nv = norm(v);
      const tt = topics.filter((t) => norm(t.label).startsWith(nv) || toks(t.k).some((w) => w.startsWith(nv)) || toks(v).some((w) => w.length > 2 && toks(t.k).includes(w)))
        .slice(0, 2).map((t) => ({ label: t.icon + ' Sujet : ' + t.label, topic: t, fill: t.label }));
      const qq = rank(v).filter((r) => r.s >= 0.6).slice(0, 5 - tt.length).map((r) => ({ label: r.e.q, e: r.e }));
      items = [...tt, ...qq];
    }
    items.forEach((it, i) => {
      const li = el('li', it.topic ? 'is-topic' : '', it.label);
      li.setAttribute('role', 'option');
      li.id = 'sg' + i;
      li.addEventListener('mousedown', (ev) => { ev.preventDefault(); choose(it); });
      sugg.append(li);
    });
    sugg.classList.toggle('empty', !items.length);
    input.setAttribute('aria-expanded', String(!!items.length));
  }
  function choose(it) {
    if (it.topic) openTopic(it.topic); else ask(it.e.q, it.e);
  }
  function move(d) {
    if (!items.length) return;
    sel = (sel + d + items.length) % items.length;
    [...sugg.children].forEach((li, i) => li.classList.toggle('on', i === sel));
    input.setAttribute('aria-activedescendant', 'sg' + sel);
    input.value = items[sel].fill || items[sel].e.q; /* pré-remplissage */
  }

  /* ---------- Réponse ---------- */
  async function ask(text, direct) {
    text = text.trim();
    if (!text || busy) return;
    bubble('me', text);
    input.value = '';
    showSugg();
    history.push({ role: 'user', content: text });
    const hit = direct ? { e: direct, s: 99 } : rank(text)[0];
    if (hit && hit.s >= 1.1) {
      bubble('bot', hit.e.a, hit.e.l);
      history.push({ role: 'assistant', content: hit.e.a });
      related(hit.e);
      return;
    }
    if (ai) {
      busy = true;
      const wait = bubble('bot typing', 'Je réfléchis…');
      try {
        const r = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: history.slice(-6) }) });
        const d = await r.json();
        wait.remove();
        if (!r.ok || !d.reply) throw new Error(d.error || 'erreur');
        const m = bubble('bot ai', d.reply);
        m.append(el('span', 'ai-tag', 'Généré par IA · à vérifier'));
        history.push({ role: 'assistant', content: d.reply });
      } catch (err) {
        wait.remove();
        bubble('bot', 'L’IA ne répond pas pour le moment. Voici des questions proches :');
        near3(text);
      }
      busy = false;
      return;
    }
    bubble('bot', 'Je n’ai pas de réponse préfaite pour ça. Essaie une de ces questions :');
    near3(text);
  }
  function near3(text) {
    const list = rank(text).slice(0, 3).map((r) => r.e);
    block('', list.length ? list : starters.map((q) => kb.find((e) => e.q === q)).filter(Boolean).slice(0, 3));
  }

  /* ---------- Ouverture ---------- */
  let greeted = false;
  function open() {
    panel.hidden = false;
    fab.setAttribute('aria-expanded', 'true');
    document.body.classList.add('chat-open');
    if (!greeted) {
      greeted = true;
      bubble('bot', 'Salut ! Choisis un sujet ci-dessous (Haki, Fruits, Races…) ou écris ta question : je te propose des questions au fur et à mesure.');
    }
    if (!log.querySelector('.topic-grid') && topics.length) {
      const g = el('div', 'topic-grid');
      topics.forEach((t) => {
        const b = el('button', 'tile');
        b.type = 'button';
        b.append(el('span', 'tile-i', t.icon), el('span', 'tile-t', t.label));
        b.addEventListener('click', () => openTopic(t));
        g.append(b);
      });
      log.append(g);
    }
    showSugg();
    setTimeout(() => input.focus(), 30);
  }
  function shut() {
    panel.hidden = true;
    fab.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('chat-open');
    fab.focus();
  }
  fab.addEventListener('click', () => (panel.hidden ? open() : shut()));
  close.addEventListener('click', shut);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const it = sel >= 0 ? items[sel] : null;
    if (it && it.topic) openTopic(it.topic); else ask(input.value, it ? it.e : null);
  });
  input.addEventListener('input', showSugg);
  input.addEventListener('focus', showSugg);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
    else if (e.key === 'Tab' && items.length && !e.shiftKey && sel < 0 && input.value.trim().length >= 2) { e.preventDefault(); input.value = items[0].fill || items[0].e.q; showSugg(); }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !panel.hidden) { e.preventDefault(); shut(); return; }
    if (e.key.toLowerCase() === 'c' && !e.metaKey && !e.ctrlKey && !e.altKey && panel.hidden && !e.target.closest('input, textarea, select, [contenteditable], dialog[open]')) { e.preventDefault(); open(); }
  });

  /* ---------- Chargement ---------- */
  fetch('kb.json').then((r) => r.json()).then((d) => {
    kb = d.entries.map((e) => ({ ...e, _q: norm(e.q), _w: new Set([...toks(e.k), ...toks(e.q)]) }));
    starters = d.starters || [];
    topics = d.topics || [];
    buildBar();
  }).catch(() => { fab.hidden = true; });

  fetch('/api/status', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)).then((d) => {
    if (d && d.ai) { ai = true; panel.querySelector('.chat-mode').textContent = 'Réponses préfaites + IA'; }
  }).catch(() => {});
})();
