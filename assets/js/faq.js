// FAQ accordion: animates each answer's height open and closed with GSAP.
// Without GSAP, or with reduced motion, the native <details> behaviour still works.
(function () {
  if (!window.gsap) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const refresh = () => { if (window.ScrollTrigger) ScrollTrigger.refresh(); };

  document.querySelectorAll('.faq__item').forEach((item) => {
    const answer = item.querySelector('.faq__answer');
    if (!answer) return;
    item.querySelector('summary').addEventListener('click', (e) => {
      e.preventDefault();
      gsap.killTweensOf(answer);
      const wasClosing = item.classList.contains('is-closing');
      if (!item.open || wasClosing) {
        // reopening mid-close continues from the current height instead of snapping to 0
        const from = wasClosing ? { height: answer.offsetHeight, opacity: gsap.getProperty(answer, 'opacity') }
                                : { height: 0, opacity: 0 };
        item.classList.remove('is-closing');
        item.open = true;
        gsap.fromTo(answer, from,
          { height: 'auto', opacity: 1, duration: 0.6, ease: 'power3.out', onComplete: refresh });
      } else {
        item.classList.add('is-closing');
        gsap.to(answer, { height: 0, opacity: 0, duration: 0.45, ease: 'power3.inOut',
          onComplete: () => {
            item.open = false;
            item.classList.remove('is-closing');
            gsap.set(answer, { clearProps: 'height,opacity' });
            refresh();
          } });
      }
    });
  });
})();
