// Menu bar: show/hide on scroll, Services mega menu, phone menu. Shared by every page.
(function () {
  const nav = document.getElementById('nav');
  const toggle = nav.querySelector('.nav__toggle');
  const dd = document.getElementById('services');
  const ddBtn = dd.querySelector('button');
  const desktop = window.matchMedia('(min-width: 861px)');

  // Navy once scrolled; shown while scrolling down, tucked away while scrolling up
  let lastY = window.scrollY;
  function onScroll() {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > 10);
    const menuOpen = nav.classList.contains('is-open') || dd.classList.contains('is-open');
    if (y < 80 || menuOpen) nav.classList.remove('is-hidden');
    else if (y > lastY + 4) nav.classList.remove('is-hidden');   // scrolling down: show
    else if (y < lastY - 4) nav.classList.add('is-hidden');      // scrolling up: hide
    if (Math.abs(y - lastY) > 4) lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Desktop mega menu choreography (GSAP): panel wipes down, title rises, cards stagger in.
  // Built on first desktop open so the phone menu never gets these inline styles.
  const mega = document.getElementById('services-menu');
  const megaParts = [mega, '.mega__title', '.mega__cards > li', '.mega__card > img', '.mega__card .btn--round'];
  const canAnimate = window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let megaTl = null;

  function buildMegaTl() {
    mega.classList.add('mega--js');
    return gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } })
      .set(mega, { autoAlpha: 1 })
      .fromTo(mega, { clipPath: 'inset(0% 0% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.6, ease: 'power4.inOut' }, 0)
      .fromTo('.mega__title', { yPercent: 60, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, duration: 0.6 }, 0.18)
      .fromTo('.mega__cards > li', { y: 48, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, duration: 0.7, stagger: 0.08 }, 0.2)
      .fromTo('.mega__card > img', { scale: 1.25 },
        { scale: 1, duration: 1.1, stagger: 0.08, ease: 'expo.out', clearProps: 'transform' }, 0.2)
      .fromTo('.mega__card .btn--round', { scale: 0, rotate: -90 },
        { scale: 1, rotate: 0, duration: 0.5, stagger: 0.08, ease: 'back.out(2)', clearProps: 'transform' }, 0.45);
  }

  // Crossing the breakpoint: throw the timeline away and fall back to the CSS states
  desktop.addEventListener('change', () => {
    if (!megaTl) return;
    megaTl.kill();
    megaTl = null;
    mega.classList.remove('mega--js');
    gsap.set(megaParts, { clearProps: 'all' });
  });

  function setDropdown(open) {
    if (open === dd.classList.contains('is-open')) return;
    dd.classList.toggle('is-open', open);
    ddBtn.setAttribute('aria-expanded', String(open));
    if (!canAnimate || !desktop.matches) return;
    if (!megaTl) megaTl = buildMegaTl();
    if (open) megaTl.timeScale(1).play();
    else megaTl.timeScale(1.8).reverse();
  }
  ddBtn.addEventListener('click', (e) => { e.stopPropagation(); setDropdown(!dd.classList.contains('is-open')); });
  // Short close delay so the pointer can cross the gap between the button and the panel
  let closeTimer;
  dd.addEventListener('mouseenter', () => { if (desktop.matches) { clearTimeout(closeTimer); setDropdown(true); } });
  dd.addEventListener('mouseleave', () => { if (desktop.matches) closeTimer = setTimeout(() => setDropdown(false), 180); });
  document.addEventListener('click', (e) => { if (!dd.contains(e.target)) setDropdown(false); });

  toggle.addEventListener('click', () => {
    const open = !nav.classList.contains('is-open');
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    setDropdown(false);
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  });
})();
