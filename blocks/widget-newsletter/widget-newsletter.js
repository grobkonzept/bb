/*
 * Widget (newsletter): static email signup form.
 *
 * Unlike the base `widget` block, this block does NOT fetch /widgets/... assets and
 * does NOT post to any commerce/newsletter endpoint. It renders the form locally.
 *
 * Configuration (all optional, first match wins):
 *  - Query params on an authored link, e.g. /widgets/newsletter/newsletter.html?placeholder=E-Mail
 *  - Key/value rows: | placeholder | E-Mail |, | submit | Abonnieren |, | success | ... |,
 *    | action | https://... |
 * Supported keys: placeholder, submit (button label), success (message after submit),
 * action (optional form action URL; when absent the form never leaves the page).
 */

const DEFAULTS = {
  placeholder: 'E-Mail',
  submit: 'Abonnieren',
  success: 'Danke! Wir melden uns bald bei dir.',
  action: '',
};

const KEYS = Object.keys(DEFAULTS);

const ARROW_ICON = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 10" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M8.537.808a.5.5 0 0 1 .817-.162l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 1 1-.708-.708L11.793 5.5H1a.5.5 0 0 1 0-1h10.793L8.646 1.354a.5.5 0 0 1-.109-.546" clip-rule="evenodd"/></svg>';

function normalizeKey(text) {
  return (text || '').trim().toLowerCase().replace(/[^a-z]/g, '');
}

/**
 * Reads config from authored links and key/value rows.
 * @param {Element} block The block element
 * @returns {{config: object, extra: Node[]}} config plus any free content to keep
 */
function readConfig(block) {
  const config = { ...DEFAULTS };
  const extra = [];

  // link query params (the base widget authoring style)
  block.querySelectorAll('a[href]').forEach((a) => {
    try {
      const url = new URL(a.href, window.location.href);
      if (!url.pathname.includes('/widgets/')) return;
      url.searchParams.forEach((value, key) => {
        const k = normalizeKey(key);
        if (KEYS.includes(k) && value) config[k] = value;
      });
    } catch { /* ignore malformed hrefs */ }
  });

  // key/value rows; anything else that isn't a widget link is kept as intro content
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const key = cells.length >= 2 ? normalizeKey(cells[0].textContent) : '';
    if (KEYS.includes(key)) {
      const link = cells[1].querySelector('a[href]');
      const value = key === 'action' && link ? link.href : cells[1].textContent.trim();
      if (value) config[key] = value;
      return;
    }
    cells.forEach((cell) => {
      // drop widget links (and the nested base widget block that buildAutoBlocks wraps them in)
      cell.querySelectorAll('div').forEach((d) => {
        if (d.classList.contains('widget')) d.remove();
      });
      cell.querySelectorAll('a[href*="/widgets/"]').forEach((a) => {
        const p = a.closest('p');
        if (p && p.textContent.trim() === a.textContent.trim()) p.remove();
        else a.remove();
      });
      if (cell.textContent.trim() || cell.querySelector('picture, img')) {
        extra.push(...cell.childNodes);
      }
    });
  });

  return { config, extra };
}

let idCounter = 0;

/**
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const { config, extra } = readConfig(block);
  idCounter += 1;
  const inputId = `widget-newsletter-email-${idCounter}`;
  const statusId = `${inputId}-status`;

  const form = document.createElement('form');
  form.className = 'widget-newsletter-form';
  form.noValidate = true;
  if (config.action) {
    form.action = config.action;
    form.method = 'post';
  }

  const label = document.createElement('label');
  label.className = 'widget-newsletter-label';
  label.htmlFor = inputId;
  label.textContent = config.placeholder;

  const field = document.createElement('div');
  field.className = 'widget-newsletter-field';

  const input = document.createElement('input');
  input.type = 'email';
  input.name = 'email';
  input.id = inputId;
  input.required = true;
  input.autocomplete = 'email';
  input.placeholder = config.placeholder;
  input.setAttribute('aria-describedby', statusId);

  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'widget-newsletter-submit';
  button.setAttribute('aria-label', config.submit);
  button.innerHTML = ARROW_ICON;

  // input before label so CSS can float the label (input:focus ~ label)
  field.append(input, label, button);

  const status = document.createElement('p');
  status.className = 'widget-newsletter-status';
  status.id = statusId;
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  form.append(field, status);

  form.addEventListener('submit', (e) => {
    if (!input.checkValidity()) {
      e.preventDefault();
      form.classList.add('invalid');
      status.textContent = input.validationMessage;
      input.focus();
      return;
    }
    form.classList.remove('invalid');
    // with an explicit action the browser submits natively; otherwise stay on the page
    if (config.action) return;
    e.preventDefault();
    form.classList.add('submitted');
    status.textContent = config.success;
    input.value = '';
  });

  input.addEventListener('input', () => {
    if (form.classList.contains('invalid') && input.checkValidity()) {
      form.classList.remove('invalid');
      status.textContent = '';
    }
  });

  const children = [];
  if (extra.length) {
    const intro = document.createElement('div');
    intro.className = 'widget-newsletter-intro';
    intro.append(...extra);
    children.push(intro);
  }
  children.push(form);
  block.replaceChildren(...children);
}
