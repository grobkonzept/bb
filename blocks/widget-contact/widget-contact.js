/*
 * Widget (contact): multi-field contact form.
 *
 * Like widget-newsletter, this block renders the form locally. It does NOT fetch
 * /widgets/... assets and does NOT post to Shopify or any other default endpoint.
 *
 * Authoring (one row per field, plus optional config rows):
 *  | Name          | text            |
 *  | E-Mail        | email, required |
 *  | Telefonnummer | tel             |
 *  | Kommentar     | textarea        |
 *  | submit        | Senden          |   button label
 *  | success       | Danke ...       |   message shown after a successful submit
 *  | action        | https://...     |   optional endpoint; form data is POSTed as JSON
 *
 * Without an `action` row the form is validated in the browser and the success text is
 * shown, but the submission is NOT sent anywhere.
 */

const CONFIG_KEYS = ['submit', 'success', 'action'];
const FIELD_TYPES = ['text', 'email', 'tel', 'textarea'];
const SHORT_TYPES = ['text', 'email'];

const DEFAULT_CONFIG = {
  submit: 'Senden',
  success: 'Danke für deine Nachricht. Wir melden uns so schnell wie möglich.',
  action: '',
};

const DEFAULT_FIELDS = [
  { label: 'Name', type: 'text', required: false },
  { label: 'E-Mail', type: 'email', required: true },
  { label: 'Telefonnummer', type: 'tel', required: false },
  { label: 'Kommentar', type: 'textarea', required: false },
];

const MESSAGES = {
  required: 'Bitte fülle dieses Feld aus.',
  email: 'Bitte gib eine gültige E-Mail-Adresse ein.',
  tel: 'Bitte gib eine gültige Telefonnummer ein.',
  invalid: 'Bitte überprüfe deine Eingabe.',
  summary: 'Bitte korrigiere die markierten Felder.',
  sending: 'Wird gesendet …',
  error: 'Deine Nachricht konnte leider nicht gesendet werden. Bitte versuche es später erneut.',
};

const AUTOCOMPLETE = { email: 'email', tel: 'tel' };

function normalizeKey(text) {
  return (text || '').trim().toLowerCase().replace(/[^a-z]/g, '');
}

/**
 * Derives a form field name from its label, e.g. "E-Mail" -> "e-mail".
 * @param {string} label Visible label
 * @returns {string}
 */
function toFieldName(label) {
  return label
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'field';
}

/**
 * Parses the type cell, e.g. "email, required" -> { type: 'email', required: true }.
 * Unknown or missing type falls back to text.
 * @param {string} text Type cell text
 */
function parseType(text) {
  const tokens = (text || '').toLowerCase().split(/[,;\s]+/).filter(Boolean);
  const type = tokens.find((t) => FIELD_TYPES.includes(t)) || 'text';
  const required = tokens.some((t) => ['required', 'pflicht', 'pflichtfeld', '*'].includes(t));
  return { type, required };
}

/**
 * Accepts only real URLs for the action so placeholder text never becomes an endpoint.
 * @param {string} value Authored action value
 * @returns {string} absolute URL or empty string
 */
function parseAction(value) {
  const v = (value || '').trim();
  if (!/^(https?:\/\/|\/)/i.test(v)) return '';
  try {
    const url = new URL(v, window.location.href);
    return /^https?:$/.test(url.protocol) ? url.href : '';
  } catch {
    return '';
  }
}

/**
 * A one-cell row counts as a field label (type defaults to text) only if it is a short,
 * plain line of text. Anything richer is kept as intro content.
 * @param {Element} cell The only cell of a row
 */
function isBareLabel(cell) {
  const text = cell.textContent.trim();
  if (!text || text.length > 40) return false;
  if (cell.querySelector('a, picture, img, h1, h2, h3, h4, h5, h6, ul, ol')) return false;
  return cell.querySelectorAll('p').length <= 1;
}

