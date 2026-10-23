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

  // tools/importer/import-blogs.js
  var import_blogs_exports = {};
  __export(import_blogs_exports, {
    default: () => import_blogs_default
  });

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

  // tools/importer/import-blogs.js
  var PAGE_TEMPLATE = {
    "name": "blogs",
    "urls": [
      "https://banditbunny.ch/blogs/neuigkeiten"
    ],
    "representativeUrl": "https://banditbunny.ch/blogs/neuigkeiten",
    "description": "Blog listing (Neuigkeiten): page title; article grid currently empty",
    "blocks": [],
    "urlPattern": "/blogs/*",
    "sections": [
      {
        "id": "section-1",
        "name": "Blog listing title",
        "selector": [
          "#MainContent",
          '.shopify-section[id$="__main"]'
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          '.shopify-section[id$="__main"] h1'
        ]
      }
    ]
  };
  var parsers = {};
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
  var import_blogs_default = {
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
  return __toCommonJS(import_blogs_exports);
})();
