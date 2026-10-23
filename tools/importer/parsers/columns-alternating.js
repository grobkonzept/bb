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
  if (!src || src.startsWith('data:')) {
    const srcset = srcImg.getAttribute('srcset') || '';
    src = srcset.split(',').map((s) => s.trim().split(/\s+/)[0]).filter(Boolean).pop() || src;
  }
  img.src = absUrl(src);
  img.alt = srcImg.getAttribute('alt') || '';
  return img;
}

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

/**
 * Parser for columns-alternating (base: columns).
 * Source: Shopify Dawn multirow (.multirow__inner > .image-with-text).
 * One row per item, two cells in visual order: [image | text] or, when the source grid
 * has image-with-text__grid--reverse, [text | image].
 */
export default function parse(element, { document }) {
  const cells = [];

  [...element.querySelectorAll('.image-with-text')].forEach((item) => {
    const imgEl = [...item.querySelectorAll('.image-with-text__media img')]
      .find((i) => !(i.getAttribute('src') || '').startsWith('data:'));
    const image = buildImage(document, imgEl);

    const text = [];
    const content = item.querySelector('.image-with-text__content');
    if (content) {
      const caption = content.querySelector('.image-with-text__text--caption');
      if (caption && clean(caption.textContent)) {
        const p = document.createElement('p');
        p.textContent = clean(caption.textContent);
        text.push(p);
      }
      const heading = content.querySelector('.image-with-text__heading');
      if (heading && clean(heading.textContent)) {
        const h = document.createElement(/^H[1-6]$/.test(heading.tagName) ? heading.tagName.toLowerCase() : 'h2');
        h.textContent = clean(heading.textContent);
        text.push(h);
      }
      const body = content.querySelector('.image-with-text__text.body, .image-with-text__text:not(.image-with-text__text--caption)');
      if (body) {
        [...body.children].forEach((child) => {
          if (clean(child.textContent) || child.querySelector('img, a')) text.push(child);
        });
      }
      content.querySelectorAll('a.button[href]').forEach((btn) => {
        const p = document.createElement('p');
        const a = document.createElement('a');
        a.href = btn.getAttribute('href');
        a.textContent = clean(btn.textContent);
        p.append(a);
        text.push(p);
      });
    }

    if (!image && !text.length) return;
    const reversed = !!item.querySelector('.image-with-text__grid--reverse');
    const imageCell = image || '';
    cells.push(reversed ? [text, imageCell] : [imageCell, text]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-alternating', cells });
  element.replaceWith(block);
}