/**
 * Removes /widgets/ links and nested base widget blocks that buildAutoBlocks may create.
 * @param {Element} cell A block cell
 */
function stripWidgetLinks(cell) {
  cell.querySelectorAll('div').forEach((d) => {
    if (d.classList.contains('widget')) d.remove();
  });
  cell.querySelectorAll('a[href*="/widgets/"]').forEach((a) => {
    const p = a.closest('p');
    if (p && p.textContent.trim() === a.textContent.trim()) p.remove();
    else a.remove();
  });
}

/**
 * Reads fields, config and free intro content from the authored rows.
 * @param {Element} block The block element
 */
function readBlock(block) {
  const config = { ...DEFAULT_CONFIG };
  const fields = [];
  const extra = [];

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;
    cells.forEach(stripWidgetLinks);

    const first = cells[0];
    const key = normalizeKey(first.textContent);

    if (cells.length >= 2 && CONFIG_KEYS.includes(key)) {
      const valueCell = cells[1];
      if (key === 'action') {
        const link = valueCell.querySelector('a[href]');
        config.action = parseAction(link ? link.getAttribute('href') : valueCell.textContent);
      } else {
        const value = valueCell.textContent.trim();
        if (value) config[key] = value;
      }
      return;
    }

    const label = first.textContent.trim().replace(/\s*\*\s*$/, '');
    if (cells.length >= 2 && label && isBareLabel(first)) {
      const parsed = parseType(cells[1].textContent);
      if (/\*\s*$/.test(first.textContent.trim())) parsed.required = true;
      fields.push({ label, ...parsed });
      return;
    }

    if (cells.length === 1 && label && isBareLabel(first) && !CONFIG_KEYS.includes(key)) {
      fields.push({ label, type: 'text', required: /\*\s*$/.test(first.textContent.trim()) });
      return;
    }

    cells.forEach((cell) => {
      if (cell.textContent.trim() || cell.querySelector('picture, img')) {
        extra.push(...cell.childNodes);
      }
    });
  });

  return { config, fields: fields.length ? fields : DEFAULT_FIELDS.map((f) => ({ ...f })), extra };
}

let idCounter = 0;

/**
 * Builds one labelled field with its inline error element.
 * @param {object} field Parsed field definition
 * @param {string} prefix Unique id prefix for this block instance
 * @param {Set<string>} usedNames Names already taken in this form
 */
function buildField(field, prefix, usedNames) {
  let name = toFieldName(field.label);
  let n = 2;
  while (usedNames.has(name)) {
    name = `${toFieldName(field.label)}-${n}`;
    n += 1;
  }
  usedNames.add(name);

  const id = `${prefix}-${name}`;
  const errorId = `${id}-error`;

  const wrapper = document.createElement('div');
  wrapper.className = `widget-contact-field widget-contact-field-${field.type}`;
  wrapper.classList.add(SHORT_TYPES.includes(field.type) ? 'widget-contact-field-short' : 'widget-contact-field-full');

  const label = document.createElement('label');
  label.className = 'widget-contact-label';
  label.htmlFor = id;
  label.textContent = field.label;
  if (field.required) {
    const marker = document.createElement('span');
    marker.className = 'widget-contact-required';
    marker.setAttribute('aria-hidden', 'true');
    marker.textContent = ' *';
    label.append(marker);
  }

  let control;
  if (field.type === 'textarea') {
    control = document.createElement('textarea');
    control.rows = 10;
  } else {
    control = document.createElement('input');
    control.type = field.type;
    if (field.type === 'tel') control.inputMode = 'tel';
  }
  control.className = 'widget-contact-control';
  // The placeholder is hidden by CSS; it only drives the :placeholder-shown floating label.
  control.placeholder = field.label;
  control.id = id;
  control.name = name;
  control.required = field.required;
  if (field.required) control.setAttribute('aria-required', 'true');
  if (AUTOCOMPLETE[field.type]) control.autocomplete = AUTOCOMPLETE[field.type];
  else if (/^name$/i.test(field.label)) control.autocomplete = 'name';
  control.setAttribute('aria-describedby', errorId);

  const error = document.createElement('p');
  error.className = 'widget-contact-error';
  error.id = errorId;

  wrapper.append(label, control, error);
  return { wrapper, control, error };
}

