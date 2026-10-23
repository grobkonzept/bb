import { createOptimizedPicture } from '../../scripts/aem.js';

const PRICE_RE = /^(CHF|EUR|USD|Fr\.?|€|\$|£)\s?\d|\d[\d'.,]*\s?(CHF|EUR|USD|€|\$|£)/i;

function isImageCell(cell) {
  const pic = cell.querySelector('picture');
  if (!pic) return false;
  const clone = cell.cloneNode(true);
  clone.querySelectorAll('picture').forEach((p) => p.remove());
  return !clone.textContent.trim();
}

function isLinkOnly(el) {
  const links = el.querySelectorAll('a[href]');
  return links.length === 1 && el.textContent.trim() === links[0].textContent.trim();
}

/**
 * Marks up the product info cell: eyebrow, name, price, primary CTA and secondary link.
 * Every part is optional; unknown content is left as-is.
 * @param {Element} info The info cell
 */
function decorateInfo(info) {
  info.classList.add('columns-product-info');
  const heading = info.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) {
    heading.classList.add('columns-product-name');
    // a short paragraph directly before the name is the eyebrow
    const prev = heading.previousElementSibling;
    if (prev && prev.tagName === 'P' && !prev.querySelector('a, picture')) {
      prev.classList.add('columns-product-eyebrow');
    }
  }

  // price lines: paragraphs that start with a currency amount
  [...info.querySelectorAll(':scope > p')].forEach((p) => {
    if (!p.querySelector('a, picture') && PRICE_RE.test(p.textContent.trim())) {
      p.classList.add('columns-product-price');
    }
  });

  // link-only paragraphs: first is the primary CTA, the rest are secondary links
  const linkParas = [...info.querySelectorAll(':scope > p')].filter(isLinkOnly);
  linkParas.forEach((p, i) => {
    const a = p.querySelector('a');
    if (i === 0) {
      p.classList.add('columns-product-cta');
      if (!a.classList.contains('button')) {
        p.classList.add('button-wrapper');
        a.classList.add('button', 'primary');
      }
    } else {
      p.classList.add('columns-product-link');
    }
  });
}

/**
 * Columns (product): product image beside product info.
 * Rows: [image | info]. Cell order may be reversed; extra rows are decorated the same way.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-product-row');
    const cells = [...row.children];
    cells.forEach((cell) => {
      if (!cell.textContent.trim() && !cell.querySelector('picture, img, a')) {
        cell.remove();
        return;
      }
      if (isImageCell(cell)) {
        cell.classList.add('columns-product-media');
        cell.querySelectorAll('picture > img').forEach((img) => {
          img.closest('picture').replaceWith(
            createOptimizedPicture(img.src, img.alt, false, [
              { media: '(min-width: 900px)', width: '1200' },
              { width: '750' },
            ]),
          );
        });
      } else {
        decorateInfo(cell);
      }
    });
    if (!row.querySelector('.columns-product-media')) row.classList.add('no-media');
  });
}
