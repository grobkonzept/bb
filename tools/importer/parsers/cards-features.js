/* eslint-disable */
/* global WebImporter */

const ORIGIN = 'https://banditbunny.ch';

function absUrl(url) {
  if (!url) return url;
  const u = url.trim();
  if (u.startsWith('//')) return `https:${u}`;
  if (u.startsWith('/')) return `${ORIGIN}${u}`;
  return u;
}

function buildImage(document, srcImg) {
  if (!srcImg) return null;
  const img = document.createElement('img');
  let src = srcImg.getAttribute('src') || srcImg.getAttribute('data-src') || '';
  if (!src) {
    const srcset = srcImg.getAttribute('srcset') || '';
    src = srcset.split(',').map((s) => s.trim().split(/\s+/)[0]).filter(Boolean).pop() || '';
  }
  img.src = absUrl(src);
  img.alt = srcImg.getAttribute('alt') || '';
  return img;
}

/**
 * Parser for cards-features (base: cards, "no images" structure).
 * Source: Shopify Dawn multicolumn list (slider-component > ul > li.multicolumn-list__item).
 * One row per card: [title + text]. If any card has an image, rows become [image | text].
 */
export default function parse(element, { document }) {
  const items = [...element.querySelectorAll('.multicolumn-list__item')];

  const cards = items.map((item) => {
    const imgEl = item.querySelector('.multicolumn-card__image-wrapper img, img');
    const image = buildImage(document, imgEl);
    const text = [];
    const title = item.querySelector('.multicolumn-card__info h1, .multicolumn-card__info h2, .multicolumn-card__info h3, .multicolumn-card__info h4');
    if (title) {
      const h = document.createElement(title.tagName.toLowerCase());
      h.textContent = title.textContent.trim();
      text.push(h);
    }
    const rte = item.querySelector('.multicolumn-card__info .rte');
    if (rte) {
      [...rte.children].forEach((child) => {
        if (child.textContent.trim() || child.querySelector('img, a')) text.push(child);
      });
      if (!rte.children.length && rte.textContent.trim()) {
        const p = document.createElement('p');
        p.textContent = rte.textContent.trim();
        text.push(p);
      }
    }
    const link = item.querySelector('.multicolumn-card__info a.link, .multicolumn-card__info > a[href]');
    if (link && !(rte && rte.contains(link))) {
      const p = document.createElement('p');
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = link.textContent.trim();
      p.append(a);
      text.push(p);
    }
    return { image, text };
  }).filter((c) => c.text.length || c.image);

  const hasImages = cards.some((c) => c.image);
  const cells = cards.map((c) => (hasImages ? [c.image || '', c.text] : [c.text]));

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-features', cells });
  element.replaceWith(block);
}
