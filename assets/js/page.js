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

  // Scroll-scrubbed text fill: words start ghosted (CSS) and darken one by one as the text scrolls up
  if (window.ScrollTrigger) {
    const cyan = getComputedStyle(document.documentElement).getPropertyValue('--cyan').trim();
    document.querySelectorAll('[data-fill]').forEach((el) => {
      const words = [];
      (function split(node) {
        [...node.childNodes].forEach((child) => {
          if (child.nodeType === 3) {
            const frag = document.createDocumentFragment();
            child.textContent.split(/(\s+)/).forEach((part) => {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
              const w = document.createElement('span');
              w.className = 'w';
              w.textContent = part;
              frag.appendChild(w);
              words.push(w);
            });
            child.replaceWith(frag);
          } else if (child.nodeType === 1) {
            split(child);
          }
        });
      })(el);
      el.classList.add('is-split');

      const color = getComputedStyle(el).color;
      const fill = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom 45%', scrub: 0.6 }
      });
      // each word flashes cyan, then settles to the text colour (as on the homepage)
      words.forEach((w, i) => {
        fill.to(w, { color: cyan, duration: 0.25, ease: 'none' }, i * 0.1)
            .to(w, { color, duration: 0.25, ease: 'none' }, i * 0.1 + 0.25);
      });
    });
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
