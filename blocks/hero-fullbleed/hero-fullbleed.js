import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Hero (full-bleed): background image with heading + CTA anchored to the bottom.
 * Authored rows: [image] [heading + link]. Rows/cells may be missing, reordered or extra.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const media = document.createElement('div');
  media.className = 'hero-fullbleed-media';
  const content = document.createElement('div');
  content.className = 'hero-fullbleed-content';

  // first picture anywhere in the block becomes the background
  const pic = block.querySelector('picture');
  if (pic) {
    const img = pic.querySelector('img');
    const optimized = img
      ? createOptimizedPicture(img.src, img.alt || '', true, [
        { media: '(min-width: 900px)', width: '2000' },
        { width: '900' },
      ])
      : pic;
    if (img) {
      const newImg = optimized.querySelector('img');
      newImg.loading = 'eager';
      newImg.fetchPriority = 'high';
    }
    const parentP = pic.closest('p');
    media.append(optimized);
    pic.remove();
    if (parentP && !parentP.textContent.trim() && !parentP.children.length) parentP.remove();
  } else {
    block.classList.add('no-image');
  }

  // everything else (text, headings, links) goes into the content area, in authored order
  [...block.children].forEach((row) => {
    [...row.children].forEach((cell) => {
      if (cell.textContent.trim() || cell.querySelector('img, picture, a')) {
        content.append(...cell.childNodes);
      }
    });
  });

  // standalone CTA links render as the secondary (outline) button, unless authored otherwise
  content.querySelectorAll(':scope > p').forEach((p) => {
    const links = p.querySelectorAll('a[href]');
    if (links.length !== 1 || p.textContent.trim() !== links[0].textContent.trim()) return;
    const a = links[0];
    if (a.querySelector('img')) return;
    p.classList.add('button-wrapper');
    if (!a.classList.contains('button')) a.classList.add('button', 'secondary');
  });

  block.replaceChildren(...(media.children.length ? [media] : []), content);
}
