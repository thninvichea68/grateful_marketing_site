// Shared behaviour for subpages: Lenis smooth scroll, gliding in-page links, image parallax.
(function () {
  if (!window.gsap) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  // Smooth scroll, driven by GSAP's ticker so scroll animations stay in sync
  if (window.Lenis) {
    const lenis = new Lenis({ duration: 1.2 });
    if (window.ScrollTrigger) lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // Same-page links glide instead of jumping, stopping just below the fixed nav
    const nav = document.getElementById('nav');
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href');
      const target = id === '#' ? 0 : document.querySelector(id);
      if (target === null) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: target === 0 ? 0 : -(nav ? nav.offsetHeight : 0) });
    });

    // Arriving from another page with a #hash: glide to it once the layout has settled
    if (location.hash && location.hash.length > 1) {
      const target = document.querySelector(location.hash);
      if (target) window.addEventListener('load', () => {
        lenis.scrollTo(target, { offset: -(nav ? nav.offsetHeight : 0), immediate: true });
      });
    }
  }

  // Photos drift inside their frames while scrolling (frames clip the overflow)
  if (window.ScrollTrigger) {
    document.querySelectorAll('[data-parallax] img').forEach((img) => {
      gsap.fromTo(img, { yPercent: -6 }, {
        yPercent: 6, ease: 'none',
        scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });
  }

  // Stacking step cards: each card pins as it reaches the top (10px lower than the one before),
  // and every card except the last tilts back and shrinks as the next ones slide over it.
  if (window.ScrollTrigger) {
    const nav = document.getElementById('nav');
    const topOffset = () => (nav ? nav.offsetHeight : 0) + 20;   // stop just below the fixed menu bar

    document.querySelectorAll('.steps-stack').forEach((stack) => {
      const wrappers = gsap.utils.toArray(stack.querySelectorAll('.step-wrap'));
      const cards = gsap.utils.toArray(stack.querySelectorAll('.step-card'));
      if (wrappers.length < 2) return;
      stack.classList.add('steps-stack--js');
      const last = wrappers.length - 1;

      wrappers.forEach((wrapper, i) => {
        const isLast = i === last;
        gsap.to(cards[i], {
          scale: isLast ? 1 : 0.9 + 0.025 * i,
          rotationX: isLast ? 0 : -10,
          transformOrigin: 'top center',
          ease: 'none',
          scrollTrigger: {
            trigger: wrapper,
            start: () => 'top ' + (topOffset() + 10 * i),
            // everything releases together once the last card has landed in its slot
            endTrigger: stack,
            end: () => 'bottom ' + (topOffset() + 10 * last + wrappers[last].offsetHeight),
            scrub: true,
            pin: wrapper,
            pinSpacing: false,
            invalidateOnRefresh: true,
          },
        });
      });
    });
  }
})();
