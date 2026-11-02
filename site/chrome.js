// What every page shares: the theme toggle, the phone menu, code blocks, search and the page-view count.
import { arrival, track } from '/track.js';
import '/code.js';
import '/search.js';

document.querySelector('.theme').addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem('seedkin-theme', next);
  } catch {
    /* storage blocked: the choice lasts for this page only */
  }
});

// The current page in the nav, for screen readers and the underline: the longest link the
// path starts with, except that every style page (/styles/<name>/) is the Playground.
const path = /^\/styles\/[^/]+\/$/.test(location.pathname) ? '/styles/botling/' : location.pathname;
const here = [...document.querySelectorAll('.top nav a[href^="/"]')]
  .filter((a) => path.startsWith(a.getAttribute('href')))
  .sort((a, b) => b.getAttribute('href').length - a.getAttribute('href').length)[0];
here?.setAttribute('aria-current', 'page');

// On a phone the nav folds behind a Menu button. Escape closes it and returns focus.
const menu = document.querySelector('.menu-btn');
const nav = document.getElementById('site-nav');
const setMenu = (open) => {
  menu.setAttribute('aria-expanded', String(open));
  nav.classList.toggle('is-open', open);
};
menu.addEventListener('click', () => setMenu(menu.getAttribute('aria-expanded') !== 'true'));
// Escape, or a click outside the header, closes it.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menu.focus();
  }
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.top')) setMenu(false);
});

// The floating Support link tucks away while the footer, which has its own, is on screen.
// The button comes from the tipjar package, drawn at build time; this is the part of its mount() the site needs.
const tip = document.querySelector('.tipjar');
const foot = document.querySelector('.foot');
if (tip && foot && 'IntersectionObserver' in window) {
  new IntersectionObserver(([entry]) => tip.toggleAttribute('data-tucked', entry.isIntersecting)).observe(foot);
}

track('pageview', arrival(document.referrer, location.hostname));
