/*
 * Accordion (FAQ)
 * Based on https://www.aem.live/developer/block-collection/accordion
 * Rows: [question | answer]. Extra cells are merged into the answer; rows without
 * any answer are rendered as a plain (non-expandable) item.
 */

/**
 * @param {Element} block The block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const cells = [...row.children].filter(
      (cell) => cell.textContent.trim() || cell.querySelector('picture, img, a'),
    );
    if (!cells.length) {
      row.remove();
      return;
    }

    const [label, ...rest] = cells;
    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-item-label';
    // unwrap a single paragraph so the summary holds inline content only
    const only = label.children.length === 1 ? label.firstElementChild : null;
    if (only && only.tagName === 'P') summary.append(...only.childNodes);
    else summary.append(...label.childNodes);

    const body = document.createElement('div');
    body.className = 'accordion-faq-item-body';
    rest.forEach((cell) => body.append(...cell.childNodes));

    const details = document.createElement('details');
    details.className = 'accordion-faq-item';
    details.append(summary);
    if (body.childNodes.length) {
      details.append(body);
    } else {
      details.classList.add('no-body');
    }
    row.replaceWith(details);
  });

  // keep only one item open at a time
  const items = [...block.querySelectorAll(':scope > details')];
  items.forEach((item) => {
    item.addEventListener('toggle', () => {
      if (!item.open) return;
      items.forEach((other) => {
        if (other !== item && other.open) other.open = false;
      });
    });
  });
}
