/* ═══════════════════════════════════════
   IKSATECH — Main JS
═══════════════════════════════════════ */

// ─── NAVBAR scroll ───
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 30);
});

// ─── Mobile burger ───
const burger = document.getElementById('navBurger');
const navLinks = document.querySelector('.nav-links');
if (burger) {
  burger.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
  });
}

// ─── SCROLL REVEAL (with stagger) ───
const revealEls = document.querySelectorAll('.reveal');
const obs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      // Stagger siblings in the same grid
      const siblings = Array.from(e.target.parentElement.querySelectorAll('.reveal'));
      const idx = siblings.indexOf(e.target);
      e.target.style.transitionDelay = (idx >= 0 ? Math.min(idx * 0.08, 0.4) : 0) + 's';
      e.target.classList.add('visible');
      obs.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });
revealEls.forEach((el) => obs.observe(el));

// ─── COUNTER animation ───
const counters = document.querySelectorAll('.stat-num[data-target]');
const counterObs = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      const el = e.target;
      const target = parseInt(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      let cur = 0;
      const step = target / 50;
      const timer = setInterval(() => {
        cur += step;
        if (cur >= target) { cur = target; clearInterval(timer); }
        el.textContent = Math.floor(cur) + suffix;
      }, 28);
      counterObs.unobserve(el);
    }
  });
}, { threshold: 0.5 });
counters.forEach((c) => counterObs.observe(c));

