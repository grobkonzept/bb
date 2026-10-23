/* eslint-disable */
/* global WebImporter */

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

const KNOWN_TYPES = ['text', 'email', 'tel', 'textarea'];

/**
 * Parser for widget-contact (base: widget).
 * Source: Shopify Dawn contact form (form#ContactForm) on /pages/contact and
 * /pages/handleranfrage.
 *
 * Output: one row per visible field [label | type(, required)], then [submit | button text].
 * Hidden inputs (form_type, utf8, contact[tags], ...) and the Shopify action are ignored;
 * no 'action' row is emitted (there is no endpoint yet). Placeholder text is not emitted.
 *
 * Note: the Shopify markup closes .contact__fields early (after the e-mail field), so the
 * fields are collected from the whole form in document order, not from that wrapper.
 */
function fieldType(control) {
  if (control.tagName.toLowerCase() === 'textarea') return 'textarea';
  const attr = (control.getAttribute('type') || '').toLowerCase();
  if (KNOWN_TYPES.includes(attr)) return attr;
  // Fallback when attributes were stripped: infer from the id / name / autocomplete.
  const hint = `${control.id || ''} ${control.getAttribute('name') || ''} ${control.getAttribute('autocomplete') || ''}`.toLowerCase();
  if (/email/.test(hint)) return 'email';
  if (/phone|tel/.test(hint)) return 'tel';
  return 'text';
}

export default function parse(element, { document }) {
  const form = element.matches('form') ? element : (element.querySelector('form') || element);
  const cells = [];
  const seen = new Set();

  const controls = form.querySelectorAll('input, textarea, select');
  controls.forEach((control) => {
    const type = (control.getAttribute('type') || '').toLowerCase();
    if (['hidden', 'submit', 'button', 'reset', 'image'].includes(type)) return;
    if (seen.has(control)) return;
    seen.add(control);

    const wrapper = control.closest('.field') || control.parentElement;
    let label = null;
    if (control.id) label = form.querySelector(`label[for="${control.id}"]`);
    if (!label && wrapper) label = wrapper.querySelector('label');

    const rawLabel = label ? label.textContent : '';
    const required = control.hasAttribute('required')
      || control.getAttribute('aria-required') === 'true'
      || /\*/.test(rawLabel);
    const text = clean(rawLabel.replace(/\*/g, ''))
      || clean(control.getAttribute('placeholder'))
      || clean(control.getAttribute('aria-label'));
    if (!text) return;

    const typeCell = `${fieldType(control)}${required ? ', required' : ''}`;
    cells.push([text, typeCell]);
  });

  const button = form.querySelector('button[type="submit"], .contact__button button, button');
  const submit = button ? clean(button.textContent) || clean(button.getAttribute('aria-label')) : '';
  cells.push(['submit', submit || 'Senden']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'widget-contact', cells });
  element.replaceWith(block);
}
