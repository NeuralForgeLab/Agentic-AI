---
id: 003
title: Add Urdu Translation Option
stage: green
date: 2026-01-08
surface: agent
model: claude-opus-4-5-20251101
feature: physical-ai-textbook
branch: master
user: user
command: user request
labels: ["i18n", "urdu", "translation", "rtl", "localization"]
links:
  spec: specs/physical-ai-textbook/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - physical-ai-textbook/docusaurus.config.ts
  - physical-ai-textbook/i18n/ur/docusaurus-theme-classic/navbar.json
  - physical-ai-textbook/i18n/ur/docusaurus-theme-classic/footer.json
  - physical-ai-textbook/i18n/ur/docusaurus-plugin-content-docs/current.json
  - physical-ai-textbook/i18n/ur/docusaurus-plugin-content-docs/current/intro/index.md
  - physical-ai-textbook/i18n/ur/docusaurus-plugin-content-docs/current/ros2/index.md
  - physical-ai-textbook/i18n/ur/docusaurus-plugin-content-docs/current/simulation/index.md
  - physical-ai-textbook/i18n/ur/docusaurus-plugin-content-docs/current/isaac-sim/index.md
  - physical-ai-textbook/i18n/ur/docusaurus-plugin-content-docs/current/vla-models/index.md
  - physical-ai-textbook/i18n/ur/docusaurus-plugin-content-docs/current/humanoid/index.md
  - physical-ai-textbook/i18n/ur/docusaurus-plugin-content-docs-podcast/current/index.md
  - physical-ai-textbook/i18n/ur/docusaurus-plugin-content-docs-podcast/current/episodes/ep01-physical-ai.md
  - physical-ai-textbook/i18n/ur/docusaurus-plugin-content-docs-podcast/current/episodes/ep02-ros2.md
  - physical-ai-textbook/i18n/ur/docusaurus-plugin-content-docs-podcast/current/episodes/ep03-simulation.md
  - physical-ai-textbook/i18n/ur/docusaurus-plugin-content-docs-podcast/current/episodes/ep04-isaac-sim.md
  - physical-ai-textbook/i18n/ur/docusaurus-plugin-content-docs-podcast/current/episodes/ep05-vla-models.md
  - physical-ai-textbook/i18n/ur/docusaurus-plugin-content-docs-podcast/current/episodes/ep06-humanoid.md
tests:
  - npm run build (PASS - both en and ur locales)
---

## Prompt

add urdu translation option in the book

## Response snapshot

Successfully added complete Urdu translation support to the Physical AI Textbook:

1. **i18n Configuration**: Updated docusaurus.config.ts with Urdu locale (ur) including RTL direction support
2. **Locale Dropdown**: Added language switcher in navbar
3. **UI Translations**: Created navbar.json and footer.json with Urdu translations for all UI elements
4. **Documentation**: Translated all 6 chapters (intro, ros2, simulation, isaac-sim, vla-models, humanoid) to Urdu
5. **Podcast Pages**: Translated podcast index and all 6 episode pages to Urdu
6. **Build Verified**: Both English and Urdu locales build successfully

Key features:
- RTL (Right-to-Left) text direction for Urdu
- Complete navbar and footer translations
- All chapter content translated with proper Urdu typography
- Podcast episode transcripts in Urdu

## Outcome

- ✅ Impact: Full Urdu language support added with RTL layout
- 🧪 Tests: npm run build PASS (both locales)
- 📁 Files: 17+ files created/modified
- 🔁 Next prompts: Add more languages, improve translations with native speakers
- 🧠 Reflection: Docusaurus i18n requires careful path handling for links in translated content

## Evaluation notes (flywheel)

- Failure modes observed: Broken links due to duplicate locale prefix (/ur/ur/), file naming mismatch (ep05-vla vs ep05-vla-models)
- Graders run and results (PASS/FAIL): Build - PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Add automated translation verification script
