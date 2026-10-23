/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-pages.js
  var import_pages_exports = {};
  __export(import_pages_exports, {
    default: () => import_pages_default
  });

  // tools/importer/parsers/widget-contact.js
  var clean = (s) => (s || "").replace(/\s+/g, " ").trim();
  var KNOWN_TYPES = ["text", "email", "tel", "textarea"];
  function fieldType(control) {
    if (control.tagName.toLowerCase() === "textarea") return "textarea";
    const attr = (control.getAttribute("type") || "").toLowerCase();
    if (KNOWN_TYPES.includes(attr)) return attr;
    const hint = `${control.id || ""} ${control.getAttribute("name") || ""} ${control.getAttribute("autocomplete") || ""}`.toLowerCase();
    if (/email/.test(hint)) return "email";
    if (/phone|tel/.test(hint)) return "tel";
    return "text";
  }
  function parse(element, { document }) {
    const form = element.matches("form") ? element : element.querySelector("form") || element;
    const cells = [];
    const seen = /* @__PURE__ */ new Set();
    const controls = form.querySelectorAll("input, textarea, select");
    controls.forEach((control) => {
      const type = (control.getAttribute("type") || "").toLowerCase();
      if (["hidden", "submit", "button", "reset", "image"].includes(type)) return;
      if (seen.has(control)) return;
      seen.add(control);
      const wrapper = control.closest(".field") || control.parentElement;
      let label = null;
      if (control.id) label = form.querySelector(`label[for="${control.id}"]`);
      if (!label && wrapper) label = wrapper.querySelector("label");
      const rawLabel = label ? label.textContent : "";
      const required = control.hasAttribute("required") || control.getAttribute("aria-required") === "true" || /\*/.test(rawLabel);
      const text = clean(rawLabel.replace(/\*/g, "")) || clean(control.getAttribute("placeholder")) || clean(control.getAttribute("aria-label"));
      if (!text) return;
      const typeCell = `${fieldType(control)}${required ? ", required" : ""}`;
      cells.push([text, typeCell]);
    });
    const button = form.querySelector('button[type="submit"], .contact__button button, button');
    const submit = button ? clean(button.textContent) || clean(button.getAttribute("aria-label")) : "";
    cells.push(["submit", submit || "Senden"]);
    const block = WebImporter.Blocks.createBlock(document, { name: "widget-contact", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/widget-newsletter.js
  var clean2 = (s) => (s || "").replace(/\s+/g, " ").trim();
  function parse2(element, { document }) {
    const emailInput = element.querySelector('input[type="email"], input.field__input');
    const label = element.querySelector(".field__label, label");
    const button = element.querySelector("button, .newsletter-form__button");
    const placeholder = clean2(label && label.textContent) || emailInput && clean2(emailInput.getAttribute("placeholder")) || "E-Mail";
    const submit = button && (clean2(button.getAttribute("aria-label")) || clean2(button.textContent)) || "Abonnieren";
    const params = new URLSearchParams();
    params.set("placeholder", placeholder);
    params.set("submit", submit);
    const href = `/widgets/newsletter/newsletter.html?${params.toString()}`;
    const p = document.createElement("p");
    const a = document.createElement("a");
    a.href = href;
    a.textContent = href;
    p.append(a);
    const cells = [[p]];
    const block = WebImporter.Blocks.createBlock(document, { name: "widget-newsletter", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/banditbunny-cleanup.js
  function transform(hookName, element, payload) {
    if (hookName === "beforeTransform") {
      WebImporter.DOMUtils.remove(element, [
        // header group + announcement bar
        ".shopify-section-group-header-group",
        ".announcement-bar-section",
        "sticky-header",
        "header-drawer",
        // footer group
        ".shopify-section-group-footer-group",
        // cart
        "shop-cart-sync",
        "cart-drawer",
        "cart-notification",
        "#CartDrawer",
        // empty slideshow section
        '.shopify-section[id*="__slideshow_"]',
        // product form widgets (not authorable)
        "quantity-input",
        "variant-selects",
        "variant-radios",
        'script[type="application/json"]',
        ".product-form__error-message-wrapper",
        ".loading__spinner",
        // modal / dialog utilities (modal-opener is kept: it wraps the product image)
        "product-modal",
        "details-modal",
        "predictive-search",
        "dialog",
        ".product__media-toggle",
        ".slider-buttons",
        // skip links and a11y helper messages
        ".skip-to-content-link",
        "#a11y-refresh-page-message",
        "#a11y-new-window-message",
        // screen-reader-only headings (e.g. "Kontaktformular"); blocks label themselves
        "h1.visually-hidden",
        "h2.visually-hidden",
        "h3.visually-hidden",
        // tracking
        "#web-pixels-manager-sandbox-container",
        'iframe[id^="web-pixel-sandbox"]',
        // assets
        "script",
        "style",
        "noscript",
        "link"
      ]);
      element.querySelectorAll("ul").forEach((ul) => {
        if (!ul.children.length && !ul.textContent.trim()) ul.remove();
      });
    }
    if (hookName === "afterTransform") {
      const document = element.ownerDocument;
      element.querySelectorAll("a.button").forEach((a) => {
        if (a.closest("table") || a.closest("strong, em")) return;
        const wrapper = document.createElement(a.classList.contains("button--secondary") ? "em" : "strong");
        a.replaceWith(wrapper);
        wrapper.append(a);
        if (!wrapper.parentElement || wrapper.parentElement.tagName !== "P") {
          const p = document.createElement("p");
          wrapper.replaceWith(p);
          p.append(wrapper);
        }
      });
      element.querySelectorAll('img[src^="data:image/svg"]').forEach((img) => img.remove());
      element.querySelectorAll(".svg-wrapper").forEach((el) => {
        if (!el.textContent.trim() && !el.querySelector("img, picture")) el.remove();
      });
      WebImporter.DOMUtils.remove(element, [
        "script",
        "style",
        "noscript",
        "link",
        "iframe"
      ]);
      element.querySelectorAll("*").forEach((el) => {
        [...el.attributes].forEach((attr) => {
          if (/^(data-(track|analytics|shopify|section)|onclick|onload)/i.test(attr.name)) {
            el.removeAttribute(attr.name);
          }
        });
      });
    }
  }

  // tools/importer/transformers/banditbunny-sections.js
  var MARKER = "data-excat-section-id";
  function findSection(element, section) {
    const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
    for (const sel of selectors) {
      if (!sel) continue;
      try {
        const el = element.querySelector(sel);
        if (el) return el;
      } catch (e) {
      }
    }
    return null;
  }
  function transform2(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections;
    if (!sections || sections.length < 2) return;
    const document = element.ownerDocument;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const el = findSection(element, section);
        if (!el) continue;
        if (i > 0 || section.style) {
          const hr = document.createElement("hr");
          if (section.style) hr.setAttribute(MARKER, section.id);
          if (i === 0) hr.setAttribute("data-excat-first-section", "true");
          el.parentNode.insertBefore(hr, el);
        }
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
        if (!section.style) continue;
        const metadata = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        if (marker) {
          let last = marker;
          let next = marker.nextElementSibling;
          while (next && next.tagName !== "HR") {
            last = next;
            next = next.nextElementSibling;
          }
          last.after(metadata);
          marker.removeAttribute(MARKER);
          if (marker.hasAttribute("data-excat-first-section")) marker.remove();
        } else {
          const el = findSection(element, section);
          if (el) el.after(metadata);
        }
      }
      element.querySelectorAll("hr[data-excat-first-section]").forEach((hr) => hr.remove());
    }
  }

  // tools/importer/import-pages.js
  var PAGE_TEMPLATE = {
    "name": "pages",
    "urls": [
      "https://banditbunny.ch/pages/contact",
      "https://banditbunny.ch/pages/handleranfrage"
    ],
    "representativeUrl": "https://banditbunny.ch/pages/contact",
    "description": "Simple content pages (Kontakt, H\xE4ndleranfrage): page title + optional intro, contact form, newsletter signup",
    "blocks": [
      {
        "name": "widget-contact",
        "instances": [
          "#ContactForm",
          '.shopify-section[id$="__form"] form'
        ]
      },
      {
        "name": "widget-newsletter",
        "instances": [
          "form.newsletter-form"
        ]
      }
    ],
    "urlPattern": "/pages/*",
    "sections": [
      {
        "id": "section-1",
        "name": "Page title",
        "selector": [
          '.shopify-section[id$="__main"]',
          "#shopify-section-template--27651724083533__main"
        ],
        "style": "narrow",
        "blocks": [],
        "defaultContent": [
          '.shopify-section[id$="__main"] h1',
          '.shopify-section[id$="__main"] .rte'
        ]
      },
      {
        "id": "section-2",
        "name": "Contact form",
        "selector": [
          '.shopify-section[id$="__form"]',
          "#shopify-section-template--27651724083533__form"
        ],
        "style": "narrow",
        "blocks": [
          "widget-contact"
        ],
        "defaultContent": []
      },
      {
        "id": "section-3",
        "name": "Newsletter",
        "selector": [
          '.shopify-section[id*="__newsletter_"]',
          "#shopify-section-template--27651724083533__newsletter_4D7CgT"
        ],
        "style": "centered",
        "blocks": [
          "widget-newsletter"
        ],
        "defaultContent": [
          ".newsletter__wrapper h2",
          ".newsletter__subheading"
        ]
      }
    ]
  };
  var parsers = {
    "widget-contact": parse,
    "widget-newsletter": parse2
  };
  var transformers = [transform, transform2];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((fn) => {
      try {
        fn(hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        document.querySelectorAll(selector).forEach((element) => {
          pageBlocks.push({ name: blockDef.name, selector, element });
        });
      });
    });
    return pageBlocks;
  }
  var import_pages_default = {
    transform: (payload) => {
      const { document, url, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (!parser) return;
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      });
      executeTransformers("afterTransform", main, payload);
      main.appendChild(document.createElement("hr"));
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) }
      }];
    }
  };
  return __toCommonJS(import_pages_exports);
})();
