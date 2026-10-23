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
 * Parser for hero-fullbleed (base: hero).
 * Source: Shopify Dawn image banner (.banner).
 * Rows: [background image] [heading + CTA link].
 */
export default function parse(element, { document }) {
  const cells = [];

  // Row 1: background image
  const img = buildImage(document, element.querySelector('.banner__media img, img'));
  if (img) cells.push([img]);

  // Row 2: heading + subheading + CTA links
  const content = [];
  const heading = element.querySelector('.banner__heading, h1, h2, h3');
  if (heading) {
    const h = document.createElement(/^H[1-6]$/.test(heading.tagName) ? heading.tagName.toLowerCase() : 'h2');
    h.textContent = heading.textContent.trim();
    content.push(h);
  }
  const sub = element.querySelector('.banner__text');
  if (sub && sub.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = sub.textContent.trim();
    content.push(p);
  }
  element.querySelectorAll('.banner__buttons a[href]').forEach((a) => {
    const p = document.createElement('p');
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.trim();
    p.append(link);
    content.push(p);
  });
  if (content.length) cells.push([content]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-fullbleed', cells });
  element.replaceWith(block);
}
