// The parts every style page shares, filled in by site.mjs: the tabs between styles, the
// playground, and "Use it" (usage tabs, the options table, details and the next style).
// Each page keeps only its own words: its meta tags and its story. Pure functions, tested in
// test/styles.test.ts.

/**
 * Every style in the order the site shows them. `label` names one avatar on the page
 * ('robot', 'Snoot'); `kind` is what it is ('robot', 'animal'); `moves` is what `animate` does; `parts` are the exported lists
 * the Details count, as [export, plural]; `options` are the style's own options for the table.
 */
export const STYLES = [
  {
    name: 'botling',
    title: 'Botling',
    status: 'stable',
    label: 'robot',
    kind: 'robot',
    moves: 'Hovers, blinks and talks; its top piece wobbles, its side pieces twitch and a scanline sweeps its screen.',
    defaultTitle: 'Robot avatar',
    parts: [
      ['HEADS', 'heads'],
      ['EYES', 'eyes'],
      ['MOUTHS', 'mouths'],
      ['TOPS', 'tops'],
      ['SIDES', 'side pieces'],
      ['ACCESSORIES', 'accessories'],
    ],
    palette:
      'Index into <code>PALETTES</code>, or a palette object: one of <code>HOLIDAY_PALETTES</code>, or your own.',
    details: [
      [
        'Before 2.0',
        'The <code>botling</code> package. Import from <code>seedkin/botling</code> instead: every seed draws the same robot.',
      ],
    ],
    options: [],
  },
  {
    name: 'snoot',
    title: 'Snoot',
    status: 'stable',
    label: 'Snoot',
    kind: 'animal',
    moves: 'Hovers, blinks and twitches its ears.',
    defaultTitle: 'Animal avatar',
    parts: [
      ['SPECIES', 'species'],
      ['EYES', 'eyes'],
      ['MARKINGS', 'markings'],
      ['EXTRAS', 'extras'],
    ],
    palette: "Index into Snoot's <code>PALETTES</code> (its coats), or a palette object.",
    options: [],
  },
  {
    name: 'noggin',
    title: 'Noggin',
    status: 'stable',
    label: 'Noggin',
    kind: 'person',
    moves: 'Hovers, blinks and talks.',
    defaultTitle: 'Person avatar',
    parts: [
      ['SKIN_TONES', 'skin tones'],
      ['HAIRS', 'hairstyles'],
      ['HAIR_COLOURS', 'hair colours'],
      ['EYES', 'eyes'],
      ['MOUTHS', 'mouths'],
      ['FACIAL', 'kinds of facial hair'],
      ['EYEWEAR', 'kinds of eyewear'],
      ['HEADWEAR', 'kinds of headwear and earrings'],
    ],
    palette: "Index into Noggin's <code>PALETTES</code> (its outfits), or a palette object.",
    options: [
      [
        'skin',
        '<code>number</code>',
        'picked by the seed',
        'Index into <code>SKIN_TONES</code>, lightest first. Hair and outfit move to colours that stand out from it.',
      ],
    ],
  },
  {
    name: 'beastie',
    title: 'Beastie',
    status: 'stable',
    label: 'Beastie',
    kind: 'monster',
    moves: 'Hovers, blinks and talks; horns and antennae wobble, arms and wings twitch.',
    defaultTitle: 'Monster avatar',
    parts: [
      ['BODIES', 'bodies'],
      ['EYES', 'eyes'],
      ['MOUTHS', 'mouths'],
      ['TOPS', 'tops'],
      ['SIDES', 'side pieces'],
    ],
    palette: "Index into Beastie's <code>PALETTES</code> (its hides), or a palette object.",
    options: [],
  },
  {
    name: 'sprite',
    title: 'Sprite',
    status: 'preview',
    label: 'Sprite',
    kind: 'sprite',
    moves:
      'Flips through four frames: flames sway, drops wobble, clouds hover, and embers, bubbles and stars drift around it.',
    smallMoves: 'animated, it moves the same way',
    defaultTitle: 'Sprite avatar',
    shapeDefault: "<code>'square'</code>",
    parts: [
      ['ELEMENTS', 'elements'],
      ['EYES', 'eyes'],
      ['MOUTHS', 'mouths'],
    ],
    palette: "Index into Sprite's <code>PALETTES</code>, or a palette object. The seed picks from its element's.",
    options: [
      [
        'element',
        "<code>'fire' | 'water' | 'earth' | 'wind' | 'space'</code>",
        'picked by the seed',
        'The element. The rest of the seed stays the same: its form, face and palette choice.',
      ],
    ],
  },
];

