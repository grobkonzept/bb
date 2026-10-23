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

function textP(document, text) {
  const p = document.createElement('p');
  p.textContent = text;
  return p;
}

function linkP(document, href, text) {
  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = href;
  a.textContent = text;
  p.append(a);
  return p;
}

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

/**
 * Parser for columns-product (base: columns).
 * Source: Shopify Dawn featured product (.section-featured-product .product).
 * One row, two columns: [product image | product info].
 * Static only: price as text, add-to-cart as a link to the product page,
 * quantity/variant inputs and forms are dropped.
 */
export default function parse(element, { document }) {
  // Column 1: product image (first real media image, not data: icons)
  const mediaImg = [...element.querySelectorAll('.product__media img, .product__media-wrapper img')]
    .find((i) => !(i.getAttribute('src') || '').startsWith('data:'));
  const image = buildImage(document, mediaImg);

  // Column 2: product info
  const info = [];
  const container = element.querySelector('.product__info-container') || element;
  const title = container.querySelector('.product__title');
  const detailsLink = container.querySelector('a.product__view-details[href]');
  const productHref = detailsLink ? detailsLink.getAttribute('href') : '';

  // eyebrow: product__text paragraph(s) before the title
  const textParas = [...container.querySelectorAll(':scope > p.product__text')];
  const isBefore = (el) => title && (el.compareDocumentPosition(title) & 4); // title follows el
  textParas.filter(isBefore).forEach((p) => {
    const t = clean(p.textContent);
    if (t) info.push(textP(document, t));
  });

  if (title) {
    const h = document.createElement('h2');
    h.textContent = clean(title.textContent);
    info.push(h);
  }

  // price (regular price + unit price) as plain text
  const price = clean((container.querySelector('.price__regular .price-item--regular')
    || container.querySelector('.price-item--sale')
    || { textContent: '' }).textContent);
  if (price) info.push(textP(document, price));
  const unitPrice = clean((container.querySelector('.unit-price .price-item') || { textContent: '' }).textContent);
  if (unitPrice) info.push(textP(document, unitPrice));

  // tax / shipping note (keeps inline link)
  const tax = container.querySelector('.product__tax');
  if (tax && clean(tax.textContent)) {
    const p = document.createElement('p');
    [...tax.childNodes].forEach((n) => {
      if (n.nodeType === 3) p.append(document.createTextNode(n.textContent.replace(/\s+/g, ' ')));
      else if (n.tagName === 'A') {
        const a = document.createElement('a');
        a.href = n.getAttribute('href');
        a.textContent = clean(n.textContent);
        p.append(a);
      } else p.append(document.createTextNode(` ${clean(n.textContent)} `));
    });
    info.push(p);
  }

  // description paragraphs after the title
  textParas.filter((p) => !isBefore(p)).forEach((p) => {
    const t = clean(p.textContent);
    if (!t) return;
    const np = document.createElement('p');
    np.innerHTML = p.innerHTML.replace(/<strong>(&nbsp;|\s)*<\/strong>/g, ' ').trim();
    info.push(np);
  });

  // add-to-cart button -> static link to product page
  const submit = container.querySelector('.product-form__submit');
  if (submit && productHref) {
    info.push(linkP(document, productHref, clean(submit.textContent) || 'In den Warenkorb legen'));
  }

  // view details link
  if (detailsLink) {
    info.push(linkP(document, productHref, clean(detailsLink.textContent)));
  }

  const cells = [[image || '', info]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-product', cells });
  element.replaceWith(block);
}
