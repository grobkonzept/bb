/*
 * Accordion (FAQ)
 * Based on https://www.aem.live/developer/block-collection/accordion
 * Rows: [question | answer]. Extra cells are merged into the answer; rows without
 * any answer are rendered as a plain (non-expandable) item.
 * Items open and close independently (several can be open at once), like the source.
 */

const CHECK_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" aria-hidden="true" focusable="false"><path fill-rule="evenodd" d="M18.5 1.5h-17v17h17zm-17-1a1 1 0 0 0-1 1v17a1 1 0 0 0 1 1h17a1 1 0 0 0 1-1v-17a1 1 0 0 0-1-1z"/><path d="M14.998 6.09a.5.5 0 0 1 .03.707l-6.112 6.666a.5.5 0 0 1-.733.004l-3.188-3.394a.5.5 0 0 1 .729-.685l2.82 3.002 5.746-6.27a.5.5 0 0 1 .707-.03"/></svg>';

const CARET_ICON = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 6" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M9.354.646a.5.5 0 0 0-.708 0L5 4.293 1.354.646a.5.5 0 0 0-.708.708l4 4a.5.5 0 0 0 .708 0l4-4a.5.5 0 0 0 0-.708" clip-rule="evenodd"/></svg>';

function createIcon(className, svg) {
  const span = document.createElement('span');
  span.className = className;
  span.innerHTML = svg;
  return span;
}

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
    const title = document.createElement('span');
    title.className = 'accordion-faq-item-title';
    // unwrap a single paragraph so the summary holds inline content only
    const only = label.children.length === 1 ? label.firstElementChild : null;
    if (only && only.tagName === 'P') title.append(...only.childNodes);
    else title.append(...label.childNodes);

    const summary = document.createElement('summary');
    summary.className = 'accordion-faq-item-label';
    summary.append(createIcon('accordion-faq-item-icon', CHECK_ICON), title);

    const body = document.createElement('div');
    body.className = 'accordion-faq-item-body';
    rest.forEach((cell) => body.append(...cell.childNodes));

    const details = document.createElement('details');
    details.className = 'accordion-faq-item';
    details.append(summary);
    if (body.childNodes.length) {
      summary.append(createIcon('accordion-faq-item-caret', CARET_ICON));
      details.append(body);
    } else {
      details.classList.add('no-body');
    }
    row.replaceWith(details);
  });
}