const byName = (name) => {
  const style = STYLES.find((s) => s.name === name);
  if (!style) throw new Error(`no style called ${name} in scripts/styles.mjs`);
  return style;
};

/**
 * The style a site file is the page of.
 *
 * @param {string} file - Such as 'styles/snoot/index.html'
 * @returns {string | undefined} The style's name, or undefined for any other page
 */
export function styleOf(file) {
  const m = /^styles\/([a-z]+)\/index\.html$/.exec(file.split('\\').join('/'));
  return m ? byName(m[1]).name : undefined;
}

/**
 * The tabs between styles. Links carry the seed on screen (playground.js fills their hash).
 *
 * @param {string} name - The current style
 * @returns {string} HTML
 */
export function styleTabs(name) {
  const links = STYLES.map(
    (s) =>
      `<a href="/styles/${s.name}/" data-to="${s.name}"${s.name === name ? ' aria-current="page"' : ''}>${s.title}</a>`,
  ).join('');
  return `<nav class="style-tabs" aria-label="Styles">${links}</nav>`;
}

/**
 * The playground's markup, from site/partials/playground.html with the style's words in.
 *
 * @param {string} template - The partial
 * @param {string} name - The style
 * @returns {string} HTML
 */
export function playground(template, name) {
  const s = byName(name);
  const moves = s.smallMoves ?? 'animated, it only blinks and hovers';
  const note = `Below 40px it switches to a simpler version of the same ${s.label}, and ${moves}.`;
  return template.replaceAll('{{label}}', s.label).replaceAll('{{small-note}}', note);
}

/** The options every style takes, then the style's own. */
function optionRows(s) {
  const shared = [
    [
      'shape',
      "<code>'square' | 'circle' | 'triangle' | 'diamond'</code>",
      s.shapeDefault ?? 'picked by the seed',
      'Cell shape.',
    ],
    ['palette', '<code>number | Palette</code>', 'picked by the seed', s.palette],
    ['size', '<code>number</code>', '<code>96</code>', 'Width and height in pixels.'],
    [
      'detail',
      "<code>'auto' | 'full' | 'small'</code>",
      "<code>'auto'</code>",
      `<code>'small'</code> is the simpler 9x9 ${s.kind}; <code>'auto'</code> draws it below 40px.`,
    ],
    [
      'showGrid',
      "<code>boolean | 'auto'</code>",
      "<code>'auto'</code>",
      "Draw the empty grid cells; <code>'auto'</code> draws them from 40px up.",
    ],
    [
      'look',
      "<code>'gapped' | 'flat' | 'inked' | 'soft' | 'soft-inked' | 'sticker'</code>",
      "<code>'gapped'</code>",
      'How the cells are drawn: apart, or merged into flat shapes. See <a href="/docs/botling/#looks">Looks</a>.',
    ],
    [
      'frame',
      "<code>'square' | 'rounded' | 'squircle' | 'circle'</code>",
      "<code>'square'</code>",
      'The outline of the background. Outside it the image is transparent.',
    ],
    ['background', '<code>boolean</code>', '<code>true</code>', "Draw the palette's background."],
    [
      'animate',
      '<code>boolean</code>',
      '<code>false</code>',
      `${s.moves} CSS inside the SVG, still for anyone who asks for reduced motion.`,
    ],
    [
      'title',
      '<code>string | null</code>',
      `<code>'${s.defaultTitle}'</code>`,
      'Accessible name. <code>null</code> marks the image decorative.',
    ],
  ];
  return [...shared, ...s.options];
}

