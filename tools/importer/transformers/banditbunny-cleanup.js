/* eslint-disable */
/* global WebImporter */

/**
 * Cleanup transformer for banditbunny.ch (Shopify Dawn-style theme).
 * Removes non-authorable theme chrome. Page content sections inside <main>
 * (image banner, multicolumn, featured product, rich text, multirow,
 * collapsible content, newsletter) are kept.
 */
export default function transform(hookName, element, payload) {
  if (hookName === 'beforeTransform') {
    WebImporter.DOMUtils.remove(element, [
      // header group + announcement bar
      '.shopify-section-group-header-group',
      '.announcement-bar-section',
      'sticky-header',
      'header-drawer',
      // footer group
      '.shopify-section-group-footer-group',
      // cart
      'shop-cart-sync',
      'cart-drawer',
      'cart-notification',
      '#CartDrawer',
      // empty slideshow section
      '.shopify-section[id*="__slideshow_"]',
      // product form widgets (not authorable)
      'quantity-input',
      'variant-selects',
      'variant-radios',
      'script[type="application/json"]',
      '.product-form__error-message-wrapper',
      '.loading__spinner',
      // modal / dialog utilities (modal-opener is kept: it wraps the product image)
      'product-modal',
      'details-modal',
      'predictive-search',
      'dialog',
      '.product__media-toggle',
      '.slider-buttons',
      // skip links and a11y helper messages
      '.skip-to-content-link',
      '#a11y-refresh-page-message',
      '#a11y-new-window-message',
      // screen-reader-only headings (e.g. "Kontaktformular"); blocks label themselves
      'h1.visually-hidden',
      'h2.visually-hidden',
      'h3.visually-hidden',
      // tracking
      '#web-pixels-manager-sandbox-container',
      'iframe[id^="web-pixel-sandbox"]',
      // assets
      'script',
      'style',
      'noscript',
      'link',
    ]);

    // Remove the now-empty a11y message list
    element.querySelectorAll('ul').forEach((ul) => {
      if (!ul.children.length && !ul.textContent.trim()) ul.remove();
    });
  }

  if (hookName === 'afterTransform') {
    // Default-content CTAs: Dawn primary buttons -> <strong> (EDS primary button),
    // secondary/outline buttons -> <em> (EDS secondary button). Block tables keep their own markup.
    const document = element.ownerDocument;
    element.querySelectorAll('a.button').forEach((a) => {
      if (a.closest('table') || a.closest('strong, em')) return;
      const wrapper = document.createElement(a.classList.contains('button--secondary') ? 'em' : 'strong');
      a.replaceWith(wrapper);
      wrapper.append(a);
      if (!wrapper.parentElement || wrapper.parentElement.tagName !== 'P') {
        const p = document.createElement('p');
        wrapper.replaceWith(p);
        p.append(wrapper);
      }
    });

    // Inline SVG data-URI icons (chevrons, arrows, plus icons) are theme chrome
    element.querySelectorAll('img[src^="data:image/svg"]').forEach((img) => img.remove());
    element.querySelectorAll('.svg-wrapper').forEach((el) => {
      if (!el.textContent.trim() && !el.querySelector('img, picture')) el.remove();
    });

    WebImporter.DOMUtils.remove(element, [
      'script',
      'style',
      'noscript',
      'link',
      'iframe',
    ]);

    // Strip tracking / theme runtime attributes
    element.querySelectorAll('*').forEach((el) => {
      [...el.attributes].forEach((attr) => {
        if (/^(data-(track|analytics|shopify|section)|onclick|onload)/i.test(attr.name)) {
          el.removeAttribute(attr.name);
        }
      });
    });
  }
}
