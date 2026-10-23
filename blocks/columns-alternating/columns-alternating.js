import { createOptimizedPicture } from '../../scripts/aem.js';

function isImageCell(cell) {
  if (!cell.querySelector('picture')) return false;
  const clone = cell.cloneNode(true);
  clone.querySelectorAll('picture').forEach((p) => p.remove());
  return !clone.textContent.trim();
}

/**
 * Columns (alternating): zig-zag rows of image + text.
 * Each row: two cells in visual order (image | text or text | image).
 * On small screens the image is always shown first. Rows with only one cell span full width.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-alternating-row');
    [...row.children].forEach((cell) => {
      if (!cell.textContent.trim() && !cell.querySelector('picture, img, a')) cell.remove();
    });
    const cells = [...row.children];
    if (!cells.length) {
      row.remove();
      return;
    }

    let mediaIndex = -1;
    cells.forEach((cell, i) => {
      if (mediaIndex === -1 && isImageCell(cell)) {
        mediaIndex = i;
        cell.classList.add('columns-alternating-media');
        cell.querySelectorAll('picture > img').forEach((img) => {
          img.closest('picture').replaceWith(
            createOptimizedPicture(img.src, img.alt, false, [
              { media: '(min-width: 900px)', width: '1200' },
              { width: '750' },
            ]),
          );
        });
      } else {
        cell.classList.add('columns-alternating-text');
      }
    });

    if (mediaIndex === -1) row.classList.add('no-media');
    else if (mediaIndex === 0) row.classList.add('media-start');
    else row.classList.add('media-end');
    if (cells.length === 1) row.classList.add('single');
  });
}
