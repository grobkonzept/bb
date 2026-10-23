/* eslint-disable */
/* global WebImporter */

import widgetContactParser from './parsers/widget-contact.js';
import widgetNewsletterParser from './parsers/widget-newsletter.js';
import cleanupTransformer from './transformers/banditbunny-cleanup.js';
import sectionsTransformer from './transformers/banditbunny-sections.js';

const PAGE_TEMPLATE = {
  "name": "pages",
  "urls": [
    "https://banditbunny.ch/pages/contact",
    "https://banditbunny.ch/pages/handleranfrage"
  ],
  "representativeUrl": "https://banditbunny.ch/pages/contact",
  "description": "Simple content pages (Kontakt, Händleranfrage): page title + optional intro, contact form, newsletter signup",
  "blocks": [
    {
      "name": "widget-contact",
      "instances": [
        "#ContactForm",
        ".shopify-section[id$=\"__form\"] form"
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
        ".shopify-section[id$=\"__main\"]",
        "#shopify-section-template--27651724083533__main"
      ],
      "style": "narrow",
      "blocks": [],
      "defaultContent": [
        ".shopify-section[id$=\"__main\"] h1",
        ".shopify-section[id$=\"__main\"] .rte"
      ]
    },
    {
      "id": "section-2",
      "name": "Contact form",
      "selector": [
        ".shopify-section[id$=\"__form\"]",
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
        ".shopify-section[id*=\"__newsletter_\"]",
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

const parsers = {
  'widget-contact': widgetContactParser,
  'widget-newsletter': widgetNewsletterParser,
};

const transformers = [cleanupTransformer, sectionsTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
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

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers('afterTransform', main, payload);

    main.appendChild(document.createElement('hr'));
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};
