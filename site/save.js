// What the playground's download buttons share: saving a file, and a status line that clears itself.

/**
 * Saves a blob as a file, through a link the browser downloads.
 *
 * @param {Blob} blob - The file's contents
 * @param {string} file - Its name
 */
export function save(blob, file) {
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), { href: url, download: file }).click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * A status line that says one thing at a time and clears a moment later.
 *
 * @param {HTMLElement} el - The live region to write to
 * @returns {(text: string) => void} Says `text`
 */
export function sayer(el) {
  let timer;
  return (text) => {
    el.textContent = text;
    clearTimeout(timer);
    timer = setTimeout(() => (el.textContent = ''), 2500);
  };
}
