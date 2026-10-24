/**
 * Fetches the footer fragment: /content first (local preview), then site root (DA/EDS).
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchFooter() {
  // metadata-independent: /content first (localhost), then root (DA/EDS prod)
  let resp = await fetch('/content/footer.plain.html');
  if (!resp.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), base: resp.url };
}

/**
 * Builds a row of images (e.g. payment methods); the section heading stays for screen readers.
 * @param {Element} section authored section
 * @param {string} base URL used to resolve relative image paths
 * @returns {Element}
 */
function buildImageRow(section, base) {
  const row = document.createElement('div');
  row.className = 'footer-icons';
  const heading = section.querySelector('h1, h2, h3, h4, h5, h6');
  const list = section.querySelector('ul') || document.createElement('ul');
  if (heading) {
    heading.className = 'footer-visually-hidden';
    row.append(heading);
    list.setAttribute('aria-label', heading.textContent.trim());
  }
  list.className = 'footer-icons-list';
  list.querySelectorAll('img').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), base).href;
    img.width = 38;
    img.height = 24;
    img.loading = 'lazy';
  });
  row.append(list);
  return row;
}

/**
 * Builds the legal row: copyright paragraph(s) followed by an inline link list.
 * @param {Element} section authored section
 * @returns {Element}
 */
function buildLegalRow(section) {
  const row = document.createElement('div');
  row.className = 'footer-legal';
  [...section.children].forEach((child) => {
    if (child.tagName === 'UL') {
      child.className = 'footer-legal-links';
      // drop whitespace between inline items so separators are spaced by CSS only
      [...child.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE && !node.textContent.trim())
        .forEach((node) => node.remove());
    } else {
      child.classList.add('footer-legal-text');
    }
    row.append(child);
  });
  return row;
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  if (!fragment) return;
  const container = document.createElement('div');
  container.innerHTML = fragment.html;

  block.textContent = '';
  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  [...container.children].filter((el) => el.tagName === 'DIV').forEach((section) => {
    inner.append(section.querySelector('img') ? buildImageRow(section, fragment.base) : buildLegalRow(section));
  });
  block.append(inner);
}
