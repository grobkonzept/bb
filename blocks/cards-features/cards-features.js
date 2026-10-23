import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Cards (features): text-first grid of feature boxes (title + text).
 * One row per card; any number of cells per row. Images are tolerated but optional.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    if (!row.textContent.trim() && !row.querySelector('picture, img')) return; // skip empty rows
    const li = document.createElement('li');
    li.className = 'cards-features-card';
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-features-card-image';
      } else if (!div.textContent.trim() && !div.querySelector('picture, img, a')) {
        div.remove();
      } else {
        div.className = 'cards-features-card-body';
      }
    });
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });
  block.replaceChildren(ul);
}
