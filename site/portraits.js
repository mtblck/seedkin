// The Portraits docs page: draws the demo row, one animated portrait per style, with the
// package's own portrait entry points from /lib. Images, not inline SVG, so the CSP holds.
const STYLES = ['botling', 'snoot', 'noggin', 'beastie', 'sprite'];
const demo = document.querySelector('.portrait-demo');
if (demo) {
  const seed = demo.dataset.seed ?? 'jolly-sprocket-65';
  const animate = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  for (const name of STYLES) {
    const img = demo.querySelector(`img[data-style="${name}"]`);
    import(`/lib/styles/${name}/portrait/index.js`)
      .then(({ portraitDataUri }) => {
        if (img) img.src = portraitDataUri(seed, { size: 192, animate, title: null });
      })
      // A module that fails to load leaves no broken image behind.
      .catch(() => img?.remove());
  }
}
