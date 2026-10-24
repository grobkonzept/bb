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

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/hero-fullbleed.js
  var ORIGIN = "https://banditbunny.ch";
  function absUrl(url) {
    if (!url) return url;
    const u = url.trim();
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN}${u}`;
    return u;
  }
  function buildImage(document, srcImg) {
    if (!srcImg) return null;
    const img = document.createElement("img");
    let src = srcImg.getAttribute("src") || srcImg.getAttribute("data-src") || "";
    if (!src) {
      const srcset = srcImg.getAttribute("srcset") || "";
      src = srcset.split(",").map((s) => s.trim().split(/\s+/)[0]).filter(Boolean).pop() || "";
    }
    img.src = absUrl(src);
    img.alt = srcImg.getAttribute("alt") || "";
    return img;
  }
  function parse(element, { document }) {
    const cells = [];
    const img = buildImage(document, element.querySelector(".banner__media img, img"));
    if (img) cells.push([img]);
    const content = [];
    const heading = element.querySelector(".banner__heading, h1, h2, h3");
    if (heading) {
      const h = document.createElement(/^H[1-6]$/.test(heading.tagName) ? heading.tagName.toLowerCase() : "h2");
      h.textContent = heading.textContent.trim();
      content.push(h);
    }
    const sub = element.querySelector(".banner__text");
    if (sub && sub.textContent.trim()) {
      const p = document.createElement("p");
      p.textContent = sub.textContent.trim();
      content.push(p);
    }
    element.querySelectorAll(".banner__buttons a[href]").forEach((a) => {
      const p = document.createElement("p");
      const link = document.createElement("a");
      link.href = a.getAttribute("href");
      link.textContent = a.textContent.trim();
      p.append(link);
      content.push(p);
    });
    if (content.length) cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero-fullbleed", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-features.js
  var ORIGIN2 = "https://banditbunny.ch";
  function absUrl2(url) {
    if (!url) return url;
    const u = url.trim();
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN2}${u}`;
    return u;
  }
  function buildImage2(document, srcImg) {
    if (!srcImg) return null;
    const img = document.createElement("img");
    let src = srcImg.getAttribute("src") || srcImg.getAttribute("data-src") || "";
    if (!src) {
      const srcset = srcImg.getAttribute("srcset") || "";
      src = srcset.split(",").map((s) => s.trim().split(/\s+/)[0]).filter(Boolean).pop() || "";
    }
    img.src = absUrl2(src);
    img.alt = srcImg.getAttribute("alt") || "";
    return img;
  }
  function parse2(element, { document }) {
    const items = [...element.querySelectorAll(".multicolumn-list__item")];
    const cards = items.map((item) => {
      const imgEl = item.querySelector(".multicolumn-card__image-wrapper img, img");
      const image = buildImage2(document, imgEl);
      const text = [];
      const title = item.querySelector(".multicolumn-card__info h1, .multicolumn-card__info h2, .multicolumn-card__info h3, .multicolumn-card__info h4");
      if (title) {
        const h = document.createElement(title.tagName.toLowerCase());
        h.textContent = title.textContent.trim();
        text.push(h);
      }
      const rte = item.querySelector(".multicolumn-card__info .rte");
      if (rte) {
        [...rte.children].forEach((child) => {
          if (child.textContent.trim() || child.querySelector("img, a")) text.push(child);
        });
        if (!rte.children.length && rte.textContent.trim()) {
          const p = document.createElement("p");
          p.textContent = rte.textContent.trim();
          text.push(p);
        }
      }
      const link = item.querySelector(".multicolumn-card__info a.link, .multicolumn-card__info > a[href]");
      if (link && !(rte && rte.contains(link))) {
        const p = document.createElement("p");
        const a = document.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = link.textContent.trim();
        p.append(a);
        text.push(p);
      }
      return { image, text };
    }).filter((c) => c.text.length || c.image);
    const hasImages = cards.some((c) => c.image);
    const cells = cards.map((c) => hasImages ? [c.image || "", c.text] : [c.text]);
    const block = WebImporter.Blocks.createBlock(document, { name: "cards-features", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-product.js
  var ORIGIN3 = "https://banditbunny.ch";
  function absUrl3(url) {
    if (!url) return url;
    const u = url.trim();
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN3}${u}`;
    return u;
  }
  function buildImage3(document, srcImg) {
    if (!srcImg) return null;
    const img = document.createElement("img");
    let src = srcImg.getAttribute("src") || srcImg.getAttribute("data-src") || "";
    if (!src || src.startsWith("data:")) {
      const srcset = srcImg.getAttribute("srcset") || "";
      src = srcset.split(",").map((s) => s.trim().split(/\s+/)[0]).filter(Boolean).pop() || src;
    }
    img.src = absUrl3(src);
    img.alt = srcImg.getAttribute("alt") || "";
    return img;
  }
  function textP(document, text) {
    const p = document.createElement("p");
    p.textContent = text;
    return p;
  }
  function linkP(document, href, text) {
    const p = document.createElement("p");
    const a = document.createElement("a");
    a.href = href;
    a.textContent = text;
    p.append(a);
    return p;
  }
  var clean = (s) => (s || "").replace(/\s+/g, " ").trim();
  function parse3(element, { document }) {
    const mediaImg = [...element.querySelectorAll(".product__media img, .product__media-wrapper img")].find((i) => !(i.getAttribute("src") || "").startsWith("data:"));
    const image = buildImage3(document, mediaImg);
    const info = [];
    const container = element.querySelector(".product__info-container") || element;
    const title = container.querySelector(".product__title");
    const detailsLink = container.querySelector("a.product__view-details[href]");
    const productHref = detailsLink ? detailsLink.getAttribute("href") : "";
    const textParas = [...container.querySelectorAll(":scope > p.product__text")];
    const isBefore = (el) => title && el.compareDocumentPosition(title) & 4;
    textParas.filter(isBefore).forEach((p) => {
      const t = clean(p.textContent);
      if (t) info.push(textP(document, t));
    });
    if (title) {
      const h = document.createElement("h2");
      h.textContent = clean(title.textContent);
      info.push(h);
    }
    const price = clean((container.querySelector(".price__regular .price-item--regular") || container.querySelector(".price-item--sale") || { textContent: "" }).textContent);
    if (price) info.push(textP(document, price));
    const unitPrice = clean((container.querySelector(".unit-price .price-item") || { textContent: "" }).textContent);
    if (unitPrice) info.push(textP(document, unitPrice));
    const tax = container.querySelector(".product__tax");
    if (tax && clean(tax.textContent)) {
      const p = document.createElement("p");
      [...tax.childNodes].forEach((n) => {
        if (n.nodeType === 3) p.append(document.createTextNode(n.textContent.replace(/\s+/g, " ")));
        else if (n.tagName === "A") {
          const a = document.createElement("a");
          a.href = n.getAttribute("href");
          a.textContent = clean(n.textContent);
          p.append(a);
        } else p.append(document.createTextNode(` ${clean(n.textContent)} `));
      });
      info.push(p);
    }
    textParas.filter((p) => !isBefore(p)).forEach((p) => {
      const t = clean(p.textContent);
      if (!t) return;
      const np = document.createElement("p");
      np.innerHTML = p.innerHTML.replace(/<strong>(&nbsp;|\s)*<\/strong>/g, " ").trim();
      info.push(np);
    });
    const submit = container.querySelector(".product-form__submit");
    if (submit && productHref) {
      info.push(linkP(document, productHref, clean(submit.textContent) || "In den Warenkorb legen"));
    }
    if (detailsLink) {
      info.push(linkP(document, productHref, clean(detailsLink.textContent)));
    }
    const cells = [[image || "", info]];
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-product", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-alternating.js
  var ORIGIN4 = "https://banditbunny.ch";
  function absUrl4(url) {
    if (!url) return url;
    const u = url.trim();
    if (u.startsWith("//")) return `https:${u}`;
    if (u.startsWith("/")) return `${ORIGIN4}${u}`;
    return u;
  }
  function buildImage4(document, srcImg) {
    if (!srcImg) return null;
    const img = document.createElement("img");
    let src = srcImg.getAttribute("src") || srcImg.getAttribute("data-src") || "";
    if (!src || src.startsWith("data:")) {
      const srcset = srcImg.getAttribute("srcset") || "";
      src = srcset.split(",").map((s) => s.trim().split(/\s+/)[0]).filter(Boolean).pop() || src;
    }
    img.src = absUrl4(src);
    img.alt = srcImg.getAttribute("alt") || "";
    return img;
  }
  var clean2 = (s) => (s || "").replace(/\s+/g, " ").trim();
  function parse4(element, { document }) {
    const cells = [];
    [...element.querySelectorAll(".image-with-text")].forEach((item) => {
      const imgEl = [...item.querySelectorAll(".image-with-text__media img")].find((i) => !(i.getAttribute("src") || "").startsWith("data:"));
      const image = buildImage4(document, imgEl);
      const text = [];
      const content = item.querySelector(".image-with-text__content");
      if (content) {
        const caption = content.querySelector(".image-with-text__text--caption");
        if (caption && clean2(caption.textContent)) {
          const p = document.createElement("p");
          p.textContent = clean2(caption.textContent);
          text.push(p);
        }
        const heading = content.querySelector(".image-with-text__heading");
        if (heading && clean2(heading.textContent)) {
          const h = document.createElement(/^H[1-6]$/.test(heading.tagName) ? heading.tagName.toLowerCase() : "h2");
          h.textContent = clean2(heading.textContent);
          text.push(h);
        }
        const body = content.querySelector(".image-with-text__text.body, .image-with-text__text:not(.image-with-text__text--caption)");
        if (body) {
          [...body.children].forEach((child) => {
            if (clean2(child.textContent) || child.querySelector("img, a")) text.push(child);
          });
        }
        content.querySelectorAll("a.button[href]").forEach((btn) => {
          const p = document.createElement("p");
          const a = document.createElement("a");
          a.href = btn.getAttribute("href");
          a.textContent = clean2(btn.textContent);
          p.append(a);
          text.push(p);
        });
      }
      if (!image && !text.length) return;
      const reversed = !!item.querySelector(".image-with-text__grid--reverse");
      const imageCell = image || "";
      cells.push(reversed ? [text, imageCell] : [imageCell, text]);
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "columns-alternating", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  var clean3 = (s) => (s || "").replace(/\s+/g, " ").trim();
  function parse5(element, { document }) {
    const cells = [];
    element.querySelectorAll("details").forEach((details) => {
      const summary = details.querySelector("summary");
      if (!summary) return;
      const titleEl = summary.querySelector(".accordion__title, h1, h2, h3, h4, h5, h6") || summary;
      const question = clean3(titleEl.textContent);
      if (!question) return;
      const answer = [];
      const content = details.querySelector(".accordion__content");
      if (content) {
        [...content.children].forEach((child) => {
          while (child.lastChild && (child.lastChild.nodeName === "BR" || child.lastChild.nodeType === 3 && !child.lastChild.textContent.trim())) {
            child.lastChild.remove();
          }
          if (clean3(child.textContent) || child.querySelector("img, a")) answer.push(child);
        });
        if (!answer.length && clean3(content.textContent)) {
          const p = document.createElement("p");
          p.textContent = clean3(content.textContent);
          answer.push(p);
        }
      }
      cells.push([question, answer.length ? answer : ""]);
    });
    const header = element.querySelector(".collapsible-content__header");
    if (header && clean3(header.textContent)) {
      const heading = header.querySelector("h1, h2, h3, h4, h5, h6");
      if (heading) {
        const h = document.createElement(heading.tagName.toLowerCase());
        h.textContent = clean3(heading.textContent);
        element.before(h);
      }
      [...header.querySelectorAll(".collapsible-content__text, .rte")].forEach((t) => {
        if (clean3(t.textContent)) element.before(t);
      });
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/widget-newsletter.js
  var clean4 = (s) => (s || "").replace(/\s+/g, " ").trim();
  function parse6(element, { document }) {
    const emailInput = element.querySelector('input[type="email"], input.field__input');
    const label = element.querySelector(".field__label, label");
    const button = element.querySelector("button, .newsletter-form__button");
    const placeholder = clean4(label && label.textContent) || emailInput && clean4(emailInput.getAttribute("placeholder")) || "E-Mail";
    const submit = button && (clean4(button.getAttribute("aria-label")) || clean4(button.textContent)) || "Abonnieren";
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

  // tools/importer/import-home.js
  var PAGE_TEMPLATE = {
    "name": "home",
    "urls": [
      "https://banditbunny.ch/"
    ],
    "representativeUrl": "https://banditbunny.ch/",
    "description": "Homepage: full-bleed hero, feature cards, featured product, story, alternating brand-value rows, FAQ, newsletter, closing CTA",
    "blocks": [
      {
        "name": "hero-fullbleed",
        "instances": [
          '.shopify-section[id$="__image_banner"] .banner',
          '[id^="Banner-template"]'
        ]
      },
      {
        "name": "cards-features",
        "instances": [
          '.shopify-section[id*="__multicolumn_"] slider-component.slider-mobile-gutter'
        ]
      },
      {
        "name": "columns-product",
        "instances": [
          ".section-featured-product .product"
        ]
      },
      {
        "name": "columns-alternating",
        "instances": [
          '.shopify-section[id*="__multirow_"] .multirow__inner',
          ".multirow__inner"
        ]
      },
      {
        "name": "accordion-faq",
        "instances": [
          ".collapsible-content__wrapper"
        ]
      },
      {
        "name": "widget-newsletter",
        "instances": [
          "form.newsletter-form"
        ]
      }
    ],
    "urlPattern": "/",
    "sections": [
      {
        "id": "section-1",
        "name": "Hero banner",
        "selector": [
          '.shopify-section[id$="__image_banner"]',
          "#shopify-section-template--27651724017997__image_banner"
        ],
        "style": null,
        "blocks": [
          "hero-fullbleed"
        ],
        "defaultContent": []
      },
      {
        "id": "section-2",
        "name": "Warum Bandit Bunny",
        "selector": [
          '.shopify-section[id$="__multicolumn_yJDXR8"]',
          "#shopify-section-template--27651724017997__multicolumn_yJDXR8"
        ],
        "style": null,
        "blocks": [
          "cards-features"
        ],
        "defaultContent": [
          ".multicolumn .title-wrapper-with-link h2",
          ".multicolumn .center .button"
        ]
      },
      {
        "id": "section-3",
        "name": "Featured product - Insider Blend 47",
        "selector": [
          '.shopify-section[id$="__featured_product_FVqmAL"]',
          "#shopify-section-template--27651724017997__featured_product_FVqmAL"
        ],
        "style": null,
        "blocks": [
          "columns-product"
        ],
        "defaultContent": []
      },
      {
        "id": "section-4",
        "name": "Story",
        "selector": [
          '.shopify-section[id$="__rich_text_8iPBAc"]',
          "#shopify-section-template--27651724017997__rich_text_8iPBAc"
        ],
        "style": "rich-text",
        "blocks": [],
        "defaultContent": [
          ".rich-text__blocks"
        ]
      },
      {
        "id": "section-5",
        "name": "Brand values",
        "selector": [
          '.shopify-section[id$="__multirow_8C8cYi"]',
          "#shopify-section-template--27651724017997__multirow_8C8cYi"
        ],
        "style": null,
        "blocks": [
          "columns-alternating"
        ],
        "defaultContent": []
      },
      {
        "id": "section-6",
        "name": "FAQ",
        "selector": [
          '.shopify-section[id$="__collapsible_content_mExKVU"]',
          "#shopify-section-template--27651724017997__collapsible_content_mExKVU"
        ],
        "style": "centered",
        "blocks": [
          "accordion-faq"
        ],
        "defaultContent": [
          ".collapsible-content__header h2"
        ]
      },
      {
        "id": "section-7",
        "name": "Newsletter",
        "selector": [
          '.shopify-section[id$="__newsletter_QnnP9t"]',
          "#shopify-section-template--27651724017997__newsletter_QnnP9t"
        ],
        "style": "centered",
        "blocks": [
          "widget-newsletter"
        ],
        "defaultContent": [
          ".newsletter__wrapper h2",
          ".newsletter__subheading"
        ]
      },
      {
        "id": "section-8",
        "name": "Closing CTA",
        "selector": [
          '.shopify-section[id$="__rich_text_XLTFNU"]',
          "#shopify-section-template--27651724017997__rich_text_XLTFNU"
        ],
        "style": "centered, rich-text",
        "blocks": [],
        "defaultContent": [
          ".rich-text__blocks"
        ]
      }
    ]
  };
  var parsers = {
    "hero-fullbleed": parse,
    "cards-features": parse2,
    "columns-product": parse3,
    "columns-alternating": parse4,
    "accordion-faq": parse5,
    "widget-newsletter": parse6
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
  var import_home_default = {
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
  return __toCommonJS(import_home_exports);
})();
