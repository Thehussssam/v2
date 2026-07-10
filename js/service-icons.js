(function () {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  function init3dParallax(cardSelector, iconSelector) {
    document.querySelectorAll(cardSelector).forEach((card) => {
      const icon3d = card.querySelector(iconSelector);
      if (!icon3d) return;

      let raf = null;

      card.addEventListener('mousemove', (e) => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width - 0.5;
          const y = (e.clientY - rect.top) / rect.height - 0.5;

          icon3d.style.animation = 'none';
          icon3d.style.transform =
            `rotateY(${x * 40}deg) rotateX(${-y * 30}deg) translateY(${-y * 5}px) translateZ(0)`;
        });
      });

      card.addEventListener('mouseleave', () => {
        if (raf) cancelAnimationFrame(raf);
        icon3d.style.transform = '';
        icon3d.style.animation = '';
      });
    });
  }

  init3dParallax('.svc2-card', '.svc-icon-3d');
  init3dParallax('.industry-card', '.ind-icon-3d');
})();