// ─── HERO — Aether Flow (particles + lines + mouse repulsion) ───
// ─── LOGO — Mouse Parallax 3D (CSS pur, no Three.js) ───
(function () {
  const logo = document.querySelector('.hero-bigtext img');
  const hero = document.getElementById('hero');
  if (!logo || !hero) return;

  let cx = 0, cy = 0;

  hero.addEventListener('mousemove', e => {
    const r = hero.getBoundingClientRect();
    const mx = ((e.clientX - r.left) / r.width  - 0.5) * 2;
    const my = ((e.clientY - r.top)  / r.height - 0.5) * 2;
    cx += (mx - cx) * 0.08;
    cy += (my - cy) * 0.08;
    logo.style.setProperty('--rx', (-cy * 10) + 'deg');
    logo.style.setProperty('--ry', (cx * 14) + 'deg');
  });

  hero.addEventListener('mouseleave', () => {
    logo.style.setProperty('--rx', '0deg');
    logo.style.setProperty('--ry', '0deg');
  });
})();
(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, animId;
  let particles = [];
  const mouse = { x: null, y: null, radius: 180 };

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.size = Math.random() * 2 + 0.8;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45;
      // Blueish / cyan colors matching IKSATECH theme
      const palette = [
        'rgba(56,189,248,0.85)',
        'rgba(96,165,250,0.8)',
        'rgba(125,211,252,0.75)',
        'rgba(147,197,253,0.7)',
        'rgba(14,165,233,0.85)',
      ];
      this.color = palette[Math.floor(Math.random() * palette.length)];
    }
    update() {
      // Bounce off walls
      if (this.x > W || this.x < 0) this.vx *= -1;
      if (this.y > H || this.y < 0) this.vy *= -1;
      // Mouse repulsion
      if (mouse.x !== null) {
        const dx = mouse.x - this.x, dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius + this.size) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 5;
          this.y -= (dy / dist) * force * 5;
        }
      }
      this.x += this.vx;
      this.y += this.vy;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
    }
  }

  function init() {
    particles = [];
    const count = Math.floor((W * H) / 8500);
    for (let i = 0; i < count; i++) particles.push(new Particle());
  }

  function connect() {
    const maxDist = (W / 7) * (H / 7);
    for (let a = 0; a < particles.length; a++) {
      for (let b = a + 1; b < particles.length; b++) {
        const dx = particles[a].x - particles[b].x;
        const dy = particles[a].y - particles[b].y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < maxDist) {
          const opacity = 1 - dist2 / maxDist;
          // Near mouse → white lines, otherwise blue
          let nearMouse = false;
          if (mouse.x !== null) {
            const mda = Math.sqrt((particles[a].x-mouse.x)**2+(particles[a].y-mouse.y)**2);
            nearMouse = mda < mouse.radius;
          }
          ctx.strokeStyle = nearMouse
            ? `rgba(255,255,255,${opacity * 0.7})`
            : `rgba(56,189,248,${opacity * 0.35})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[a].x, particles[a].y);
          ctx.lineTo(particles[b].x, particles[b].y);
          ctx.stroke();
        }
      }
    }
  }

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    init();
  }
  resize();
  window.addEventListener('resize', resize);

  // Mouse
  const hero = canvas.parentElement;
  hero.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left;
    mouse.y = e.clientY - r.top;
  });
  hero.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    connect();
    animId = requestAnimationFrame(draw);
  }
  animId = requestAnimationFrame(draw);
})();

// ─── FOOTER HOVER TEXT EFFECT ───
(function () {
  const svg = document.getElementById('footerSvg');
  if (!svg) return;
  const revealGrad = document.getElementById('ftReveal');
  if (!revealGrad) return;

  let targetX = 400, targetY = 80;
  let currentX = 400, currentY = 80;
  let hovered = false;
  let raf;

  function lerp(a, b, t) { return a + (b - a) * t; }

  function updateGrad() {
    currentX = lerp(currentX, hovered ? targetX : 400, 0.08);
    currentY = lerp(currentY, hovered ? targetY : 80,  0.08);
    revealGrad.setAttribute('cx', currentX);
    revealGrad.setAttribute('cy', currentY);
    revealGrad.setAttribute('r',  hovered ? 200 : 0);
    raf = requestAnimationFrame(updateGrad);
  }
  updateGrad();

  svg.addEventListener('mouseenter', () => { hovered = true; });
  svg.addEventListener('mouseleave', () => { hovered = false; });
  svg.addEventListener('mousemove', (e) => {
    const rect = svg.getBoundingClientRect();
    // Map pixel position to viewBox (800×160)
    targetX = ((e.clientX - rect.left) / rect.width)  * 800;
    targetY = ((e.clientY - rect.top)  / rect.height) * 160;
  });
})();

// ─── SERVICES CAROUSEL ───
(function () {
  const track = document.getElementById('svcTrack');
  const nextBtn = document.getElementById('svcNext');
  const prevBtn = document.getElementById('svcPrev');
  const dots = document.querySelectorAll('#svcDots .cdot');
  if (!track) return;

  const cards = track.querySelectorAll('.svc-card');
  const total = cards.length;
  let current = 0;
  let perView = window.innerWidth < 560 ? 1 : window.innerWidth < 900 ? 2 : 3;

  function getCardWidth() {
    return cards[0].getBoundingClientRect().width + 24;
  }

  function goTo(idx) {
    const max = total - perView;
    current = Math.max(0, Math.min(idx, max));
    track.style.transform = `translateX(-${current * getCardWidth()}px)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === current));
    prevBtn.disabled = current === 0;
    nextBtn.disabled = current >= max;
  }

  nextBtn.addEventListener('click', () => goTo(current + 1));
  prevBtn.addEventListener('click', () => goTo(current - 1));
  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));

  // Drag / swipe
  let startX = 0, isDragging = false;
  track.addEventListener('mousedown', e => { isDragging = true; startX = e.clientX; track.classList.add('dragging'); });
  window.addEventListener('mousemove', e => { if (!isDragging) return; });
  window.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    track.classList.remove('dragging');
    const diff = startX - e.clientX;
    if (Math.abs(diff) > 60) goTo(diff > 0 ? current + 1 : current - 1);
  });
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
  });

  window.addEventListener('resize', () => {
    perView = window.innerWidth < 560 ? 1 : window.innerWidth < 900 ? 2 : 3;
    goTo(0);
  });

  goTo(0);
})();
// ─── GALERIE — scroll-cards parallax stack ───
(function () {
  const wraps = Array.from(document.querySelectorAll('.gallery-card-wrap'));
  if (!wraps.length) return;

  function update() {
    const vh = window.innerHeight;
    wraps.forEach((wrap, i) => {
      const next = wraps[i + 1];
      if (!next) return; // last card stays full-size

      const nextRect = next.getBoundingClientRect();
      const progress = 1 - Math.min(Math.max(nextRect.top / vh, 0), 1);

      const card = wrap.querySelector('.gallery-card');
      const scale = 1 - progress * 0.08;
      const opacity = 1 - progress * 0.6;

      card.style.transform = `scale(${scale})`;
      card.style.opacity = opacity;
    });
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
})();