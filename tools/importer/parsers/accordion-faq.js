/* eslint-disable */
/* global WebImporter */

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

/**
 * Parser for accordion-faq (base: accordion).
 * Source: Shopify Dawn collapsible content (.collapsible-content__wrapper).
 * Rows: [question | answer], one per <details>.
 *
 * The wrapper also contains the section heading (.collapsible-content__header h2 "FAQ"),
 * which is mapped as default content. It is moved out in front of the block so it stays
 * in place as default content; only the details/summary pairs become block rows.
 */
export default function parse(element, { document }) {
  const cells = [];

  element.querySelectorAll('details').forEach((details) => {
    const summary = details.querySelector('summary');
    if (!summary) return;
    const titleEl = summary.querySelector('.accordion__title, h1, h2, h3, h4, h5, h6') || summary;
    const question = clean(titleEl.textContent);
    if (!question) return;

    const answer = [];
    const content = details.querySelector('.accordion__content');
    if (content) {
      [...content.children].forEach((child) => {
        // drop trailing <br>s inside paragraphs
        while (child.lastChild && (child.lastChild.nodeName === 'BR'
          || (child.lastChild.nodeType === 3 && !child.lastChild.textContent.trim()))) {
          child.lastChild.remove();
        }
        if (clean(child.textContent) || child.querySelector('img, a')) answer.push(child);
      });
      if (!answer.length && clean(content.textContent)) {
        const p = document.createElement('p');
        p.textContent = clean(content.textContent);
        answer.push(p);
      }
    }

    cells.push([question, answer.length ? answer : '']);
  });

  // keep the section heading (default content) in place, outside the block
  const header = element.querySelector('.collapsible-content__header');
  if (header && clean(header.textContent)) {
    const heading = header.querySelector('h1, h2, h3, h4, h5, h6');
    if (heading) {
      const h = document.createElement(heading.tagName.toLowerCase());
      h.textContent = clean(heading.textContent);
      element.before(h);
    }
    [...header.querySelectorAll('.collapsible-content__text, .rte')].forEach((t) => {
      if (clean(t.textContent)) element.before(t);
    });
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}
