/* eslint-disable */
/* global WebImporter */

const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

/**
 * Parser for widget-newsletter (base: widget).
 * Source: Shopify Dawn newsletter form (form.newsletter-form).
 * The section H2 and .newsletter__subheading are default content and are not touched.
 *
 * Output: one row, one cell with a widget link
 *   /widgets/newsletter/newsletter.html?placeholder=E-Mail&submit=Abonnieren
 * blocks/widget-newsletter reads placeholder/submit from the link query params and
 * renders a static form. Shopify hidden inputs (form_type, utf8, contact[tags]) and the
 * Shopify form action are ignored.
 */
export default function parse(element, { document }) {
  const emailInput = element.querySelector('input[type="email"], input.field__input');
  const label = element.querySelector('.field__label, label');
  const button = element.querySelector('button, .newsletter-form__button');

  const placeholder = clean(label && label.textContent)
    || (emailInput && clean(emailInput.getAttribute('placeholder')))
    || 'E-Mail';
  const submit = (button && (clean(button.getAttribute('aria-label')) || clean(button.textContent)))
    || 'Abonnieren';

  const params = new URLSearchParams();
  params.set('placeholder', placeholder);
  params.set('submit', submit);
  const href = `/widgets/newsletter/newsletter.html?${params.toString()}`;

  const p = document.createElement('p');
  const a = document.createElement('a');
  a.href = href;
  a.textContent = href;
  p.append(a);

  const cells = [[p]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'widget-newsletter', cells });
  element.replaceWith(block);
}
