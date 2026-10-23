/* eslint-disable */
/* global WebImporter */

import cleanupTransformer from './transformers/banditbunny-cleanup.js';
import sectionsTransformer from './transformers/banditbunny-sections.js';

const PAGE_TEMPLATE = {
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
        ".shopify-section[id$=\"__main\"]"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".shopify-section[id$=\"__main\"] h1"
      ]
    }
  ]
};

const parsers = {};

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