/** Usage samples, one per tab. */
function usage({ name }) {
  const uri = `${name}DataUri`;
  const tabs = [
    [
      'ESM',
      `import { ${name}, ${uri} } from 'seedkin/${name}';

// An SVG string, to inline
const svg = ${name}(user.id);

// A data: URI, for an img src or CSS url()
const src = ${uri}(user.id, { size: 40 });`,
    ],
    [
      'React',
      `import { ${uri} } from 'seedkin/${name}';

export function Avatar({ id, size = 40 }) {
  return &lt;img src={${uri}(id, { size, title: null })} alt="" width={size} height={size} /&gt;;
}`,
    ],
    [
      'HTML',
      `&lt;img data-seed="ada" alt="" width="48" height="48" /&gt;

&lt;script type="module"&gt;
  import { ${uri} } from 'https://cdn.jsdelivr.net/npm/seedkin@2/dist/styles/${name}/index.js';

  for (const img of document.querySelectorAll('img[data-seed]')) {
    img.src = ${uri}(img.dataset.seed, { size: img.width, title: null });
  }
&lt;/script&gt;`,
    ],
    [
      'Server',
      `import { ${name} } from 'seedkin/${name}';

// GET /avatar/:id, as an image any page can use
export async function GET(_request, { params }) {
  const { id } = await params;
  return new Response(${name}(id, { size: 96 }), {
    headers: { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=31536000, immutable' },
  });
}`,
    ],
  ];
  const lang = { ESM: 'js', React: 'jsx', HTML: 'html', Server: 'js' };
  const blocks = tabs
    .map(
      ([tab, code]) => `<pre class="code" data-tab="${tab}"><code class="language-${lang[tab]}">${code}</code></pre>`,
    )
    .join('\n');
  return `<div class="tabs" data-label="Usage" data-sync="usage">\n${blocks}\n</div>`;
}

/**
 * The "Use it" section: install and usage, details, the options table and the next style.
 *
 * @param {string} name - The style
 * @param {Record<string, unknown>} lib - The style's module, for its parts lists
 * @param {string} kb - The style's entry point, bundled and gzipped, in kB
 * @returns {string} HTML
 */
export function styleGuide(name, lib, kb) {
  const s = byName(name);
  const count = (key) => {
    const list = lib[key];
    if (!Array.isArray(list)) throw new Error(`seedkin/${name} doesn't export ${key}`);
    return list.filter((v) => v !== 'none').length;
  };
  const parts = [...s.parts.map(([key, plural]) => `${count(key)} ${plural}`), `${count('PALETTES')} palettes`];
  const status =
    s.status === 'stable'
      ? '<span class="badge stable">Stable</span> A seed draws the same avatar in every 2.x release.'
      : '<span class="badge">Preview</span> A seed\'s avatar can change in a minor version until it\'s stable. <a href="/docs/versioning/#preview-styles">What Preview means</a>';
  const details = [
    ['Entry point', `<code>seedkin/${name}</code>`],
    ['Status', status],
    ['Size', `${kb} kB gzipped, with no dependencies`],
    ['Parts', `${parts.join(', ')}, on ${count('SHAPES')} cell shapes`],
    ['Small sizes', `A simpler 9x9 ${s.kind} below 40px, from the same traits`],
    ['Licence', 'MIT, art included'],
    ...(s.details ?? []),
  ]
    .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
    .join('');
  const rows = optionRows(s)
    .map(
      ([opt, type, def, what]) =>
        `<tr><td><code>${opt}</code></td><td data-label="Type">${type}</td><td data-label="Default">${def}</td><td>${what}</td></tr>`,
    )
    .join('\n');
  const i = STYLES.indexOf(s);
  const link = (o, rel, label) =>
    o ? `<a class="${rel}" href="/styles/${o.name}/" rel="${rel}"><span>${label}</span>${o.title}</a>` : '';
  return `<section class="use wrap" id="use" aria-labelledby="use-h">
      <h2 id="use-h">Use it</h2>
      <div class="cols">
        <div>
          <h3>Install</h3>
          <div class="tabs" data-label="Package manager" data-sync="pm">
<pre class="code" data-tab="npm"><code class="language-sh">npm install seedkin</code></pre>
<pre class="code" data-tab="pnpm"><code class="language-sh">pnpm add seedkin</code></pre>
<pre class="code" data-tab="yarn"><code class="language-sh">yarn add seedkin</code></pre>
<pre class="code" data-tab="bun"><code class="language-sh">bun add seedkin</code></pre>
          </div>
          <h3>Draw one</h3>
          ${usage(s)}
        </div>
        <div>
          <h3>Details</h3>
          <dl class="details">${details}</dl>
          <p><a href="/docs/${name}/">${s.title} in the docs</a></p>
        </div>
      </div>
      <h3 id="option-list">Options</h3>
      <div class="table-box">
        <table class="options-table">
          <caption class="sr-only">Options for ${name}()</caption>
          <thead><tr><th scope="col">Option</th><th scope="col">Type</th><th scope="col">Default</th><th scope="col">What it does</th></tr></thead>
          <tbody>
${rows}
          </tbody>
        </table>
      </div>
      <nav class="pager" aria-label="Other styles">${link(STYLES[i - 1], 'prev', 'Previous style')}${link(STYLES[i + 1], 'next', 'Next style')}</nav>
    </section>`;
}
