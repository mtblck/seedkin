// Code samples on every page: a Copy button on each one, and tabs where a sample comes in
// several flavours. Pages mark the flavours up as plain blocks, so without scripts they all
// show:
//   <div class="tabs" data-label="How to install" data-sync="pm">
//     <pre class="code" data-tab="npm">…</pre> <pre class="code" data-tab="pnpm">…</pre>
//   </div>
// Blocks the page copies itself (the playground's live code) carry data-nocopy.
import { track } from '/track.js';

const status = document.createElement('p');
status.className = 'sr-only';
status.setAttribute('role', 'status');
document.body.append(status);

let n = 0;
const id = (prefix) => `${prefix}-${++n}`;

/** Gives a code block a Copy button in its top corner. */
function addCopy(pre) {
  const box = document.createElement('div');
  box.className = 'codebox';
  pre.replaceWith(box);
  box.append(pre);
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'copy';
  btn.textContent = 'Copy';
  let timer;
  btn.addEventListener('click', async () => {
    clearTimeout(timer);
    try {
      await navigator.clipboard.writeText(pre.textContent.trimEnd());
      btn.textContent = 'Copied';
      status.textContent = 'Code copied';
      track('copied');
    } catch {
      btn.textContent = 'Select and copy';
    }
    timer = setTimeout(() => {
      btn.textContent = 'Copy';
      if (status.textContent === 'Code copied') status.textContent = '';
    }, 1600);
  });
  box.append(btn);
}

const groups = new Map(); // data-sync name -> each group's select function

/** Turns a group of flavoured blocks into a tablist with arrow-key navigation. */
function addTabs(group) {
  const blocks = [...group.querySelectorAll('[data-tab]')];
  // The panel is the block with its Copy button, once it has one.
  const panels = blocks.map((pre) => pre.closest('.codebox') ?? pre);
  const names = blocks.map((pre) => pre.dataset.tab);
  const list = document.createElement('div');
  list.setAttribute('role', 'tablist');
  list.setAttribute('aria-label', group.dataset.label ?? 'Variants');
  const tabs = panels.map((panel, k) => {
    const tab = document.createElement('button');
    tab.type = 'button';
    tab.id = id('tab');
    tab.setAttribute('role', 'tab');
    tab.textContent = names[k];
    panel.id ||= id('panel');
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tab.id);
    tab.setAttribute('aria-controls', panel.id);
    return tab;
  });
  list.append(...tabs);
  group.prepend(list);

  const select = (name, focus = false) => {
    const i = Math.max(0, names.indexOf(name));
    tabs.forEach((tab, j) => {
      tab.setAttribute('aria-selected', String(i === j));
      tab.tabIndex = i === j ? 0 : -1;
      panels[j].hidden = i !== j;
    });
    if (focus) tabs[i].focus();
  };
  const sync = group.dataset.sync;
  const choose = (name, focus) => {
    if (!sync) return select(name, focus);
    for (const fn of groups.get(sync)) fn(name, false);
    if (focus) select(name, true);
    try {
      localStorage.setItem(`seedkin-${sync}`, name);
    } catch {
      /* storage blocked: the choice lasts for this page */
    }
  };
  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => choose(names[i]));
    tab.addEventListener('keydown', (e) => {
      const step = { ArrowRight: 1, ArrowLeft: -1, Home: -i, End: tabs.length - 1 - i }[e.key];
      if (step === undefined) return;
      e.preventDefault();
      choose(names[(i + step + tabs.length) % tabs.length], true);
    });
  });
  if (sync) groups.set(sync, [...(groups.get(sync) ?? []), select]);
  let saved = null;
  try {
    saved = sync && localStorage.getItem(`seedkin-${sync}`);
  } catch {
    /* storage blocked */
  }
  select(saved ?? names[0]);
}

for (const pre of document.querySelectorAll('pre.code:not([data-nocopy]), .prose pre')) addCopy(pre);
for (const group of document.querySelectorAll('.tabs')) addTabs(group);
