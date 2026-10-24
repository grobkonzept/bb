// media query match that indicates desktop width
const isDesktop = window.matchMedia('(width >= 900px)');

// icons taken from the source theme (UI chrome, not authored content)
const ICONS = {
  hamburger: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 16" aria-hidden="true" focusable="false"><path fill="currentColor" d="M1 .5a.5.5 0 1 0 0 1h15.71a.5.5 0 0 0 0-1zM.5 8a.5.5 0 0 1 .5-.5h15.71a.5.5 0 0 1 0 1H1A.5.5 0 0 1 .5 8m0 7a.5.5 0 0 1 .5-.5h15.71a.5.5 0 0 1 0 1H1a.5.5 0 0 1-.5-.5"/></svg>',
  close: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 17" aria-hidden="true" focusable="false"><path fill="currentColor" d="M.865 15.978a.5.5 0 0 0 .707.707l7.433-7.431 7.579 7.282a.501.501 0 0 0 .846-.37.5.5 0 0 0-.153-.351L9.712 8.546l7.417-7.416a.5.5 0 1 0-.707-.708L8.991 7.853 1.413.573a.5.5 0 1 0-.693.72l7.563 7.268z"/></svg>',
  search: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 18 19" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M11.03 11.68A5.784 5.784 0 1 1 2.85 3.5a5.784 5.784 0 0 1 8.18 8.18m.26 1.12a6.78 6.78 0 1 1 .72-.7l5.4 5.4a.5.5 0 1 1-.71.7z" clip-rule="evenodd"/></svg>',
  cart: '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 40 40" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M15.75 11.8h-3.16l-.77 11.6a5 5 0 0 0 4.99 5.34h7.38a5 5 0 0 0 4.99-5.33L28.4 11.8zm0 1h-2.22l-.71 10.67a4 4 0 0 0 3.99 4.27h7.38a4 4 0 0 0 4-4.27l-.72-10.67h-2.22v.63a4.75 4.75 0 1 1-9.5 0zm8.5 0h-7.5v.63a3.75 3.75 0 1 0 7.5 0z" clip-rule="evenodd"/></svg>',
  caret: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 6" aria-hidden="true" focusable="false"><path fill="currentColor" fill-rule="evenodd" d="M9.354.646a.5.5 0 0 0-.708 0L5 4.293 1.354.646a.5.5 0 0 0-.708.708l4 4a.5.5 0 0 0 .708 0l4-4a.5.5 0 0 0 0-.708" clip-rule="evenodd"/></svg>',
};

// UI labels (German, matching the source theme)
const LABELS = {
  menu: 'Menü',
  closeMenu: 'Menü schließen',
  prev: 'Vorherige Ankündigung',
  next: 'Nächste Ankündigung',
  close: 'Schließen',
};

/**
 * Fetches the nav fragment: /content first (local preview), then site root (DA/EDS).
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchNav() {
  // metadata-independent: /content first (localhost), then root (DA/EDS prod)
  let resp = await fetch('/content/nav.plain.html');
  if (!resp.ok) resp = await fetch('/nav.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), base: resp.url };
}

/**
 * Normalizes a path for active-link comparison (strips /content prefix and /index).
 * @param {string} path
 * @returns {string}
 */
function normalizePath(path) {
  const p = path.replace(/^\/content(?=\/)/, '').replace(/\.html$/, '').replace(/\/index$/, '/');
  return p.replace(/(.)\/$/, '$1') || '/';
}

function createButton(className, label, iconHtml) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.setAttribute('aria-label', label);
  button.innerHTML = iconHtml;
  return button;
}

/**
 * Builds the announcement slider from a section of paragraphs.
 * @param {Element} section
 * @returns {Element|null}
 */
function buildAnnouncement(section) {
  const messages = [...section.querySelectorAll('p')].filter((p) => p.textContent.trim());
  if (!messages.length) return null;
  const bar = document.createElement('div');
  bar.className = 'header-announcement';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-roledescription', 'carousel');

  const track = document.createElement('div');
  track.className = 'header-announcement-track';
  messages.forEach((p, i) => {
    const slide = document.createElement('div');
    slide.className = 'header-announcement-slide';
    slide.setAttribute('aria-hidden', i === 0 ? 'false' : 'true');
    slide.append(p);
    track.append(slide);
  });
  const viewport = document.createElement('div');
  viewport.className = 'header-announcement-viewport';
  viewport.append(track);

  let index = 0;
  const show = (next) => {
    index = (next + messages.length) % messages.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    [...track.children].forEach((slide, i) => slide.setAttribute('aria-hidden', i === index ? 'false' : 'true'));
  };

  if (messages.length > 1) {
    const prev = createButton('header-announcement-button header-announcement-prev', LABELS.prev, ICONS.caret);
    const next = createButton('header-announcement-button header-announcement-next', LABELS.next, ICONS.caret);
    prev.addEventListener('click', () => show(index - 1));
    next.addEventListener('click', () => show(index + 1));
    bar.append(prev, viewport, next);
  } else {
    bar.append(viewport);
  }
  return bar;
}

