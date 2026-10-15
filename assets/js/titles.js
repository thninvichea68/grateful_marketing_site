// Page titles (the 117px headings at the top of each page) rise in line by line,
// like the homepage hero title.
(function () {
  const root = document.documentElement;
  const ready = () => root.classList.remove('titles-pending');
  if (!window.gsap || !window.SplitText || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    ready();
    return;
  }
  gsap.registerPlugin(SplitText);

  const TITLES = '.sub-hero__title, .page-title';

  // wait for GS Compressed so lines are measured with the real font
  document.fonts.ready.then(() => {
    document.querySelectorAll(TITLES).forEach((el) => {
      SplitText.create(el, {
        type: 'lines',
        mask: 'lines',
        linesClass: 'titleline',   // masks become .titleline-mask
        autoSplit: true,               // re-split when the width changes
        onSplit(self) {
          return gsap.from(self.lines, {
            yPercent: 105,
            duration: 1,
            ease: 'power4.out',
            stagger: 0.12,
            delay: 0.15,
          });
        },
      });
    });
    ready();
  });
})();
