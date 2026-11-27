/* Fond étoilé animé : étoiles scintillantes en parallaxe, étoiles filantes, nébuleuses douces. */
(() => {
  const host = document.querySelector('.night-sky');
  if (!host) return;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  host.appendChild(canvas);
  host.classList.add('has-canvas');

  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TINTS = ['255,255,255', '200,225,255', '190,205,255', '225,205,255', '175,240,255'];
  const LAYERS = [
    { speed: 4, size: [0.5, 1], depth: 6, density: 1 / 1500 },
    { speed: 9, size: [0.7, 1.4], depth: 14, density: 1 / 4200 },
    { speed: 18, size: [1.1, 2], depth: 28, density: 1 / 14000 },
  ];

  const MOTION = {
    calm: [-0.35, -1, 1, 1], drift: [-1, -0.12, 2.6, 1.2], embers: [0.18, -1, 3.2, 1.8],
    swirl: [0.55, -0.7, 2, 1.4], rain: [0.25, 1, 3.4, 1.6],
  };
  const vec = { x: -0.35, y: -1, k: 1, shot: 1 };
  const tintNow = [255, 255, 255];
  const root = document.documentElement;
  let w = 0, h = 0, dpr = 1, stars = [], shooters = [];
  let mx = 0, my = 0, px = 0, py = 0, last = 0, nextShot = 2500, raf = 0;

  const rand = (a, b) => a + Math.random() * (b - a);

  function build() {
    stars = [];
    LAYERS.forEach((layer, li) => {
      const count = Math.round(w * h * layer.density);
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: rand(layer.size[0], layer.size[1]),
          layer: li,
          tint: 0, rgb: TINTS[(Math.random() * TINTS.length) | 0].split(',').map(Number),
          phase: Math.random() * Math.PI * 2,
          rate: rand(0.4, 1.8),
          base: rand(0.45, 1),
        });
      }
    });
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    build();
    if (reduced) draw(0, 0);
  }

  function spawnShooter() {
    const fromLeft = Math.random() > 0.5;
    const angle = rand(0.35, 0.65);
    const speed = rand(520, 820);
    shooters.push({
      x: fromLeft ? rand(-50, w * 0.5) : rand(w * 0.5, w + 50),
      y: rand(-20, h * 0.4),
      vx: (fromLeft ? 1 : -1) * Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 0,
      max: rand(0.7, 1.2),
      len: rand(90, 170),
    });
  }

  function draw(t, dt) {
    ctx.clearRect(0, 0, w, h);

    px += (mx - px) * 0.04;
    py += (my - py) * 0.04;

    /* Mouvement et teinte : suivent la zone (data-motion) et l'accent CSS animé. */
    const m = MOTION[root.dataset.motion] || MOTION.calm;
    vec.x += (m[0] - vec.x) * 0.03; vec.y += (m[1] - vec.y) * 0.03;
    vec.k += (m[2] - vec.k) * 0.03; vec.shot += (m[3] - vec.shot) * 0.03;
    const acc = /rgba?\((\d+)[ ,]+(\d+)[ ,]+(\d+)/.exec(getComputedStyle(root).getPropertyValue('--accent'));
    if (acc) for (let i = 0; i < 3; i++) tintNow[i] += (+acc[i + 1] - tintNow[i]) * 0.05;
    const TK = 0.55;

    for (const s of stars) {
      const layer = LAYERS[s.layer];
      if (!reduced) {
        s.y += vec.y * layer.speed * vec.k * dt;
        s.x += vec.x * layer.speed * vec.k * dt;
        if (s.y < -4) { s.y = h + 4; s.x = Math.random() * w; }
        else if (s.y > h + 4) { s.y = -4; s.x = Math.random() * w; }
        if (s.x < -4) { s.x = w + 4; s.y = Math.random() * h; }
        else if (s.x > w + 4) { s.x = -4; s.y = Math.random() * h; }
      }
      const x = s.x + px * layer.depth;
      const y = s.y + py * layer.depth;
      const tw = reduced ? 1 : 0.55 + 0.45 * Math.sin(t * 0.001 * s.rate + s.phase);
      const a = s.base * tw;
      const c = ((s.rgb[0] + (tintNow[0] - s.rgb[0]) * TK) | 0) + ',' + ((s.rgb[1] + (tintNow[1] - s.rgb[1]) * TK) | 0) + ',' + ((s.rgb[2] + (tintNow[2] - s.rgb[2]) * TK) | 0);
      ctx.fillStyle = `rgba(${c},${a.toFixed(3)})`;
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
      if (s.layer === 2) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, s.r * 6);
        g.addColorStop(0, `rgba(${c},${(a * 0.35).toFixed(3)})`);
        g.addColorStop(1, `rgba(${c},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, s.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = shooters.length - 1; i >= 0; i--) {
      const s = shooters[i];
      s.life += dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      const k = s.life / s.max;
      if (k >= 1) { shooters.splice(i, 1); continue; }
      const fade = Math.sin(k * Math.PI);
      const mag = Math.hypot(s.vx, s.vy);
      const tx = s.x - (s.vx / mag) * s.len;
      const ty = s.y - (s.vy / mag) * s.len;
      const g = ctx.createLinearGradient(s.x, s.y, tx, ty);
      g.addColorStop(0, `rgba(220,240,255,${(0.95 * fade).toFixed(3)})`);
      g.addColorStop(0.4, `rgba(140,190,255,${(0.35 * fade).toFixed(3)})`);
      g.addColorStop(1, 'rgba(140,190,255,0)');
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
    }
  }

  function frame(now) {
    const dt = Math.min((now - last) / 1000 || 0, 0.05);
    last = now;
    nextShot -= dt * 1000;
    if (nextShot <= 0) {
      spawnShooter();
      nextShot = rand(4500, 11000) / vec.shot;
    }
    draw(now, dt);
    raf = requestAnimationFrame(frame);
  }

  function start() {
    if (reduced || raf) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointermove', (e) => {
    mx = (e.clientX / w - 0.5) * -1;
    my = (e.clientY / h - 0.5) * -1;
  }, { passive: true });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));

  resize();
  start();

  /* Apparition douce des sections au défilement. */
  if (!reduced && 'IntersectionObserver' in window) {
    const targets = document.querySelectorAll('main section:not(.hero) > *, .build, .entry-grid > *, .timeline li');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    targets.forEach((el) => { el.classList.add('reveal'); io.observe(el); });
  }
})();
