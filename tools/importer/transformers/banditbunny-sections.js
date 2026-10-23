/* eslint-disable */
/* global WebImporter */

/**
 * Section transformer for banditbunny.ch.
 * Uses payload.template.sections (selector arrays tried in order) to insert
 * section breaks (<hr>) and Section Metadata blocks for styled sections.
 */
const MARKER = 'data-excat-section-id';

function findSection(element, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (const sel of selectors) {
    if (!sel) continue;
    try {
      const el = element.querySelector(sel);
      if (el) return el;
    } catch (e) {
      // invalid selector, try next
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = payload && payload.template && payload.template.sections;
  if (!sections || sections.length < 2) return;
  const document = element.ownerDocument;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSection(element, section);
      if (!el) continue;
      if (i > 0 || section.style) {
        const hr = document.createElement('hr');
        if (section.style) hr.setAttribute(MARKER, section.id);
        if (i === 0) hr.setAttribute('data-excat-first-section', 'true');
        el.parentNode.insertBefore(hr, el);
      }
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
      if (!section.style) continue;

      const metadata = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });

      if (marker) {
        // Section content runs from the marker to the next <hr> (or end).
        let last = marker;
        let next = marker.nextElementSibling;
        while (next && next.tagName !== 'HR') {
          last = next;
          next = next.nextElementSibling;
        }
        last.after(metadata);
        marker.removeAttribute(MARKER);
        if (marker.hasAttribute('data-excat-first-section')) marker.remove();
      } else {
        const el = findSection(element, section);
        if (el) el.after(metadata);
      }
    }
    element.querySelectorAll('hr[data-excat-first-section]').forEach((hr) => hr.remove());
  }
}