/**
 * Builds the brand (logo) link, resolving image paths against the nav fragment URL.
 * @param {Element} section
 * @param {string} base
 * @returns {Element}
 */
function buildBrand(section, base) {
  const brand = document.createElement('div');
  brand.className = 'header-brand';
  const link = section.querySelector('a') || document.createElement('a');
  link.className = 'header-brand-link';
  link.querySelectorAll('img').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), base).href;
    img.width = 140;
    img.height = 83;
    img.loading = 'eager';
  });
  if (!link.textContent.trim() && !link.querySelector('img')) link.textContent = section.textContent.trim();
  brand.append(link);
  return brand;
}

/**
 * Builds the drawer menu from a list section and marks the current page link.
 * @param {Element} section
 * @returns {Element}
 */
function buildDrawer(section) {
  const drawer = document.createElement('nav');
  drawer.className = 'header-drawer';
  drawer.id = 'header-drawer';
  drawer.setAttribute('aria-label', LABELS.menu);
  drawer.hidden = true;
  const list = section.querySelector('ul') || document.createElement('ul');
  list.className = 'header-drawer-list';
  const current = normalizePath(window.location.pathname);
  list.querySelectorAll('a').forEach((a) => {
    a.className = 'header-drawer-link';
    const target = new URL(a.href, window.location);
    if (target.origin === window.location.origin && normalizePath(target.pathname) === current) {
      a.setAttribute('aria-current', 'page');
    }
  });
  drawer.append(list);
  return drawer;
}

/**
 * Builds the search panel form (submits to the authored search link).
 * @param {Element} link authored search link
 * @returns {Element}
 */
function buildSearchPanel(link) {
  const label = link.textContent.trim();
  const panel = document.createElement('div');
  panel.className = 'header-search';
  panel.id = 'header-search';
  panel.hidden = true;

  const form = document.createElement('form');
  form.className = 'header-search-form';
  form.action = link.href;
  form.method = 'get';
  form.setAttribute('role', 'search');

  const field = document.createElement('div');
  field.className = 'header-search-field';
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.id = 'header-search-input';
  input.placeholder = label;
  input.autocomplete = 'off';
  const inputLabel = document.createElement('label');
  inputLabel.htmlFor = input.id;
  inputLabel.textContent = label;
  const submit = createButton('header-search-submit', label, ICONS.search);
  submit.type = 'submit';
  field.append(input, inputLabel, submit);

  const close = createButton('header-search-close', LABELS.close, ICONS.close);
  form.append(field);
  panel.append(form, close);
  return panel;
}

/**
 * Builds the tool icons (search toggle + icon links) from a list section.
 * @param {Element} section
 * @returns {{tools: Element, searchPanel: Element|null}}
 */
function buildTools(section) {
  const tools = document.createElement('div');
  tools.className = 'header-tools';
  let searchPanel = null;
  section.querySelectorAll('a').forEach((a) => {
    const label = a.textContent.trim();
    const { pathname } = new URL(a.href, window.location);
    if (/search/.test(pathname) && !searchPanel) {
      searchPanel = buildSearchPanel(a);
      const toggle = createButton('header-icon header-search-toggle', label, ICONS.search);
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-controls', 'header-search');
      tools.append(toggle);
      return;
    }
    const icon = Object.keys(ICONS).find((key) => pathname.includes(key));
    a.className = 'header-icon';
    if (icon) {
      // keep the authored label as visually hidden text next to the icon
      const text = document.createElement('span');
      text.className = 'header-visually-hidden';
      text.textContent = label;
      a.innerHTML = ICONS[icon];
      a.append(text);
    }
    tools.append(a);
  });
  return { tools, searchPanel };
}

/**
 * Hides the header while scrolling down and shows it again on scroll up.
 * @param {Element} header the <header> element
 * @param {Element} block the header block
 */
