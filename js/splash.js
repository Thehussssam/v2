(function () {
  const splash = document.getElementById('splash-screen');
  const typedEl = document.getElementById('splash-typed');
  const splashText = document.querySelector('.splash-text');
  const cursor = document.querySelector('.splash-cursor');
  if (!splash || !typedEl) return;

  const word = 'IKSATECH';
  const letterDelay = 130;
  const holdAfterTyping = 1000;
  const exitDuration = 650;

  let i = 0;

  function typeNext() {
    if (i < word.length) {
      const span = document.createElement('span');
      span.className = 'splash-letter';
      span.textContent = word[i];
      typedEl.appendChild(span);
      i += 1;
      setTimeout(typeNext, letterDelay);
      return;
    }

    if (cursor) cursor.classList.add('is-done');
    if (splashText) splashText.classList.add('is-complete');

    setTimeout(() => {
      splash.classList.add('is-exiting');

      setTimeout(() => {
        splash.classList.add('is-hidden');
        splash.setAttribute('aria-hidden', 'true');
        document.body.classList.remove('splash-active');
        splash.addEventListener('transitionend', () => splash.remove(), { once: true });
      }, exitDuration);
    }, holdAfterTyping);
  }

  typeNext();
})();
