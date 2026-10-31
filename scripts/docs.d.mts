/** Every docs page in reading order, by group: [slug, title]. The slug '' is /docs/. */
export const DOCS: { group: string; pages: [string, string][] }[];
/** The docs page a site file is, from its path under site/, or undefined if it isn't one. */
export function docsSlug(file: string): string | undefined;
/** The sidebar: every group and page, the current one marked. */
export function docsNav(slug: string): string;
/** The "On this page" list, from the page's h2 and h3 headings that have ids. */
export function toc(html: string): string;
/** The foot of a page: the previous and next pages, and a link to edit this one. */
export function pager(slug: string): string;
/** The breadcrumb over a page's heading: Docs, then its group. */
export function crumb(slug: string): string;