function setupStickyHeader(header, block) {
  const announcement = block.querySelector('.header-announcement');
  const setOffset = () => {
    const offset = announcement ? announcement.offsetHeight : 0;
    header.style.setProperty('--header-announcement-height', `${offset}px`);
  };
  setOffset();
  if (announcement) new ResizeObserver(setOffset).observe(announcement);

  let lastY = window.scrollY;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    const panelOpen = block.classList.contains('is-drawer-open') || block.classList.contains('is-search-open');
    if (!panelOpen) {
      const pastHeader = y > header.offsetHeight;
      block.classList.toggle('is-scrolled', y > (announcement ? announcement.offsetHeight : 0));
      block.classList.toggle('is-hidden', pastHeader && y > lastY);
    }
    lastY = y;
  }, { passive: true });
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const nav = await fetchNav();
  if (!nav) return;
  const fragment = document.createElement('div');
  fragment.innerHTML = nav.html;
  const sections = [...fragment.children].filter((el) => el.tagName === 'DIV');

  // sections: announcement (paragraphs only), brand (link with image), menu list, tool list
  const brandSection = sections.find((s) => s.querySelector('img')) || sections.find((s) => s.querySelector('a') && !s.querySelector('ul'));
  const listSections = sections.filter((s) => s.querySelector('ul'));
  const announcementSection = sections.find((s) => s !== brandSection && !s.querySelector('ul') && !s.querySelector('a'));
  const [menuSection, toolsSection] = listSections;

  block.textContent = '';
  const announcement = announcementSection ? buildAnnouncement(announcementSection) : null;
  if (announcement) block.append(announcement);

  const main = document.createElement('div');
  main.className = 'header-main';
  const left = document.createElement('div');
  left.className = 'header-left';
  main.append(left);

  const drawer = menuSection ? buildDrawer(menuSection) : null;
  const hamburger = createButton(
    'header-icon header-hamburger',
    LABELS.menu,
    `<span class="header-hamburger-open">${ICONS.hamburger}</span><span class="header-hamburger-close">${ICONS.close}</span>`,
  );
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-controls', 'header-drawer');
  if (drawer) left.append(hamburger);

  if (brandSection) main.append(buildBrand(brandSection, nav.base));
  const { tools, searchPanel } = toolsSection ? buildTools(toolsSection) : { tools: document.createElement('div'), searchPanel: null };
  tools.className = 'header-tools';
  main.append(tools);
  if (searchPanel) main.append(searchPanel);
  // drawer hangs below the main row (the row is its containing block, as on the source)
  if (drawer) main.append(drawer);
  block.append(main);

  const overlay = document.createElement('div');
  overlay.className = 'header-overlay';
  block.append(overlay);

  const searchToggle = tools.querySelector('.header-search-toggle');

  // panels open below the header: expose its current bottom edge to CSS
  const setPanelTop = () => block.style.setProperty('--header-bottom', `${Math.max(0, block.getBoundingClientRect().bottom)}px`);

  const setDrawer = (open) => {
    if (!drawer) return;
    if (open) setPanelTop();
    block.classList.toggle('is-drawer-open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? LABELS.closeMenu : LABELS.menu);
    if (open) drawer.hidden = false;
    else window.setTimeout(() => { if (!block.classList.contains('is-drawer-open')) drawer.hidden = true; }, 200);
    document.body.style.overflow = open ? 'hidden' : '';
  };

  const setSearch = (open) => {
    if (!searchPanel) return;
    const wasOpen = block.classList.contains('is-search-open');
    if (open) setPanelTop();
    block.classList.toggle('is-search-open', open);
    searchPanel.hidden = !open;
    searchToggle.setAttribute('aria-expanded', String(open));
    if (open) searchPanel.querySelector('input').focus();
    else if (wasOpen) searchToggle.focus();
  };

  const closeAll = () => {
    if (block.classList.contains('is-drawer-open')) setDrawer(false);
    if (block.classList.contains('is-search-open')) setSearch(false);
  };

  hamburger.addEventListener('click', () => {
    const open = !block.classList.contains('is-drawer-open');
    if (open) setSearch(false);
    setDrawer(open);
  });
  if (searchToggle) {
    searchToggle.addEventListener('click', () => {
      setDrawer(false);
      setSearch(true);
    });
    searchPanel.querySelector('.header-search-close').addEventListener('click', () => setSearch(false));
  }
  overlay.addEventListener('click', closeAll);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const drawerWasOpen = block.classList.contains('is-drawer-open');
      closeAll();
      if (drawerWasOpen) hamburger.focus();
    }
  });
  // close open panels when crossing the desktop/mobile breakpoint
  isDesktop.addEventListener('change', closeAll);

  setupStickyHeader(block.closest('header') || block, block);
}
