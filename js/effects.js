(function () {

  function createParticleNet(section) {
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
    section.style.position = 'relative';
    section.insertBefore(canvas, section.firstChild);

    const ctx = canvas.getContext('2d');
    let W, H, particles = [], animId, visible = false;
    const mouse = { x: null, y: null, radius: 140 };
    const isDark = section.classList.contains('footer') || section.id === 'hero';

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.size = Math.random() * 1.8 + 0.5;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        
        // Adaptive particle colors
        const colors = isDark ? [
          'rgba(56,189,248,.7)',
          'rgba(96,165,250,.65)',
          'rgba(125,211,252,.6)',
          'rgba(14,165,233,.7)',
          'rgba(147,197,253,.55)',
        ] : [
          'rgba(0,102,255,.3)',
          'rgba(0,102,255,.2)',
          'rgba(0,68,204,.25)',
          'rgba(0,140,255,.3)',
          'rgba(0,102,255,.15)',
        ];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      update() {
        if (this.x > W || this.x < 0) this.vx *= -1;
        if (this.y > H || this.y < 0) this.vy *= -1;
        if (mouse.x !== null) {
          const dx = mouse.x - this.x, dy = mouse.y - this.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < mouse.radius + this.size) {
            const f = (mouse.radius - d) / mouse.radius;
            this.x -= (dx / d) * f * 4;
            this.y -= (dy / d) * f * 4;
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
      const n = Math.max(20, Math.floor((W * H) / 12000));
      for (let i = 0; i < n; i++) particles.push(new Particle());
    }

    function connect() {
      const maxD = (W / 7) * (H / 7);
      for (let a = 0; a < particles.length; a++) {
        for (let b = a + 1; b < particles.length; b++) {
          const dx = particles[a].x - particles[b].x;
          const dy = particles[a].y - particles[b].y;
          const d2 = dx * dx + dy * dy;
          if (d2 < maxD) {
            const op = 1 - d2 / maxD;
            let near = false;
            if (mouse.x !== null) {
              const mda = Math.sqrt((particles[a].x - mouse.x) ** 2 + (particles[a].y - mouse.y) ** 2);
              near = mda < mouse.radius;
            }
            
            // Adaptive line colors
            ctx.strokeStyle = isDark
              ? (near ? `rgba(255,255,255,${op * 0.6})` : `rgba(56,189,248,${op * 0.25})`)
              : (near ? `rgba(0,102,255,${op * 0.45})` : `rgba(0,102,255,${op * 0.12})`);
              
            ctx.lineWidth = 0.7;
            ctx.beginPath();
            ctx.moveTo(particles[a].x, particles[a].y);
            ctx.lineTo(particles[b].x, particles[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function resize() {
      W = canvas.width = section.offsetWidth;
      H = canvas.height = section.offsetHeight;
      init();
    }

    function draw() {
      if (!visible) { animId = requestAnimationFrame(draw); return; }
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      connect();
      animId = requestAnimationFrame(draw);
    }

    // Mouse
    section.addEventListener('mousemove', e => {
      const r = section.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    });
    section.addEventListener('mouseleave', () => { mouse.x = null; mouse.y = null; });

    // Intersection observer — pause when not visible
    const io = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
    }, { threshold: 0 });
    io.observe(section);

    window.addEventListener('resize', resize);
    resize();
    draw();
  }

  // Apply to ALL sections (skip hero — has its own canvas)
  window.addEventListener('load', () => {
    const sections = document.querySelectorAll('.section, footer.footer');
    sections.forEach(sec => createParticleNet(sec));
  });

})();