/**
 * German validation message for a control, or empty string when valid.
 * @param {HTMLInputElement|HTMLTextAreaElement} control Form control
 */
function validationMessage(control) {
  const value = control.value.trim();
  if (control.required && !value) return MESSAGES.required;
  if (!value) return '';
  if (control.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return MESSAGES.email;
  if (control.type === 'tel' && !/^[+()\d\s/.-]{5,}$/.test(value)) return MESSAGES.tel;
  if (control.validity && !control.validity.valid && !control.validity.valueMissing) {
    return MESSAGES.invalid;
  }
  return '';
}

/**
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const { config, fields, extra } = readBlock(block);
  idCounter += 1;
  const prefix = `widget-contact-${idCounter}`;

  const form = document.createElement('form');
  form.className = 'widget-contact-form';
  form.noValidate = true;
  form.setAttribute('aria-label', 'Kontaktformular');
  form.dataset.submission = config.action ? 'endpoint' : 'none';

  const grid = document.createElement('div');
  grid.className = 'widget-contact-fields';

  const usedNames = new Set();
  const controls = fields.map((field) => {
    const built = buildField(field, prefix, usedNames);
    grid.append(built.wrapper);
    return built;
  });

  const actions = document.createElement('div');
  actions.className = 'widget-contact-actions';
  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'button primary widget-contact-submit';
  button.textContent = config.submit;
  actions.append(button);

  const status = document.createElement('p');
  status.className = 'widget-contact-status';
  status.id = `${prefix}-status`;
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');

  form.append(grid, actions, status);

  const setStatus = (text, state) => {
    status.textContent = text;
    status.classList.remove('success', 'error', 'pending');
    if (state) status.classList.add(state);
  };

  const validateControl = ({ control, error, wrapper }) => {
    const message = validationMessage(control);
    error.textContent = message;
    wrapper.classList.toggle('invalid', !!message);
    if (message) control.setAttribute('aria-invalid', 'true');
    else control.removeAttribute('aria-invalid');
    return !message;
  };

  controls.forEach((c) => {
    const revalidate = () => {
      if (form.classList.contains('validated')) validateControl(c);
    };
    c.control.addEventListener('input', revalidate);
    c.control.addEventListener('blur', revalidate);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.classList.contains('sending')) return;
    form.classList.add('validated');

    const invalid = controls.filter((c) => !validateControl(c));
    if (invalid.length) {
      setStatus(MESSAGES.summary, 'error');
      invalid[0].control.focus();
      return;
    }

    const done = () => {
      form.reset();
      form.classList.remove('validated');
      controls.forEach(({ control, error, wrapper }) => {
        error.textContent = '';
        wrapper.classList.remove('invalid');
        control.removeAttribute('aria-invalid');
      });
      setStatus(config.success, 'success');
    };

    // No endpoint configured: validate only, show the success text, send nothing.
    if (!config.action) {
      done();
      return;
    }

    const data = {};
    controls.forEach(({ control }) => { data[control.name] = control.value.trim(); });

    form.classList.add('sending');
    form.setAttribute('aria-busy', 'true');
    button.disabled = true;
    setStatus(MESSAGES.sending, 'pending');
    try {
      const resp = await fetch(config.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      done();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('widget-contact: submission failed', err);
      setStatus(MESSAGES.error, 'error');
    } finally {
      form.classList.remove('sending');
      form.removeAttribute('aria-busy');
      button.disabled = false;
    }
  });

  const children = [];
  if (extra.length) {
    const intro = document.createElement('div');
    intro.className = 'widget-contact-intro';
    intro.append(...extra);
    children.push(intro);
  }
  children.push(form);
  block.replaceChildren(...children);
}
