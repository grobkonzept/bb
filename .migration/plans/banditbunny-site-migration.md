# banditbunny.ch Full-Site Migration Plan

## Status
**The plan is approved, but it can't start until you switch to Execute mode.** I'm still in plan mode, where I can only read files. That means I can't fetch the live site, run imports or write anything, and saying "go ahead" again won't change the mode. Please switch to **Execute mode** and send any message, such as "start". I'll begin at the URL discovery step right away.

## Overview
Move the entire **https://banditbunny.ch/** site to AEM Edge Delivery Services (Document Authoring project `grobkonzept/bb`). The scope covers every page, plus design styling, header/navigation and footer. The site has no shop pages, so the standard content migration applies and the commerce add-on is not needed.

## Confirmed Decisions
- **Scope:** the whole site.
- **Extras:** design styling, header/navigation and footer are all included.
- **Commerce:** none.
- **Go-ahead:** given. The only thing still needed is Execute mode.

## Current State
- The project is set up as Document Authoring and previews on `grobkonzept/bb`.
- Starter blocks already exist: `cards`, `columns`, `footer`, `fragment`, `header`, `hero`, `widget`. These get reused or extended before any new block is created.
- `scripts/aem.js` is vendored and will not be changed.
- Repo rules: CSS stays scoped to each block, block code handles missing or extra cells, and there's no build step.

## Approach
1. **Discovery and catalog:** find all URLs (sitemap first, crawl as fallback) and group pages into templates. **Checkpoint:** I'll show you the template list and URL counts to confirm before migrating anything.
2. **Per-template migration:** analyze one representative page per template, decide which block variants each section needs (an existing variant is reused when it's at least 80% similar), map them, and build the import parsers, transformers and scripts.
3. **Blocks:** generate or extend block code for any variant the starter blocks don't cover.
4. **Bulk import:** run the import for all URLs in each template, then check every imported page for content that differs from the original and fix the import scripts in a loop.
5. **Global design:** pull design tokens from the original site (colors, fonts, spacing) into the global styles, then style each block from the original's measured styles.
6. **Header/navigation:** rebuild it from screenshots for desktop and mobile, including dropdown behavior, and check it against the original.
7. **Footer:** rebuild it the same way and check it on desktop and mobile.
8. **Visual QA:** compare every page side by side with the original and fix differences.

## Surfaces Affected
- **Local workspace:** all code and content changes.
- **Document Authoring, EDS preview and live:** **not touched** unless you explicitly ask for an upload or publish.
- **Git:** nothing is committed or pushed without your go-ahead. If a PR is opened, it will include the `{branch}--bb--grobkonzept.aem.page/{path}` preview link the repo requires.

## Checklist
- [ ] **You:** switch to Execute mode and send a message to start
- [ ] Discover all site URLs via sitemap or crawl
- [ ] Group URLs into page templates and build the site catalog
- [ ] Review the templates and URL counts with you and confirm scope
- [ ] Analyze a representative page for each template (sections, blocks, variants)
- [ ] Decide block variants for each template, reusing existing ones where possible
- [ ] Add block and section mappings for each template
- [ ] Generate import parsers and transformers
- [ ] Generate an import script for each template
- [ ] Generate or extend block code for new variants (starting from cards, columns, hero, etc.)
- [ ] Run the bulk import for all URLs in each template
- [ ] Check imported pages and fix divergent ones through the fix loop
- [ ] Pull global design tokens (colors, fonts, spacing) into the global styles
- [ ] Style each migrated block to match the original site
- [ ] Migrate the header/navigation (desktop, mobile, dropdowns) and check it
- [ ] Migrate the footer (desktop, mobile) and check it
- [ ] Compare all pages visually with the original and apply fixes
- [ ] Final check in the local preview, then a summary of what changed and where (local only unless you request upload or publish)

## Open Items (resolved during execution)
- The number of templates and pages, plus any special pages (forms, embeds, blog listings). Forms may call for the optional forms add-on, which I'll offer if needed.
- Whether the site is multilingual (.ch sites often have DE/FR/EN versions), which affects folder structure and nav fragments.
