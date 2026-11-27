/* Visionneuse plein écran : clic sur une image => agrandissement animé depuis la vignette,
   zoom (molette, pincement, boutons, double-clic), déplacement, navigation, vrai plein écran. */
(() => {
  const SEL = 'main img, .poster-art img';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const IMG_RE = /\.(webp|png|jpe?g|gif|avif|svg)(\?|#|$)/i;
  const eligible = (img) => !img.closest('summary, .lb, .chat, header, footer');
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };

  /* ---- Marquage + apparition au défilement ---- */
  const io = 'IntersectionObserver' in window && !reduced ? new IntersectionObserver((es) => es.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('img-in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -6% 0px', threshold: 0.05 }) : null;
  document.querySelectorAll(SEL).forEach((img) => {
    if (!eligible(img)) return;
    img.classList.add('zoomable');
    if (!img.closest('a')) { img.tabIndex = 0; img.setAttribute('role', 'button'); img.setAttribute('aria-label', 'Agrandir l’image : ' + (img.alt || 'visuel')); }
    if (io && !img.closest('dialog')) { img.classList.add('img-pre'); io.observe(img); }
  });
  document.querySelectorAll('.card-image').forEach((i) => i.classList.add('pop'));

  /* ---- Visionneuse ---- */
  const dlg = el('dialog', 'lb');
  dlg.setAttribute('aria-label', 'Visionneuse d’image');
  const stage = el('div', 'lb-stage');
  const big = el('img', 'lb-img');
  big.draggable = false;
  stage.append(big);
  const bar = el('div', 'lb-bar');
  const btn = (label, txt, fn) => { const b = el('button', 'lb-btn', txt); b.type = 'button'; b.setAttribute('aria-label', label); b.title = label; b.addEventListener('click', fn); return b; };
  const zoomTxt = el('span', 'lb-zoom', '100 %');
  const count = el('span', 'lb-count');
  const bPrev = btn('Image précédente', '‹', () => nav(-1));
  const bNext = btn('Image suivante', '›', () => nav(1));
  bar.append(btn('Dézoomer (−)', '−', () => zoomBy(1 / 1.4)), zoomTxt, btn('Zoomer (+)', '+', () => zoomBy(1.4)),
    btn('Taille d’origine (0)', '1:1', reset), btn('Plein écran (F)', '⛶', toggleFs), count, btn('Fermer (Échap)', '×', () => shut(true)));
  const cap = el('p', 'lb-cap');
  dlg.append(stage, bPrev, bNext, bar, cap);
  document.body.append(dlg);

  let list = [], idx = 0, thumb = null, s = 1, tx = 0, ty = 0;
  const MAX = 8;
  const apply = (smooth) => {
    big.style.transition = smooth && !reduced ? 'transform .25s cubic-bezier(.2,.8,.2,1)' : 'none';
    big.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`;
    zoomTxt.textContent = Math.round(s * 100) + ' %';
    dlg.classList.toggle('zoomed', s > 1.001);
  };
  const clamp = () => {
    const w = big.clientWidth * s, h = big.clientHeight * s;
    const lx = Math.max(0, (w - stage.clientWidth) / 2) + 60, ly = Math.max(0, (h - stage.clientHeight) / 2) + 60;
    tx = Math.max(-lx, Math.min(lx, tx)); ty = Math.max(-ly, Math.min(ly, ty));
  };
  function zoomAt(ns, cx, cy, smooth) {
    ns = Math.max(1, Math.min(MAX, ns));
    const r = ns / s;
    tx = cx - (cx - tx) * r; ty = cy - (cy - ty) * r; s = ns;
    if (s === 1) { tx = 0; ty = 0; }
    clamp(); apply(smooth);
  }
  function zoomBy(f) { zoomAt(s * f, 0, 0, true); }
  function reset() { s = 1; tx = 0; ty = 0; apply(true); }
  const rel = (e) => { const r = stage.getBoundingClientRect(); return [e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2]; };

  function fit() {
    const nw = big.naturalWidth, nh = big.naturalHeight;
    if (!nw || !stage.clientWidth) return;
    const k = Math.min(stage.clientWidth * 0.94 / nw, stage.clientHeight * 0.94 / nh, 4);
    big.style.width = Math.round(nw * k) + 'px';
    big.style.height = Math.round(nh * k) + 'px';
  }
  big.addEventListener('load', () => { fit(); clamp(); apply(false); });
  function load(i) {
    idx = i;
    const src = list[i];
    big.src = src.currentSrc || src.src;
    big.alt = src.alt || '';
    const fig = src.closest('figure');
    cap.textContent = (fig && fig.querySelector('figcaption') ? fig.querySelector('figcaption').textContent : src.alt) || '';
    count.textContent = list.length > 1 ? (i + 1) + ' / ' + list.length : '';
    bPrev.hidden = bNext.hidden = list.length < 2;
    s = 1; tx = 0; ty = 0; apply(false);
  }
  function nav(d) {
    if (list.length < 2) return;
    thumb = null;
    load((idx + d + list.length) % list.length);
    if (!reduced) big.animate([{ opacity: 0, transform: `translateX(${d * 40}px)` }, { opacity: 1, transform: 'none' }], { duration: 260, easing: 'ease-out' });
  }

  function flip(from, to, dur) {
    const fr = from.getBoundingClientRect(), tr = to.getBoundingClientRect();
    if (!fr.width || !tr.width) return null;
    const dx = fr.left + fr.width / 2 - (tr.left + tr.width / 2), dy = fr.top + fr.height / 2 - (tr.top + tr.height / 2), sc = fr.width / tr.width;
    return { dx, dy, sc };
  }
  function open(img) {
    const inDlg = img.closest('dialog');
    list = inDlg ? [img] : [...document.querySelectorAll(SEL)].filter((i) => eligible(i) && !i.closest('dialog') && i.getClientRects().length);
    if (!list.includes(img)) list = [img];
    thumb = img;
    load(list.indexOf(img));
    dlg.showModal();
    fit();
    if (!reduced) {
      const f = flip(img, big);
      if (f) big.animate([{ transform: `translate(${f.dx}px, ${f.dy}px) scale(${f.sc})`, opacity: .55 }, { transform: 'translate(0,0) scale(1)', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' });
    }
  }
  function shut(animated) {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    const done = () => { if (dlg.open) dlg.close(); };
    if (animated && !reduced && thumb && document.contains(thumb) && s === 1) {
      const f = flip(thumb, big);
      if (f) { big.animate([{ transform: 'translate(0,0) scale(1)', opacity: 1 }, { transform: `translate(${f.dx}px, ${f.dy}px) scale(${f.sc})`, opacity: .3 }], { duration: 300, easing: 'cubic-bezier(.4,0,.2,1)', fill: 'forwards' }).onfinish = done; return; }
    }
    done();
  }
  function toggleFs() {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    else if (dlg.requestFullscreen) dlg.requestFullscreen().catch(() => {});
  }

  /* ---- Ouverture : clic ou clavier ---- */
  document.addEventListener('click', (e) => {
    const img = e.target.closest && e.target.closest('img.zoomable');
    if (!img || e.defaultPrevented) return;
    const a = img.closest('a');
    if (a && !IMG_RE.test(a.getAttribute('href') || '')) return; /* vrai lien : on ne détourne pas */
    e.preventDefault();
    open(img);
  });
  document.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches('img.zoomable')) { e.preventDefault(); open(e.target); }
  });

  /* ---- Interactions dans la visionneuse ---- */
  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target === stage) shut(true); });
  dlg.addEventListener('cancel', () => { thumb = null; });
  dlg.addEventListener('close', () => { big.getAnimations().forEach((a) => a.cancel()); big.removeAttribute('src'); });
  stage.addEventListener('wheel', (e) => { e.preventDefault(); const [cx, cy] = rel(e); zoomAt(s * Math.exp(-e.deltaY * 0.0022), cx, cy, false); }, { passive: false });
  big.addEventListener('dblclick', (e) => { const [cx, cy] = rel(e); zoomAt(s > 1.05 ? 1 : 2.6, cx, cy, true); });

  const ptr = new Map();
  let drag = null, pinch0 = 0, s0 = 1;
  stage.addEventListener('pointerdown', (e) => {
    if (e.target !== big) return;
    stage.setPointerCapture(e.pointerId);
    ptr.set(e.pointerId, [e.clientX, e.clientY]);
    if (ptr.size === 2) { const [a, b] = [...ptr.values()]; pinch0 = Math.hypot(a[0] - b[0], a[1] - b[1]); s0 = s; drag = null; }
    else drag = { x: e.clientX, y: e.clientY, tx, ty };
    dlg.classList.add('grabbing');
  });
  stage.addEventListener('pointermove', (e) => {
    if (!ptr.has(e.pointerId)) return;
    ptr.set(e.pointerId, [e.clientX, e.clientY]);
    if (ptr.size === 2 && pinch0) { const [a, b] = [...ptr.values()]; zoomAt(s0 * Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch0, 0, 0, false); }
    else if (drag && s > 1) { tx = drag.tx + e.clientX - drag.x; ty = drag.ty + e.clientY - drag.y; clamp(); apply(false); }
  });
  const up = (e) => { ptr.delete(e.pointerId); pinch0 = 0; drag = null; if (!ptr.size) dlg.classList.remove('grabbing'); };
  stage.addEventListener('pointerup', up);
  stage.addEventListener('pointercancel', up);

  dlg.addEventListener('keydown', (e) => {
    const k = e.key;
    if (k === '+' || k === '=') { e.preventDefault(); zoomBy(1.4); }
    else if (k === '-' || k === '_') { e.preventDefault(); zoomBy(1 / 1.4); }
    else if (k === '0') { e.preventDefault(); reset(); }
    else if (k.toLowerCase() === 'f') { e.preventDefault(); toggleFs(); }
    else if (k === 'ArrowRight') { e.preventDefault(); if (s > 1) { tx -= 80; clamp(); apply(true); } else nav(1); }
    else if (k === 'ArrowLeft') { e.preventDefault(); if (s > 1) { tx += 80; clamp(); apply(true); } else nav(-1); }
    else if (k === 'ArrowUp' && s > 1) { e.preventDefault(); ty += 80; clamp(); apply(true); }
    else if (k === 'ArrowDown' && s > 1) { e.preventDefault(); ty -= 80; clamp(); apply(true); }
  });
  window.addEventListener('resize', () => { if (dlg.open) { fit(); clamp(); apply(false); } });
})();
