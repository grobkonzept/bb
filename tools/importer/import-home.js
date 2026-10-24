/* eslint-disable */
/* global WebImporter */

import heroFullbleedParser from './parsers/hero-fullbleed.js';
import cardsFeaturesParser from './parsers/cards-features.js';
import columnsProductParser from './parsers/columns-product.js';
import columnsAlternatingParser from './parsers/columns-alternating.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import widgetNewsletterParser from './parsers/widget-newsletter.js';
import cleanupTransformer from './transformers/banditbunny-cleanup.js';
import sectionsTransformer from './transformers/banditbunny-sections.js';

const PAGE_TEMPLATE = {
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
        ".shopify-section[id$=\"__image_banner\"] .banner",
        "[id^=\"Banner-template\"]"
      ]
    },
    {
      "name": "cards-features",
      "instances": [
        ".shopify-section[id*=\"__multicolumn_\"] slider-component.slider-mobile-gutter"
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
        ".shopify-section[id*=\"__multirow_\"] .multirow__inner",
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
        ".shopify-section[id$=\"__image_banner\"]",
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
        ".shopify-section[id$=\"__multicolumn_yJDXR8\"]",
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
        ".shopify-section[id$=\"__featured_product_FVqmAL\"]",
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
        ".shopify-section[id$=\"__rich_text_8iPBAc\"]",
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
        ".shopify-section[id$=\"__multirow_8C8cYi\"]",
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
        ".shopify-section[id$=\"__collapsible_content_mExKVU\"]",
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
        ".shopify-section[id$=\"__newsletter_QnnP9t\"]",
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
        ".shopify-section[id$=\"__rich_text_XLTFNU\"]",
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

const parsers = {
  'hero-fullbleed': heroFullbleedParser,
  'cards-features': cardsFeaturesParser,
  'columns-product': columnsProductParser,
  'columns-alternating': columnsAlternatingParser,
  'accordion-faq': accordionFaqParser,
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
